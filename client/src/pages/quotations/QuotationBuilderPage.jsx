import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotation } from '../../context/QuotationContext';
import quotationService from '../../services/quotationService';
import customerService from '../../services/customerService';
import productService from '../../services/productService';
import QuotationForm from '../../components/quotation/QuotationForm';
import QuotationItemsTable from '../../components/quotation/QuotationItemsTable';
import DiscountSummary from '../../components/quotation/DiscountSummary';
import BlendedRiskCard from '../../components/quotation/BlendedRiskCard';
import UpsellPanel from '../../components/quotation/UpsellPanel';
import Button from '../../components/common/Button';
import { Send, Save, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

export const QuotationBuilderPage = () => {
  const navigate = useNavigate();
  const {
    customer,
    setCustomer,
    items,
    setItems,
    title,
    setTitle,
    notes,
    paymentTermsDays,
    calculation,
    resetBuilder
  } = useQuotation();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAutoFillDemo = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerService.getCustomers(),
        productService.getProducts()
      ]);
      const custs = custRes?.data || [];
      const prods = prodRes?.data || [];

      const targetCust = custs.find((c) => c.name?.includes('Acme')) || custs[0] || {
        _id: 'cust-demo-1',
        name: 'Acme Global Enterprises',
        tier: 'Gold'
      };
      setCustomer(targetCust);
      if (setTitle) {
        setTitle(`Enterprise Agreement - ${targetCust.name}`);
      }

      const hardware = prods.find((p) => p.category === 'Hardware') || {
        _id: 'p-demo-hw',
        name: 'Laptop Pro 14',
        category: 'Hardware',
        basePrice: 1200,
        unitCost: 750,
        sku: 'HW-LAP-14'
      };
      const service = prods.find((p) => p.category === 'Services') || {
        _id: 'p-demo-srv',
        name: 'Onsite Setup Service',
        category: 'Services',
        basePrice: 450,
        unitCost: 150,
        sku: 'SRV-SETUP'
      };
      const sub = prods.find((p) => p.category === 'Subscription') || {
        _id: 'p-demo-sub',
        name: 'Care Plan 2 years',
        category: 'Subscription',
        basePrice: 180,
        unitCost: 40,
        sku: 'SUB-CARE-2Y'
      };

      setItems([
        {
          product: hardware,
          productId: hardware._id,
          productName: hardware.name,
          sku: hardware.sku,
          category: hardware.category,
          listPrice: hardware.basePrice,
          unitCost: hardware.unitCost,
          quantity: 20,
          discountPercent: 18 // Exceeds Hardware 15% threshold!
        },
        {
          product: service,
          productId: service._id,
          productName: service.name,
          sku: service.sku,
          category: service.category,
          listPrice: service.basePrice,
          unitCost: service.unitCost,
          quantity: 2,
          discountPercent: 12 // Exceeds Services 10% threshold!
        },
        {
          product: sub,
          productId: sub._id,
          productName: sub.name,
          sku: sub.sku,
          category: sub.category,
          listPrice: sub.basePrice,
          unitCost: sub.unitCost,
          quantity: 20,
          discountPercent: 5
        }
      ]);
      setSuccessMessage('Loaded Hackathon Demo Enterprise Deal: 3 lines, blended discount exceptions & recurring lines!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Auto fill demo error:', err);
    }
  };

  const handleSaveQuote = async (status = 'draft') => {
    if (!customer) {
      setErrorMessage('Please select a customer before saving the quotation.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Please add at least one line item to the quotation.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      const payload = {
        customerId: customer._id || customer,
        title: title || `Enterprise Quote for ${customer.name}`,
        notes,
        paymentTermsDays,
        status,
        submitForApproval: status === 'pending_approval',
        items: items.map((it) => ({
          productId: it.productId || it.product?._id || it.product,
          quantity: it.quantity,
          discountPercent: it.discountPercent || 0
        }))
      };

      const res = await quotationService.createQuotation(payload);
      if (res && res.data) {
        setSuccessMessage(`Quotation ${res.data.quotationNumber} successfully submitted for approval!`);
        setTimeout(() => {
          resetBuilder();
          if (status === 'draft') {
            navigate(`/quotations/${res.data._id}`);
          } else {
            navigate(`/approvals/${res.data._id}`);
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Error creating quote:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <button
            onClick={() => navigate('/quotations')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] inline-flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all quotes</span>
          </button>
          <h2 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">Configure, Price, Quote CPQ Builder</h2>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Build enterprise proposals with live volume curves, blended margin risk guardrails, and automated discount rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            onClick={handleAutoFillDemo}
            variant="secondary"
            size="md"
            icon={Sparkles}
          >
            Auto-Fill Demo Deal
          </Button>

          <Button
            onClick={() => handleSaveQuote('draft')}
            disabled={saving || items.length === 0}
            variant="outline"
            size="md"
            icon={Save}
          >
            Save Draft
          </Button>

          <Button
            onClick={() => handleSaveQuote('pending_approval')}
            disabled={saving || items.length === 0}
            loading={saving}
            variant="primary"
            size="md"
            icon={Send}
          >
            Submit for Approval
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/30 text-[#1b7a36] dark:text-[#30d158] text-[13px] flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-[#34c759] dark:text-[#30d158]" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/30 text-[#c9342c] dark:text-[#ff453a] text-[13px]">
          {errorMessage}
        </div>
      )}

      {/* Main Form: Customer & Target Deal Info */}
      <QuotationForm />

      {/* Two Column Workspace: Left = Items & Upsells, Right = Financial Summary & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <QuotationItemsTable />
          <UpsellPanel />
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          <DiscountSummary />
          <BlendedRiskCard />
        </div>
      </div>
    </div>
  );
};

export default QuotationBuilderPage;
