import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Package,
  Layers,
  Warehouse,
  Repeat,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  DollarSign,
  Truck,
  Plus,
  ArrowRight,
  ExternalLink,
  Coins,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart3,
  Edit,
  Trash2,
  Calculator,
  Tag,
  Info,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';

export const SalesBackendConfigurationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('a2'); // 'a1' | 'a2' | 'a3' | 'a4' | 'a5'
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // A1 Data State
  const [usersList, setUsersList] = useState([]);

  // A2 Data State
  const [products, setProducts] = useState([]);
  const [priceLists, setPriceLists] = useState([
    { tier: 'Bronze', currency: 'USD', priceRule: 'List Price (Base)', modifier: '0%' },
    { tier: 'Silver', currency: 'USD/EUR', priceRule: 'List Price minus 5%', modifier: '-5%' },
    { tier: 'Gold', currency: 'USD/EUR/GBP', priceRule: 'List Price minus 10%', modifier: '-10%' }
  ]);

  // A3 Data State (Tier and Category Ceilings)
  const [tierCeilings, setTierCeilings] = useState([
    { tier: 'Bronze', ceiling: 5, approver: 'Sales Manager' },
    { tier: 'Silver', ceiling: 10, approver: 'Sales Manager' },
    { tier: 'Gold', ceiling: 15, approver: 'Sales Manager' }
  ]);
  const [categoryCeilings, setCategoryCeilings] = useState([
    { category: 'Hardware', ceiling: 15, approver: 'Sales Manager' },
    { category: 'Software', ceiling: 20, approver: 'Sales Manager' },
    { category: 'Services', ceiling: 10, approver: 'Sales Manager then Finance' },
    { category: 'Cloud Service', ceiling: 12, approver: 'Sales Manager' }
  ]);

  // A4 Data State (Warehouses, Stock & Replenishment)
  const [warehouses, setWarehouses] = useState([]);

  // A5 Data State (Recurring Plans & Proration Rules - Requirement A5)
  const [recurringPlans, setRecurringPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [attachModalPlan, setAttachModalPlan] = useState(null);
  const [selectedProductIdsForAttach, setSelectedProductIdsForAttach] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingRules, setSavingRules] = useState(false);

  const initialPlanForm = {
    name: '',
    billingCycle: 'Monthly',
    basePrice: 50,
    description: '',
    attachedProducts: [],
    prorationMethod: 'daily_exact',
    autoIssueCreditNote: true,
    invoiceSeatIncreasesImmediately: true,
    gracePeriodDays: 14,
    noticePeriodDays: 30,
    policyType: 'prorated_credit',
    refundMethod: 'credit_note',
    adminFeePercent: 0
  };
  const [planForm, setPlanForm] = useState(initialPlanForm);

  const [prorationGlobalConfig, setProrationGlobalConfig] = useState({
    method: 'daily_exact',
    autoIssueCreditNote: true,
    invoiceSeatIncreasesImmediately: true
  });

  const [cancellationGlobalConfig, setCancellationGlobalConfig] = useState({
    gracePeriodDays: 14,
    noticePeriodDays: 30,
    policyType: 'prorated_credit',
    refundMethod: 'credit_note',
    adminFeePercent: 0
  });

  // Proration Simulator State for interactive verification
  const [simOldSeats, setSimOldSeats] = useState(5);
  const [simNewSeats, setSimNewSeats] = useState(10);
  const [simPrice, setSimPrice] = useState(50);
  const [simCycle, setSimCycle] = useState('Monthly');
  const [simDaysRemaining, setSimDaysRemaining] = useState(15);

  // Fetch live backend configuration
  useEffect(() => {
    const fetchBackendData = async () => {
      setLoading(true);
      try {
        const [prodRes, whRes, discRes, planRes] = await Promise.allSettled([
          api.get('/products?status=all'),
          api.get('/fulfillment/warehouses'),
          api.get('/discounts/rules'),
          billingService.getRecurringPlans()
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value?.data?.data) {
          setProducts(prodRes.value.data.data);
        }

        if (whRes.status === 'fulfilled' && whRes.value?.data?.data) {
          setWarehouses(whRes.value.data.data);
        }

        if (planRes.status === 'fulfilled' && planRes.value?.data) {
          const loadedPlans = Array.isArray(planRes.value.data) ? planRes.value.data : [];
          setRecurringPlans(loadedPlans);
          if (loadedPlans.length > 0 && loadedPlans[0].prorationRule) {
            setProrationGlobalConfig(prev => ({
              ...prev,
              method: loadedPlans[0].prorationRule.method || 'daily_exact',
              autoIssueCreditNote: loadedPlans[0].prorationRule.autoIssueCreditNote !== false,
              invoiceSeatIncreasesImmediately: loadedPlans[0].prorationRule.invoiceSeatIncreasesImmediately !== false
            }));
          }
          if (loadedPlans.length > 0 && loadedPlans[0].cancellationPolicy) {
            setCancellationGlobalConfig(prev => ({
              ...prev,
              gracePeriodDays: loadedPlans[0].cancellationPolicy.gracePeriodDays ?? 14,
              noticePeriodDays: loadedPlans[0].cancellationPolicy.noticePeriodDays ?? 30,
              policyType: loadedPlans[0].cancellationPolicy.policyType || 'prorated_credit',
              refundMethod: loadedPlans[0].cancellationPolicy.refundMethod || 'credit_note',
              adminFeePercent: loadedPlans[0].cancellationPolicy.adminFeePercent ?? 0
            }));
          }
        }

        if (discRes.status === 'fulfilled' && discRes.value?.data?.data?.approvalRules) {
          const rules = discRes.value.data.data.approvalRules;
          const hw = rules.find(r => r.category === 'Hardware');
          const sv = rules.find(r => r.category === 'Services');
          if (hw || sv) {
            setCategoryCeilings(prev => [
              { category: 'Hardware', ceiling: hw?.maxDiscountCeiling || 15, approver: 'Sales Manager' },
              { category: 'Services', ceiling: sv?.maxDiscountCeiling || 10, approver: 'Sales Manager then Finance' },
              { category: 'Software', ceiling: 20, approver: 'Sales Manager' },
              { category: 'Cloud Service', ceiling: 12, approver: 'Sales Manager' }
            ]);
          }
        }
      } catch (err) {
        console.warn('Backend configuration fetch warning:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendData();
  }, []);

  const handleSaveDiscounts = async () => {
    try {
      const payload = [
        ...tierCeilings.map(t => ({
          tier: t.tier,
          category: 'All',
          maxDiscountCeiling: Number(t.ceiling) || 10,
          minMarginFloor: 20,
          requiredApproverRole: 'sales_manager'
        })),
        ...categoryCeilings.map(c => ({
          tier: 'All',
          category: c.category,
          maxDiscountCeiling: Number(c.ceiling) || 15,
          minMarginFloor: 20,
          requiredApproverRole: c.approver.includes('Finance') ? 'finance' : 'sales_manager'
        }))
      ];
      await api.put('/discounts/ceilings', { rules: payload });
      setSaveSuccess('Discount ceilings and approval routing successfully updated in database!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setSaveSuccess('Discount configuration updated locally.');
      setTimeout(() => setSaveSuccess(''), 4000);
    }
  };

  // Handlers for Recurring Plans & Proration / Cancellation Rules (Requirement A5)
  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanForm({
      ...initialPlanForm,
      attachedProducts: products.length > 0 ? [products[0]._id] : []
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlanId(plan._id);
    const attachedIds = (plan.attachedProducts || []).map(p => (typeof p === 'object' && p ? p._id : p));
    setPlanForm({
      name: plan.name || '',
      billingCycle: plan.billingCycle || 'Monthly',
      basePrice: plan.basePrice || 0,
      description: plan.description || '',
      attachedProducts: attachedIds,
      prorationMethod: plan.prorationRule?.method || 'daily_exact',
      autoIssueCreditNote: plan.prorationRule?.autoIssueCreditNote !== false,
      invoiceSeatIncreasesImmediately: plan.prorationRule?.invoiceSeatIncreasesImmediately !== false,
      gracePeriodDays: plan.cancellationPolicy?.gracePeriodDays ?? 14,
      noticePeriodDays: plan.cancellationPolicy?.noticePeriodDays ?? 30,
      policyType: plan.cancellationPolicy?.policyType || 'prorated_credit',
      refundMethod: plan.cancellationPolicy?.refundMethod || 'credit_note',
      adminFeePercent: plan.cancellationPolicy?.adminFeePercent ?? 0
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    if (e) e.preventDefault();
    if (!planForm.name || planForm.basePrice === undefined) {
      alert('Please provide plan name and base price');
      return;
    }
    setSavingPlan(true);
    try {
      const payload = {
        name: planForm.name,
        billingCycle: planForm.billingCycle,
        basePrice: Number(planForm.basePrice),
        description: planForm.description,
        attachedProducts: planForm.attachedProducts,
        prorationRule: {
          method: planForm.prorationMethod,
          autoIssueCreditNote: planForm.autoIssueCreditNote,
          invoiceSeatIncreasesImmediately: planForm.invoiceSeatIncreasesImmediately
        },
        cancellationPolicy: {
          gracePeriodDays: Number(planForm.gracePeriodDays),
          noticePeriodDays: Number(planForm.noticePeriodDays),
          policyType: planForm.policyType,
          refundMethod: planForm.refundMethod,
          adminFeePercent: Number(planForm.adminFeePercent)
        }
      };

      if (editingPlanId) {
        const res = await billingService.updateRecurringPlan(editingPlanId, payload);
        if (res?.data) {
          setRecurringPlans(prev => prev.map(p => p._id === editingPlanId ? res.data : p));
        }
        setSaveSuccess(`Recurring plan "${planForm.name}" updated successfully!`);
      } else {
        const res = await billingService.createRecurringPlan(payload);
        if (res?.data) {
          setRecurringPlans(prev => [...prev, res.data]);
        }
        setSaveSuccess(`Recurring plan "${planForm.name}" created and attached to products!`);
      }
      setIsPlanModalOpen(false);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      console.error('Save recurring plan error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save recurring plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (!window.confirm(`Are you sure you want to deactivate recurring plan "${planName}"?`)) return;
    try {
      await billingService.deleteRecurringPlan(planId);
      setRecurringPlans(prev => prev.filter(p => p._id !== planId));
      setSaveSuccess(`Plan "${planName}" deactivated successfully.`);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate plan');
    }
  };

  const handleOpenAttachModal = (plan) => {
    setAttachModalPlan(plan);
    const attachedIds = (plan.attachedProducts || []).map(p => (typeof p === 'object' && p ? p._id : p));
    setSelectedProductIdsForAttach(attachedIds);
    setIsAttachModalOpen(true);
  };

  const handleSaveAttachments = async () => {
    if (!attachModalPlan) return;
    try {
      const res = await billingService.attachPlanToProducts(attachModalPlan._id, selectedProductIdsForAttach);
      if (res?.data) {
        setRecurringPlans(prev => prev.map(p => p._id === attachModalPlan._id ? res.data : p));
      }
      setIsAttachModalOpen(false);
      setSaveSuccess(`Updated product attachments for "${attachModalPlan.name}"!`);
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to attach products to plan');
    }
  };

  const handleSaveGlobalRules = async () => {
    setSavingRules(true);
    try {
      await billingService.saveProrationAndCancellationRules({
        prorationConfig: prorationGlobalConfig,
        cancellationConfig: cancellationGlobalConfig
      });
      setSaveSuccess('Proration rules and cancellation/refund policies successfully synchronized to all recurring plans!');
      setTimeout(() => setSaveSuccess(''), 4000);
      // refresh plans
      const refreshed = await billingService.getRecurringPlans();
      if (refreshed?.data) setRecurringPlans(refreshed.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save rules');
    } finally {
      setSavingRules(false);
    }
  };

  // A6 Data State (Upsell / Cross-Sell Rules)
  const [selectedUpsellProdId, setSelectedUpsellProdId] = useState('');
  const [upsellForm, setUpsellForm] = useState({
    isPromoted: false,
    minMarginThreshold: 20,
    coPurchasedWith: []
  });
  const [savingUpsell, setSavingUpsell] = useState(false);

  useEffect(() => {
    if (products && products.length > 0 && !selectedUpsellProdId) {
      setSelectedUpsellProdId(products[0]._id);
      setUpsellForm({
        isPromoted: !!products[0].isPromoted,
        minMarginThreshold: products[0].minMarginThreshold !== undefined ? products[0].minMarginThreshold : 20,
        coPurchasedWith: products[0].coPurchasedWith || []
      });
    }
  }, [products]);

  const handleSelectUpsellProd = (prodId) => {
    setSelectedUpsellProdId(prodId);
    const p = products.find(prod => prod._id === prodId);
    if (p) {
      setUpsellForm({
        isPromoted: !!p.isPromoted,
        minMarginThreshold: p.minMarginThreshold !== undefined ? p.minMarginThreshold : 20,
        coPurchasedWith: p.coPurchasedWith || []
      });
    }
  };

  const handleSaveUpsellRules = async () => {
    if (!selectedUpsellProdId) return;
    setSavingUpsell(true);
    try {
      await api.put(`/products/${selectedUpsellProdId}`, {
        isPromoted: upsellForm.isPromoted,
        minMarginThreshold: Number(upsellForm.minMarginThreshold) || 20,
        coPurchasedWith: upsellForm.coPurchasedWith
      });
      // Update local products state
      setProducts(prev => prev.map(p => p._id === selectedUpsellProdId ? {
        ...p,
        isPromoted: upsellForm.isPromoted,
        minMarginThreshold: Number(upsellForm.minMarginThreshold) || 20,
        coPurchasedWith: upsellForm.coPurchasedWith
      } : p));
      setSaveSuccess('A6 Upsell & Cross-Sell rules saved to database successfully!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      console.warn('Upsell rules save error:', err);
      setSaveSuccess('Upsell rules updated locally.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } finally {
      setSavingUpsell(false);
    }
  };

  const sections = [
    { id: 'a1', label: 'A1: Authentication & Access', icon: Users, desc: 'Credentials, portal magic links & role workspace routing' },
    { id: 'a2', label: 'A2: Product & Price Lists', icon: Package, desc: 'General info, variants, extra prices & customer tier rules' },
    { id: 'a3', label: 'A3: Discount Tiers & Approval Chains', icon: Sliders, desc: 'Tier ceilings, category limits & blended routing' },
    { id: 'a4', label: 'A4: Warehouse & Fulfillment', icon: Warehouse, desc: 'Depots, stock replenishment & auto-split shipping cost weights' },
    { id: 'a5', label: 'A5: Subscription & Proration', icon: Repeat, desc: 'Recurring plans, mid-cycle proration & cancellation refund rules' },
    { id: 'a6', label: 'A6: Upsell / Cross Sell Rules', icon: Sparkles, desc: 'Co-purchase pairings, promoted items & minimum margin thresholds' },
    { id: 'a7', label: 'A7: Reporting & Dashboard', icon: BarChart3, desc: 'Sales performance menu, PDF/XLS export & live filters' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner: Sales Backend (Configuration Area) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-mono font-semibold bg-[#bf5af2]/10 text-[#bf5af2] border border-[#bf5af2]/20 mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Section A • Enterprise Configuration Area</span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Sales Backend Configuration
          </h1>
          <p className="text-[13.5px] text-[#86868b] mt-1 max-w-2xl">
            Configure catalog master data, discount governance chains, multi-depot fulfillment routing, and recurring subscription proration rules.
          </p>
        </div>

        {/* Action: Open Sales Workspace (from spec: 'After login, internal users can access backend configuration and open a sales workspace') */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/portal')}
            className="whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 mr-2 text-[#0071e3]" />
            Customer Portal
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/dashboard')}
            className="whitespace-nowrap bg-gradient-to-r from-[#0071e3] to-[#2997ff] text-white shadow-md shadow-blue-500/20"
          >
            <span>Open Sales Workspace</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/30 text-[13px] text-[#1b7e36] dark:text-[#30d158] flex items-center space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span className="font-semibold">{saveSuccess}</span>
        </div>
      )}

      {/* Navigation Pills: A1 through A7 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-black/[0.04] dark:bg-white/[0.08] border-[#0071e3] shadow-sm ring-1 ring-[#0071e3]'
                  : 'bg-white/70 dark:bg-[#161618]/70 border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#86868b]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-[#0071e3]" />}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {sec.label.split(':')[0]}
                </div>
                <div className="text-[11.5px] text-[#86868b] truncate mt-0.5">
                  {sec.label.split(':')[1]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* SECTION A1: Authentication (Login / Signup) */}
      {activeSection === 'a1' && (
        <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-6">
          <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
            <h2 className="text-[18px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0071e3]" />
              A1) Authentication & User Workspace Governance
            </h2>
            <p className="text-[13px] text-[#86868b] mt-1">
              Internal users authenticate via standard credentials. Customers access deals via magic links or portal login.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <div className="text-[12px] font-mono text-[#86868b] uppercase">Internal Authentication</div>
              <div className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white mt-1">Email & Password</div>
              <p className="text-[12px] text-[#86868b] mt-2">
                Standard bcrypt encryption with JWT tokens. Role credentials pre-configured for Sales Rep, Manager, Finance, and Admin.
              </p>
              <div className="mt-4">
                <Button size="sm" variant="secondary" onClick={() => navigate('/login')}>
                  Open Login Screen
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <div className="text-[12px] font-mono text-[#86868b] uppercase">Customer Portal Access</div>
              <div className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white mt-1">Magic Link / Direct Token</div>
              <p className="text-[12px] text-[#86868b] mt-2">
                One-click customer portal authentication bypassing standard registration while enforcing strict customer ownership checks.
              </p>
              <div className="mt-4">
                <Button size="sm" variant="secondary" onClick={() => navigate('/portal')}>
                  Preview Portal View
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <div className="text-[12px] font-mono text-[#86868b] uppercase">Active Session Persona</div>
              <div className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white mt-1">
                {user?.name || 'Marcus Chen'}
              </div>
              <div className="text-[12px] font-mono text-[#0071e3] mt-0.5">Role: {user?.role || 'admin'}</div>
              <p className="text-[12px] text-[#86868b] mt-2">
                Internal users can configure backend setup and transition directly to the sales operations workspace.
              </p>
              <div className="mt-4">
                <Button size="sm" variant="primary" onClick={() => navigate('/dashboard')}>
                  Open Sales Workspace
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION A2: Product & Price List Management */}
      {activeSection === 'a2' && (
        <div className="space-y-6">
          <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
              <div>
                <h2 className="text-[18px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0071e3]" />
                  A2) Product Catalog & Price List Management
                </h2>
                <p className="text-[13px] text-[#86868b] mt-1">
                  General Info (Name, Category, Price, Unit, Tax), Variants (Attributes, Values, Extra prices), and Price Lists.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={() => navigate('/products/new')}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  + New Product
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('/products')}>
                  View Full Catalog ({products.length})
                </Button>
              </div>
            </div>

            {/* Price Lists Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#ff9f0a]" />
                  Customer Tier & Currency Specific Price Lists
                </h3>
                <span className="text-[12px] text-[#86868b] font-mono">3 Active Pricing Tiers</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-[#86868b] font-mono text-[12px] border-b border-black/[0.06] dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4">Currencies</th>
                      <th className="py-3 px-4">Price Rule</th>
                      <th className="py-3 px-4">Base Adjustment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                    {priceLists.map((pl, idx) => (
                      <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-semibold text-[#1d1d1f] dark:text-white">{pl.tier}</td>
                        <td className="py-3 px-4 font-mono text-[#86868b]">{pl.currency}</td>
                        <td className="py-3 px-4 text-[#1d1d1f] dark:text-[#f5f5f7]">{pl.priceRule}</td>
                        <td className="py-3 px-4 font-mono text-[#30d158]">{pl.modifier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Catalog Products */}
            <div>
              <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white mb-3">
                Recent Master Catalog Products & Variants
              </h3>
              <div className="overflow-x-auto rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-[#86868b] font-mono text-[12px] border-b border-black/[0.06] dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">SKU / Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Unit / Tax</th>
                      <th className="py-3 px-4">Configured Variants</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                    {(products.slice(0, 5) || []).map((p) => (
                      <tr key={p._id || p.sku} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#1d1d1f] dark:text-white">{p.name}</div>
                          <div className="text-[11.5px] font-mono text-[#86868b]">{p.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-[#86868b]">{p.category}</td>
                        <td className="py-3 px-4 font-mono font-semibold">{formatCurrency(p.basePrice)}</td>
                        <td className="py-3 px-4 text-[#86868b]">{p.unit || 'Each'} ({p.taxPercent || 10}%)</td>
                        <td className="py-3 px-4 font-mono text-[12px] text-[#86868b]">
                          {p.variants?.length ? `${p.variants.length} (${p.variants[0].attribute})` : 'None'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/products/${p._id}`)}
                            className="text-[12px] text-[#0071e3] hover:underline font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION A3: Discount Tier & Approval Chain Setup */}
      {activeSection === 'a3' && (
        <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#ff9f0a]" />
                A3) Discount Tier & Approval Chain Setup
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Define customer tier ceilings (Bronze, Silver, Gold), category limits, and escalation routing rules.
              </p>
            </div>

            <Button size="sm" variant="primary" onClick={handleSaveDiscounts}>
              Save Ceilings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier Ceilings */}
            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                Customer Tier Ceilings
              </h3>
              <div className="space-y-2">
                {tierCeilings.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">{t.tier} Tier</div>
                      <div className="text-[11.5px] text-[#86868b]">Approver: {t.approver}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={t.ceiling}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTierCeilings(prev => prev.map((item, i) => i === idx ? { ...item, ceiling: val } : item));
                        }}
                        className="w-16 h-8 text-center rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-black font-mono text-[13px] font-bold text-[#1d1d1f] dark:text-white"
                      />
                      <span className="text-[13px] font-semibold text-[#86868b]">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Ceilings */}
            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                Category Specific Discount Ceilings
              </h3>
              <div className="space-y-2">
                {categoryCeilings.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">{c.category}</div>
                      <div className="text-[11.5px] text-[#86868b]">Route: {c.approver}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={c.ceiling}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCategoryCeilings(prev => prev.map((item, i) => i === idx ? { ...item, ceiling: val } : item));
                        }}
                        className="w-16 h-8 text-center rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-black font-mono text-[13px] font-bold text-[#1d1d1f] dark:text-white"
                      />
                      <span className="text-[13px] font-semibold text-[#86868b]">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governance Notes Callout */}
          <div className="p-4 rounded-xl border border-[#ff9f0a]/30 bg-[#ff9f0a]/10 text-[12.5px] space-y-1.5 text-[#9e5200] dark:text-[#ff9f0a]">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Spec Governance Rule:
            </div>
            <p>
              When a quote mixes categories with different ceilings, the system automatically computes a <strong>blended risk score</strong> and routes to the highest required approval level. All approvals, rejections, and edits are permanently logged with user, timestamp, and reason.
            </p>
          </div>
        </Card>
      )}

      {/* SECTION A4: Warehouse & Fulfillment Setup */}
      {activeSection === 'a4' && (
        <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-[#30d158]" />
                A4) Warehouse & Fulfillment Multi-Depot Setup
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Create and manage warehouses, replenishment rules, and shipping cost weighting to minimize multi-depot shipments.
              </p>
            </div>

            <Button size="sm" variant="secondary" onClick={() => navigate('/fulfillment')}>
              Open Fulfillment View
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-[#86868b] font-mono text-[12px] border-b border-black/[0.06] dark:border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Location Hub</th>
                  <th className="py-3 px-4">Shipping Weight</th>
                  <th className="py-3 px-4">Stock Levels</th>
                  <th className="py-3 px-4">Replenishment Rule</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {(warehouses.length > 0 ? warehouses : [
                  { name: 'Main Warehouse', location: 'Dallas, TX', shippingCostWeight: 1.0, totalOnHand: 100, available: 55, replenishmentRules: { reorderPoint: 20, reorderQuantity: 60, minStockLevel: 15, leadTimeDays: 2 } },
                  { name: 'East Depot', location: 'Allentown, PA', shippingCostWeight: 1.4, totalOnHand: 60, available: 49, replenishmentRules: { reorderPoint: 10, reorderQuantity: 30, minStockLevel: 8, leadTimeDays: 1 } }
                ]).map((wh, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-[#1d1d1f] dark:text-white">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-[#0071e3]" />
                        <span>{wh.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#86868b]">{wh.location}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0071e3]">
                      {wh.shippingCostWeight?.toFixed(1) || '1.0'}x
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-[#30d158] font-bold">{wh.available || 50}</span>
                      <span className="text-[#86868b] text-[11.5px] ml-1">avail / {wh.totalOnHand || 100} on hand</span>
                    </td>
                    <td className="py-3 px-4 text-[#86868b] font-mono text-[12px]">
                      Reorder @ {wh.replenishmentRules?.reorderPoint || 20} (qty: {wh.replenishmentRules?.reorderQuantity || 50})
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" size="sm">Active Depot</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION A5: Subscription / Recurring Plan Setup (Requirement A5) */}
      {activeSection === 'a5' && (
        <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-7">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
            <div>
              <h2 className="text-[19px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <Repeat className="w-5 h-5 text-[#bf5af2]" />
                A5) Subscription & Recurring Plan Configuration
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1 max-w-2xl">
                Define recurring billing intervals (Monthly, Quarterly, Yearly) attached to specific catalog products or services, configure automated mid-cycle proration rules, and establish cancellation/partial refund policies.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button size="sm" variant="secondary" onClick={() => navigate('/subscriptions')}>
                View Active Subscriptions
              </Button>
              <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenCreatePlan}>
                Create Recurring Plan
              </Button>
            </div>
          </div>

          {/* 1. Recurring Plans Table with Attached Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#bf5af2]" />
                Defined Recurring Plans & Attached Products
              </h3>
              <span className="text-[12px] text-[#86868b] font-mono">
                {recurringPlans.length} {recurringPlans.length === 1 ? 'Plan' : 'Plans'} Active
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-[#86868b] font-mono text-[11.5px] uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.08]">
                  <tr>
                    <th className="py-3 px-4">Plan Name & Cycle</th>
                    <th className="py-3 px-4">Base Price</th>
                    <th className="py-3 px-4">Attached Products / Services</th>
                    <th className="py-3 px-4">Proration Rule</th>
                    <th className="py-3 px-4">Cancellation & Refund</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                  {recurringPlans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#86868b] text-[13px]">
                        No recurring plans found. Click <strong>Create Recurring Plan</strong> to define your first plan.
                      </td>
                    </tr>
                  ) : (
                    recurringPlans.map((plan) => {
                      const attachedList = Array.isArray(plan.attachedProducts) ? plan.attachedProducts : [];
                      const cycleColors = {
                        Monthly: 'bg-[#bf5af2]/10 text-[#bf5af2] border-[#bf5af2]/20',
                        Quarterly: 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20',
                        Yearly: 'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20',
                        Annual: 'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20'
                      };
                      return (
                        <tr key={plan._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                              <span>{plan.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-semibold border ${cycleColors[plan.billingCycle] || 'bg-black/5 text-[#86868b]'}`}>
                                {plan.billingCycle}
                              </span>
                            </div>
                            {plan.description && (
                              <div className="text-[11.5px] text-[#86868b] mt-0.5 line-clamp-1">
                                {plan.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1d1d1f] dark:text-white">
                            {formatCurrency(plan.basePrice)}
                            <span className="text-[11px] font-normal text-[#86868b] ml-1">/{plan.billingCycle?.toLowerCase() || 'mo'}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                              {attachedList.length === 0 ? (
                                <span className="text-[11.5px] text-[#86868b] italic">No products attached</span>
                              ) : (
                                attachedList.map((p, pIdx) => {
                                  const name = typeof p === 'object' ? p.name : p;
                                  return (
                                    <span
                                      key={pIdx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white border border-black/[0.06] dark:border-white/[0.06]"
                                    >
                                      <Tag className="w-3 h-3 text-[#0071e3]" />
                                      <span className="truncate max-w-[120px]">{name}</span>
                                    </span>
                                  );
                                })
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenAttachModal(plan)}
                                className="text-[11px] font-medium text-[#0071e3] hover:underline ml-1"
                              >
                                {attachedList.length === 0 ? '+ Attach Products' : `+ Manage (${attachedList.length})`}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 font-mono text-[12px]">
                              <span className="inline-block font-medium text-[#0071e3] dark:text-[#2997ff]">
                                {plan.prorationRule?.method === 'daily_exact'
                                  ? 'Exact Day Count (365d)'
                                  : plan.prorationRule?.method === 'calendar_days'
                                  ? 'Calendar Month Days'
                                  : 'No Proration'}
                              </span>
                              <div className="text-[11px] text-[#86868b]">
                                {plan.prorationRule?.autoIssueCreditNote !== false ? 'Auto Credit Note On Decrease' : 'Manual Credit'}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                              <span className="font-semibold text-[#30d158]">
                                {plan.cancellationPolicy?.gracePeriodDays || 14}d Grace Period (100%)
                              </span>
                              <div className="text-[11px] text-[#86868b]">
                                {plan.cancellationPolicy?.policyType === 'prorated_credit'
                                  ? 'Prorated Credit Note'
                                  : plan.cancellationPolicy?.policyType === 'full_refund_grace'
                                  ? 'Grace Only / No Mid-Cycle Refund'
                                  : 'Strict No Refund'}
                                {plan.cancellationPolicy?.noticePeriodDays ? ` (${plan.cancellationPolicy.noticePeriodDays}d notice)` : ''}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPlan(plan)}
                                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#86868b] hover:text-[#0071e3] transition-colors"
                                title="Edit Recurring Plan"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePlan(plan._id, plan.name)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#86868b] hover:text-red-500 transition-colors"
                                title="Deactivate Plan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Proration Rules Configuration & Interactive Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Left Column: Proration Rules Config */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#0071e3]" />
                  Mid-Cycle Proration Rules (Seat & Plan Changes)
                </h4>
                <Badge variant="info" size="sm">Rule Engine</Badge>
              </div>
              <p className="text-[12.5px] text-[#86868b]">
                Configure how seat quantity adjustments and plan tier migrations compute monetary deltas mid-billing cycle.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-mono uppercase text-[#86868b] mb-1.5">
                    Proration Calculation Method
                  </label>
                  <select
                    value={prorationGlobalConfig.method}
                    onChange={(e) => setProrationGlobalConfig({ ...prorationGlobalConfig, method: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="daily_exact">Daily Exact (365 days / standard SaaS daily rate)</option>
                    <option value="calendar_days">Calendar Month Days (28–31 days in specific cycle)</option>
                    <option value="do_not_prorate">Do Not Prorate (Full billing cycle charged)</option>
                  </select>
                </div>

                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prorationGlobalConfig.autoIssueCreditNote}
                      onChange={(e) => setProrationGlobalConfig({ ...prorationGlobalConfig, autoIssueCreditNote: e.target.checked })}
                      className="mt-1 w-4 h-4 text-[#0071e3] rounded border-black/20 dark:border-white/20 focus:ring-0"
                    />
                    <div>
                      <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white block">
                        Automatic Credit Note on Seat / Quantity Reduction
                      </span>
                      <span className="text-[12px] text-[#86868b]">
                        When a customer decreases seats mid-cycle, automatically issue an ERP draft credit note for unused prepaid days.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prorationGlobalConfig.invoiceSeatIncreasesImmediately}
                      onChange={(e) => setProrationGlobalConfig({ ...prorationGlobalConfig, invoiceSeatIncreasesImmediately: e.target.checked })}
                      className="mt-1 w-4 h-4 text-[#0071e3] rounded border-black/20 dark:border-white/20 focus:ring-0"
                    />
                    <div>
                      <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white block">
                        Immediate Invoicing for Seat Increases
                      </span>
                      <span className="text-[12px] text-[#86868b]">
                        Invoice the prorated delta immediately for remaining cycle days instead of waiting until next renewal.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="font-mono text-[12px] p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] text-[#0071e3] dark:text-[#2997ff] border border-black/[0.06] dark:border-white/[0.06]">
                  Formula: Delta = (New Quantity - Old Quantity) × (Cycle Rate ÷ Cycle Days) × Remaining Days
                </div>
              </div>
            </div>

            {/* Right Column: Live Proration Simulator */}
            <div className="p-5 rounded-2xl bg-[#0071e3]/[0.03] dark:bg-[#0071e3]/[0.06] border border-[#0071e3]/20 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0071e3]" />
                  Live Mid-Cycle Proration Simulator
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-semibold bg-[#0071e3]/10 text-[#0071e3]">
                  Interactive Test
                </span>
              </div>
              <p className="text-[12.5px] text-[#86868b]">
                Test proration calculations live with custom seat changes and days remaining in the billing period.
              </p>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono text-[#86868b] uppercase mb-1">Old Seats / Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={simOldSeats}
                    onChange={(e) => setSimOldSeats(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#86868b] uppercase mb-1">New Seats / Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={simNewSeats}
                    onChange={(e) => setSimNewSeats(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#86868b] uppercase mb-1">Base Price / Seat ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={simPrice}
                    onChange={(e) => setSimPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#86868b] uppercase mb-1">Days Remaining (of 30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={simDaysRemaining}
                    onChange={(e) => setSimDaysRemaining(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Live Simulator Calculation Box */}
              {(() => {
                const totalCycleDays = simCycle === 'Yearly' ? 365 : simCycle === 'Quarterly' ? 90 : 30;
                const ratio = Math.max(0, Math.min(1, simDaysRemaining / totalCycleDays));
                const oldTotal = simOldSeats * simPrice;
                const newTotal = simNewSeats * simPrice;
                const deltaTotal = newTotal - oldTotal;
                const proratedDelta = Number((deltaTotal * ratio).toFixed(2));
                const isIncrease = deltaTotal > 0;
                const isDecrease = deltaTotal < 0;

                return (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-[#0071e3]/30 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-[#86868b]">Seat Change Delta:</span>
                      <span className="font-mono font-bold text-[#1d1d1f] dark:text-white">
                        {simOldSeats} → {simNewSeats} seats ({isIncrease ? `+${simNewSeats - simOldSeats}` : isDecrease ? `${simNewSeats - simOldSeats}` : '0'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-[#86868b]">Period Coverage Ratio:</span>
                      <span className="font-mono font-bold text-[#0071e3]">
                        {(ratio * 100).toFixed(1)}% ({simDaysRemaining}d remaining of {totalCycleDays}d)
                      </span>
                    </div>
                    <div className="border-t border-black/[0.06] dark:border-white/[0.08] pt-2 flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">
                        {isIncrease ? 'Immediate Invoice Delta:' : isDecrease ? 'Automatic Credit Note:' : 'Proration Adjustment:'}
                      </span>
                      <span className={`text-[17px] font-mono font-extrabold ${isIncrease ? 'text-[#0071e3]' : isDecrease ? 'text-[#30d158]' : 'text-[#86868b]'}`}>
                        {proratedDelta >= 0 ? `+$${proratedDelta.toFixed(2)}` : `-$${Math.abs(proratedDelta).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#86868b] flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158] shrink-0" />
                      <span>
                        {isIncrease
                          ? `Will trigger immediate invoice of $${proratedDelta.toFixed(2)} for ${simDaysRemaining} remaining days.`
                          : isDecrease
                          ? `Will generate an automatic draft credit note of $${Math.abs(proratedDelta).toFixed(2)}.`
                          : 'No net delta in seats.'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 3. Cancellation and Partial Refund Policy Rules (Requirement 3) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
              <div>
                <h4 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#30d158]" />
                  Cancellation & Partial Refund Governance Rules
                </h4>
                <p className="text-[12.5px] text-[#86868b] mt-0.5">
                  Configure grace period cooling-off rules, renewal notice windows, and partial refund disbursement methods.
                </p>
              </div>

              <Button
                size="sm"
                variant="primary"
                icon={CheckCircle2}
                loading={savingRules}
                disabled={savingRules}
                onClick={handleSaveGlobalRules}
              >
                Save Proration & Cancellation Rules
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                  Full Refund Grace Period
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={cancellationGlobalConfig.gracePeriodDays}
                    onChange={(e) => setCancellationGlobalConfig({ ...cancellationGlobalConfig, gracePeriodDays: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 pr-14 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-[12px] font-mono text-[#86868b]">days</span>
                </div>
                <span className="text-[11px] text-[#86868b] mt-1 block">100% refund window after cycle starts</span>
              </div>

              <div>
                <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                  Cancellation Notice Period
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={cancellationGlobalConfig.noticePeriodDays}
                    onChange={(e) => setCancellationGlobalConfig({ ...cancellationGlobalConfig, noticePeriodDays: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 pr-14 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-[12px] font-mono text-[#86868b]">days</span>
                </div>
                <span className="text-[11px] text-[#86868b] mt-1 block">Advance notice required before next renewal</span>
              </div>

              <div>
                <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                  Mid-Cycle Refund Policy
                </label>
                <select
                  value={cancellationGlobalConfig.policyType}
                  onChange={(e) => setCancellationGlobalConfig({ ...cancellationGlobalConfig, policyType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3]"
                >
                  <option value="prorated_credit">Prorated Credit Note for Unused Days</option>
                  <option value="full_refund_grace">Full Refund in Grace, Non-Refundable After</option>
                  <option value="no_refund">Strict No Refund (Active Until Period End)</option>
                </select>
                <span className="text-[11px] text-[#86868b] mt-1 block">Method for calculating partial return</span>
              </div>

              <div>
                <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                  Disbursement Method
                </label>
                <select
                  value={cancellationGlobalConfig.refundMethod}
                  onChange={(e) => setCancellationGlobalConfig({ ...cancellationGlobalConfig, refundMethod: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3]"
                >
                  <option value="credit_note">Credit Note (Invoice Offset Credit)</option>
                  <option value="original_payment">Original Payment Gateway (Stripe/Card)</option>
                </select>
                <span className="text-[11px] text-[#86868b] mt-1 block">Channel for refund transfer</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION A6: Upsell / Cross Sell Rule Setup (Requirement A6) */}
      {activeSection === 'a6' && (
        <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#bf5af2]" />
                A6) Upsell / Cross Sell Rule Setup
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Define product pairings based on historical co-purchase data, mark strategic products as promoted, and set minimum margin thresholds.
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveUpsellRules}
              disabled={savingUpsell}
              loading={savingUpsell}
              icon={CheckCircle2}
            >
              Save Upsell Rules
            </Button>
          </div>

          {/* Rule Configuration Form for Selected Product */}
          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Product Selector */}
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#86868b] mb-1.5">
                  Select Product to Configure
                </label>
                <select
                  value={selectedUpsellProdId}
                  onChange={(e) => handleSelectUpsellProd(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white font-medium focus:outline-none focus:border-[#0071e3]"
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id} className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">
                      {p.name} ({p.category}) — {formatCurrency(p.basePrice)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirement: Mark products as currently promoted so they rank higher in suggestions */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white block">
                    ⭐ Promoted Product
                  </span>
                  <span className="text-[11.5px] text-[#86868b]">
                    Ranks first in CPQ suggestions
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={upsellForm.isPromoted}
                    onChange={(e) => setUpsellForm({ ...upsellForm, isPromoted: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                </label>
              </div>

              {/* Requirement: Set minimum margin thresholds so only healthy margin suggestions surface */}
              <div>
                <label className="block text-[12px] font-mono uppercase text-[#86868b] mb-1.5">
                  Min Margin Threshold (% Floor)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={upsellForm.minMarginThreshold}
                    onChange={(e) => setUpsellForm({ ...upsellForm, minMarginThreshold: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white font-mono focus:outline-none focus:border-[#0071e3]"
                  />
                  <span className="absolute right-3 top-3 text-[12px] text-[#86868b] font-mono">%</span>
                </div>
              </div>
            </div>

            {/* Requirement: Define product pairings based on historical co purchase data */}
            <div className="pt-2">
              <label className="block text-[12px] font-mono uppercase text-[#86868b] mb-2">
                🔗 Historical Co-Purchase Pairings (Associated Addons & Bundles)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-2 bg-white dark:bg-[#1c1c1e] rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
                {products
                  .filter((p) => p._id !== selectedUpsellProdId)
                  .map((p) => {
                    const isPaired = Array.isArray(upsellForm.coPurchasedWith) && upsellForm.coPurchasedWith.some((id) => id?.toString() === p._id.toString());
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(upsellForm.coPurchasedWith) ? [...upsellForm.coPurchasedWith] : [];
                          const next = isPaired
                            ? current.filter((id) => id?.toString() !== p._id.toString())
                            : [...current, p._id];
                          setUpsellForm({ ...upsellForm, coPurchasedWith: next });
                        }}
                        className={`p-2.5 rounded-lg text-left text-[12.5px] border transition-all flex items-center justify-between ${
                          isPaired
                            ? 'bg-[#0071e3]/10 border-[#0071e3]/40 text-[#0071e3] dark:text-[#2997ff] font-semibold'
                            : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.04] dark:border-white/[0.06] text-[#6e6e73] dark:text-[#86868b] hover:bg-black/[0.04]'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {isPaired && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1 text-[#0071e3]" />}
                      </button>
                    );
                  })}
              </div>
              <p className="text-[11.5px] text-[#86868b] mt-1.5">
                Selected products will be ranked with high confidence tags in CPQ Cart Upsell drawers.
              </p>
            </div>
          </div>

          {/* Active Product Rules Catalog Table */}
          <div className="overflow-x-auto rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-[#86868b] font-mono text-[12px] border-b border-black/[0.06] dark:border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4 text-center">Promoted Status</th>
                  <th className="py-3 px-4 text-center">Min Margin Floor</th>
                  <th className="py-3 px-4 text-center">Co-Purchase Pairings</th>
                  <th className="py-3 px-4 text-right">Base Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {products.slice(0, 10).map((p) => (
                  <tr key={p._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1d1d1f] dark:text-white">{p.name}</div>
                      <div className="text-[11.5px] font-mono text-[#86868b]">{p.category} • {p.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.isPromoted ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30">
                          ⭐ Promoted
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-[#86868b]">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white font-medium">
                        ≥ {p.minMarginThreshold !== undefined ? p.minMarginThreshold : 20}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#0071e3] dark:text-[#2997ff]">
                      {(p.coPurchasedWith && p.coPurchasedWith.length) || 0} paired items
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1d1d1f] dark:text-white">
                      {formatCurrency(p.basePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION A7: Reporting & Dashboard Configuration (Requirement A7) */}
      {activeSection === 'a7' && (
        <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#30d158]" />
                A7) Reporting & Dashboard Configuration
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Sales performance dashboards, multi-dimensional filters (Period, Rep, Status, Category) and export options (PDF / XLS).
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/reports')}
              className="bg-gradient-to-r from-[#0071e3] to-[#2997ff] text-white"
            >
              Open Full Reporting Dashboard →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Reporting Filters Overview */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
              <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                Configured Reporting Filters (Purpose)
              </h3>
              <ul className="space-y-2 text-[12.5px] text-[#6e6e73] dark:text-[#86868b]">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0071e3] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#1d1d1f] dark:text-white">Period:</strong> View quotations and orders within a date range (today, week, custom range)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#30d158] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#1d1d1f] dark:text-white">Sales Team / Rep:</strong> Filter reports by responsible rep or team to analyze individual or team performance
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff9f0a] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#1d1d1f] dark:text-white">Approval Status:</strong> Filter by pending, approved, or rejected quotations
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#bf5af2] mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-[#1d1d1f] dark:text-white">Product / Category:</strong> Filter reporting to track best-selling or most discounted items
                  </div>
                </li>
              </ul>
            </div>

            {/* Export & Governance Settings */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-4">
              <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                Export Options & Compliance
              </h3>
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">PDF Executive Brief</div>
                    <div className="text-[11.5px] text-[#86868b]">Formatted executive summary with compliance tables</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#ff453a]/15 text-[#ff453a]">PDF Ready</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">XLS / CSV Raw Telemetry</div>
                    <div className="text-[11.5px] text-[#86868b]">Tabular export of rep turnarounds and discounts</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#30d158]/15 text-[#30d158]">XLS Ready</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL 1: Create / Edit Recurring Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-[#bf5af2]" />
                  {editingPlanId ? 'Edit Recurring Plan' : 'Create Recurring Plan'}
                </h3>
                <p className="text-[12px] text-[#86868b] mt-0.5">
                  Define recurring billing intervals and attach to specific products or services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="p-2 rounded-xl text-[#86868b] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSavePlan} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g. Enterprise Cloud Care"
                    className="w-full h-10 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                    Billing Cycle *
                  </label>
                  <select
                    value={planForm.billingCycle}
                    onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white font-medium"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly (Annual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                    Base Recurring Price ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={planForm.basePrice}
                    onChange={(e) => setPlanForm({ ...planForm, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                    Proration Method
                  </label>
                  <select
                    value={planForm.prorationMethod}
                    onChange={(e) => setPlanForm({ ...planForm, prorationMethod: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white"
                  >
                    <option value="daily_exact">Daily Exact (365 days / SaaS rate)</option>
                    <option value="calendar_days">Calendar Month Days (28-31d)</option>
                    <option value="do_not_prorate">Do Not Prorate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-mono uppercase text-[#86868b] mb-1.5">
                  Plan Description
                </label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="e.g. 24/7 SLA, proactive monitoring, and monthly security audits"
                  className="w-full h-10 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white"
                />
              </div>

              {/* Requirement: Attach to Specific Products or Services */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#0071e3]" />
                    Attach to Specific Products or Services
                  </label>
                  <span className="text-[11.5px] text-[#86868b]">
                    {planForm.attachedProducts.length} products selected
                  </span>
                </div>
                <p className="text-[12px] text-[#86868b]">
                  Select the catalog products/services that are eligible to have this recurring plan attached during quotation build.
                </p>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-black/[0.08] dark:border-white/[0.08] p-2 space-y-1 bg-black/[0.01] dark:bg-white/[0.02]">
                  {products.length === 0 ? (
                    <div className="text-[12px] text-[#86868b] text-center py-4">No catalog products loaded.</div>
                  ) : (
                    products.map((p) => {
                      const isChecked = planForm.attachedProducts.includes(p._id);
                      return (
                        <label
                          key={p._id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-[12.5px] transition-colors ${isChecked ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#1d1d1f] dark:text-white'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPlanForm({ ...planForm, attachedProducts: [...planForm.attachedProducts, p._id] });
                                } else {
                                  setPlanForm({ ...planForm, attachedProducts: planForm.attachedProducts.filter(id => id !== p._id) });
                                }
                              }}
                              className="w-4 h-4 text-[#0071e3] rounded border-black/20"
                            />
                            <span className="font-medium">{p.name}</span>
                            <span className="text-[11px] px-2 py-0.2 rounded-full bg-black/5 dark:bg-white/10 text-[#86868b]">
                              {p.category}
                            </span>
                          </div>
                          <span className="font-mono text-[12px] font-semibold">{formatCurrency(p.basePrice)}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cancellation Policy for this Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#86868b] mb-1">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={planForm.gracePeriodDays}
                    onChange={(e) => setPlanForm({ ...planForm, gracePeriodDays: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#86868b] mb-1">
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={planForm.noticePeriodDays}
                    onChange={(e) => setPlanForm({ ...planForm, noticePeriodDays: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#86868b] mb-1">
                    Refund Policy
                  </label>
                  <select
                    value={planForm.policyType}
                    onChange={(e) => setPlanForm({ ...planForm, policyType: e.target.value })}
                    className="w-full h-9 px-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[12px]"
                  >
                    <option value="prorated_credit">Prorated Credit Note</option>
                    <option value="full_refund_grace">Grace Period Only</option>
                    <option value="no_refund">No Refund</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                <Button type="button" variant="secondary" size="md" onClick={() => setIsPlanModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" loading={savingPlan} disabled={savingPlan}>
                  {editingPlanId ? 'Save Changes' : 'Create Recurring Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Attach Products / Services Modal */}
      {isAttachModalOpen && attachModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0071e3]" />
                  Attach Products: {attachModalPlan.name}
                </h3>
                <p className="text-[12px] text-[#86868b] mt-0.5">
                  Select which catalog items sales reps can attach this recurring plan to.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAttachModalOpen(false)}
                className="p-2 rounded-xl text-[#86868b] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-2">
              {products.map((p) => {
                const isChecked = selectedProductIdsForAttach.includes(p._id);
                return (
                  <label
                    key={p._id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3]' : 'border-black/[0.06] dark:border-white/[0.08] hover:bg-black/5 dark:hover:bg-white/5 text-[#1d1d1f] dark:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIdsForAttach([...selectedProductIdsForAttach, p._id]);
                          } else {
                            setSelectedProductIdsForAttach(selectedProductIdsForAttach.filter(id => id !== p._id));
                          }
                        }}
                        className="w-4 h-4 text-[#0071e3] rounded border-black/20"
                      />
                      <div>
                        <div className="font-semibold text-[13px]">{p.name}</div>
                        <div className="text-[11px] text-[#86868b]">{p.category} • SKU: {p.sku || 'N/A'}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[13px]">{formatCurrency(p.basePrice)}</span>
                  </label>
                );
              })}
            </div>

            <div className="p-4 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
              <span className="text-[12px] text-[#86868b]">
                {selectedProductIdsForAttach.length} of {products.length} products attached
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsAttachModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveAttachments}>
                  Save Attachments
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesBackendConfigurationPage;
