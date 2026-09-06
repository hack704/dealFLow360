import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Send, Save, ArrowLeft, CheckCircle, Sparkles, Truck } from 'lucide-react';

export const QuotationBuilderPage = () => {
  const { id } = useParams();
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
    loadQuotation,
    resetBuilder
  } = useQuotation();

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing quotation into builder if ID provided in route
  useEffect(() => {
    if (id) {
      const fetchExisting = async () => {
        try {
          const res = await quotationService.getQuotationById(id);
          if (res?.data) {
            loadQuotation(res.data);
          }
        } catch (err) {
          console.warn('Could not load quote into builder:', err.message);
        }
      };
      fetchExisting();
    }
  }, [id]);

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

      const hardware = prods.find((p) => p.category === 'Hardware') || prods[0];
      const service = prods.find((p) => p.category === 'Services') || prods[1] || prods[0];
      const sub = prods.find((p) => p.category === 'Subscription') || prods[2] || prods[0];

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

  const handleSaveQuote = async (actionType = 'draft') => {
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
      const isFulfillmentDirect = actionType === 'straight_to_fulfillment';
      const targetStatus = isFulfillmentDirect ? 'approved' : actionType === 'pending_approval' ? 'pending_approval' : 'draft';

      const payload = {
        customerId: customer._id || customer,
        title: title || `Enterprise Quote for ${customer.name}`,
        notes,
        paymentTermsDays,
        status: targetStatus,
        submitForApproval: actionType === 'pending_approval',
        items: items.map((it) => ({
          productId: it.productId || it.product?._id || it.product,
          quantity: it.quantity,
          discountPercent: it.discountPercent || 0
        }))
      };

      let quoteResultId = id;
      if (id) {
        await quotationService.updateQuotation(id, payload);
      } else {
        const res = await quotationService.createQuotation(payload);
        quoteResultId = res?.data?._id || res?.data?.quotationNumber || quoteResultId;
      }

      if (isFulfillmentDirect) {
        setSuccessMessage('Quote confirmed with zero approval triggers! Proceeding straight to fulfillment...');
        setTimeout(() => {
          resetBuilder();
          navigate(`/fulfillment/${quoteResultId}`);
        }, 1000);
      } else if (actionType === 'pending_approval') {
        setSuccessMessage('Quotation submitted for governance review! Moving to approval screen...');
        setTimeout(() => {
          resetBuilder();
          navigate(`/approvals/${quoteResultId}`);
        }, 1000);
      } else {
        setSuccessMessage('Draft quotation successfully saved.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving quote:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save quotation');
    } finally {
      setSaving(false);
    }
  };

  const requiresApproval = calculation?.requiresApproval ?? false;

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
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
              {id ? `Edit Deal Builder (${id})` : 'Quotation Builder (Products + Cart)'}
            </h2>
            {id && (
              <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] font-mono font-medium">
                Active Deal Loaded
              </span>
            )}
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Pick products across categories, adjust quantities, apply discounts, and move to approval or fulfillment.
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

          {/* B3 requirement: Confirm and move to approval, or straight to fulfillment if no approval is required */}
          {requiresApproval ? (
            <Button
              onClick={() => handleSaveQuote('pending_approval')}
              disabled={saving || items.length === 0}
              loading={saving}
              variant="primary"
              size="md"
              icon={Send}
              title="Move to approval chain since discount ceiling is exceeded"
            >
              Confirm & Move to Approval
            </Button>
          ) : (
            <Button
              onClick={() => handleSaveQuote('straight_to_fulfillment')}
              disabled={saving || items.length === 0}
              loading={saving}
              variant="success"
              size="md"
              icon={Truck}
              title="No approval required — move straight to warehouse fulfillment"
            >
              Confirm & Straight to Fulfillment →
            </Button>
          )}
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

      {/* Two Column Workspace: Left = Items & Upsells (Central Module), Right = Financial Summary & Risk (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Central Column (8 of 12 cols = expanded space for items & upsells) */}
        <div className="lg:col-span-8 space-y-6">
          <QuotationItemsTable />
          <UpsellPanel />
        </div>

        {/* Right Sidebar Column (4 of 12 cols = compact commercial summary) */}
        <div className="lg:col-span-4 space-y-5">
          <DiscountSummary />
          <BlendedRiskCard />
        </div>
      </div>
    </div>
  );
};

export default QuotationBuilderPage;
