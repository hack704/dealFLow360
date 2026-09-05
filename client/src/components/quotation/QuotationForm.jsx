import React, { useState, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import customerService from '../../services/customerService';
import productService from '../../services/productService';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Plus, Building2, Package, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const QuotationForm = () => {
  const {
    customer,
    setCustomer,
    title,
    setTitle,
    paymentTermsDays,
    setPaymentTermsDays,
    addItem
  } = useQuotation();

  const [customers, setCustomers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers(),
          productService.getProducts()
        ]);
        if (custRes?.data) setCustomers(custRes.data);
        if (prodRes?.data) setCatalog(prodRes.data);

        // Default select first customer if none
        if (custRes?.data?.length > 0 && !customer) {
          setCustomer(custRes.data[0]);
          setTitle(`Enterprise Agreement - ${custRes.data[0].name}`);
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    const found = customers.find((c) => c._id === custId);
    if (found) {
      setCustomer(found);
      if (!title || title.startsWith('Enterprise Agreement')) {
        setTitle(`Enterprise Agreement - ${found.name}`);
      }
      setPaymentTermsDays(found.paymentTermsDays || 30);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const prod = catalog.find((p) => p._id === selectedProductId);
    if (prod) {
      addItem(prod);
      setSelectedProductId('');
    }
  };

  return (
    <Card className="mb-6 border-slate-800 bg-slate-900/60">
      <CardHeader>
        <div className="flex items-center space-x-2.5">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <CardTitle>Deal Profile & Target Account</CardTitle>
        </div>
        {customer && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Account Tier:</span>
            <Badge variant="primary">{customer.tier || 'Mid-Market'}</Badge>
            <span className="text-slate-400 ml-2">Credit:</span>
            <Badge variant="success">{customer.creditRating || 'AAA'}</Badge>
          </div>
        )}
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Select
            label="Target Customer Organization"
            value={customer?._id || ''}
            onChange={handleCustomerChange}
            options={customers.map((c) => ({
              value: c._id,
              label: `${c.name} (${c.tier} - Rating ${c.creditRating})`
            }))}
          />
        </div>

        <div>
          <Input
            label="Quotation / Opportunity Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q1 Global Multi-Year Cloud Contract"
          />
        </div>

        <div>
          <Select
            label="Contract Net Payment Terms"
            value={paymentTermsDays}
            onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
            options={[
              { value: 15, label: 'Net 15 Days' },
              { value: 30, label: 'Net 30 Days (Standard)' },
              { value: 45, label: 'Net 45 Days' },
              { value: 60, label: 'Net 60 Days' }
            ]}
          />
        </div>
      </div>

      {/* Quick Add Product from Catalog Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-2/3 flex items-center space-x-2">
          <Package className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select a product or service from catalog...</option>
            {catalog.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {formatCurrency(p.basePrice)} ({p.category})
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleAddProduct}
          disabled={!selectedProductId}
          variant="primary"
          size="sm"
          icon={Plus}
          className="w-full sm:w-auto"
        >
          Add to Quote Configuration
        </Button>
      </div>
    </Card>
  );
};

export default QuotationForm;
