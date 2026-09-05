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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/quotations')}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all quotes</span>
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight">Configure, Price, Quote (CPQ) Builder</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build enterprise proposals with live volume curves, blended margin risk guardrails, and automated discount rules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => handleSaveQuote('draft')}
            disabled={saving || items.length === 0}
            variant="outline"
            icon={Save}
          >
            Save Draft
          </Button>

          <Button
            onClick={() => handleSaveQuote(calculation?.requiresApproval ? 'pending_approval' : 'approved')}
            disabled={saving || items.length === 0}
            loading={saving}
            variant="primary"
            icon={Send}
            className="shadow-lg shadow-indigo-950"
          >
            {calculation?.requiresApproval ? 'Submit for Approval' : 'Generate Official Quote'}
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Main Form: Customer & Target Deal Info */}
      <QuotationForm />

      {/* Two Column Workspace: Left = Items & Upsells, Right = Financial Summary & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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
