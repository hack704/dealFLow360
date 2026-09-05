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
    <Card className="mb-8 p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
      <CardHeader className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <CardTitle className="text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Deal Profile & Target Account</CardTitle>
            <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">Commercial parameters and contractual baseline</p>
          </div>
        </div>
        {customer && (
          <div className="flex items-center space-x-2 text-[12px]">
            <span className="text-[#6e6e73] dark:text-[#86868b]">Tier:</span>
            <Badge variant="primary" size="sm">{customer.tier || 'Mid-Market'}</Badge>
            <span className="text-[#6e6e73] dark:text-[#86868b] ml-2">Credit:</span>
            <Badge variant="success" size="sm">{customer.creditRating || 'AAA'}</Badge>
          </div>
        )}
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
      <div className="pt-5 border-t border-black/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-2/3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full h-11 bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-xl px-3.5 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] transition-all"
          >
            <option value="" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7]">Select a product or service from catalog...</option>
            {catalog.map((p) => (
              <option key={p._id} value={p._id} className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7]">
                {p.name} — {formatCurrency(p.basePrice)} ({p.category})
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleAddProduct}
          disabled={!selectedProductId}
          variant="primary"
          size="md"
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
