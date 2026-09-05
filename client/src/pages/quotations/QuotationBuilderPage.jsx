import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotation } from '../../context/QuotationContext';
import quotationService from '../../services/quotationService';
import QuotationForm from '../../components/quotation/QuotationForm';
import QuotationItemsTable from '../../components/quotation/QuotationItemsTable';
import DiscountSummary from '../../components/quotation/DiscountSummary';
import BlendedRiskCard from '../../components/quotation/BlendedRiskCard';
import UpsellPanel from '../../components/quotation/UpsellPanel';
import Button from '../../components/common/Button';
import { Send, Save, ArrowLeft, CheckCircle } from 'lucide-react';

export const QuotationBuilderPage = () => {
  const navigate = useNavigate();
  const {
    customer,
    items,
    title,
    notes,
    paymentTermsDays,
    calculation,
    resetBuilder
  } = useQuotation();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
        items: items.map((it) => ({
          productId: it.productId || it.product?._id || it.product,
          quantity: it.quantity,
          discountPercent: it.discountPercent || 0
        }))
      };

      const res = await quotationService.createQuotation(payload);
      if (res && res.data) {
        setSuccessMessage(`Quotation ${res.data.quotationNumber} successfully generated!`);
        setTimeout(() => {
          resetBuilder();
          navigate(`/quotations/${res.data._id}`);
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

        <div className="flex items-center space-x-3">
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
            onClick={() => handleSaveQuote(calculation?.requiresApproval ? 'pending_approval' : 'approved')}
            disabled={saving || items.length === 0}
            loading={saving}
            variant="primary"
            size="md"
            icon={Send}
          >
            {calculation?.requiresApproval ? 'Submit for Approval' : 'Generate Official Quote'}
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
