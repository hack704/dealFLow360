import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import quotationService from '../services/quotationService';
import useDebounce from '../hooks/useDebounce';

const QuotationContext = createContext(null);

export const QuotationProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);

  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  const debouncedItems = useDebounce(items, 250);

  // Recalculate preview whenever items or customer change
  const refreshCalculation = useCallback(async () => {
    if (!customer || items.length === 0) {
      setCalculation(null);
      return;
    }

    setCalculating(true);
    setError(null);
    try {
      const payload = {
        customerId: customer._id || customer,
        items: items.map((it) => ({
          productId: it.productId || it.product._id || it.product,
          quantity: it.quantity,
          discountPercent: it.discountPercent || 0,
          listPrice: it.listPrice,
          unitCost: it.unitCost,
          productName: it.productName
        }))
      };

      const res = await quotationService.calculatePreview(payload);
      if (res && res.data) {
        setCalculation(res.data);
      }
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.response?.data?.message || 'Failed to calculate quote pricing');
    } finally {
      setCalculating(false);
    }
  }, [customer, items]);

  useEffect(() => {
    refreshCalculation();
  }, [customer, debouncedItems, refreshCalculation]);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => (item.product._id || item.product) === product._id);
      if (existing) {
        return prev.map((item) =>
          (item.product._id || item.product) === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          listPrice: product.basePrice,
          unitCost: product.unitCost,
          quantity: 1,
          discountPercent: 0
        }
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((it) => (it.product._id || it.product) !== productId));
  };

  const updateItemQuantity = (productId, quantity) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    setItems((prev) =>
      prev.map((it) => ((it.product._id || it.product) === productId ? { ...it, quantity: qty } : it))
    );
  };

  const updateItemDiscount = (productId, discountPercent) => {
    const discount = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
    setItems((prev) =>
      prev.map((it) =>
        (it.product._id || it.product) === productId ? { ...it, discountPercent: discount } : it
      )
    );
  };

  const resetBuilder = () => {
    setCustomer(null);
    setItems([]);
    setTitle('');
    setNotes('');
    setCalculation(null);
  };

  return (
    <QuotationContext.Provider
      value={{
        customer,
        setCustomer,
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        updateItemDiscount,
        title,
        setTitle,
        notes,
        setNotes,
        paymentTermsDays,
        setPaymentTermsDays,
        calculation,
        calculating,
        error,
        resetBuilder,
        refreshCalculation
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};

export default QuotationContext;
