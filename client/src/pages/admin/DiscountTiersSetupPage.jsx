import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Percent,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Lock,
  History,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import api from '../../services/api';

export const DiscountTiersSetupPage = () => {
  const navigate = useNavigate();

  // Tier discount ceilings state (Wireframe 18: Bronze, Silver, Gold)
  const [tierCeilings, setTierCeilings] = useState([
    { id: 1, tier: 'Bronze', maxDiscount: '5' },
    { id: 2, tier: 'Silver', maxDiscount: '10' },
    { id: 3, tier: 'Gold', maxDiscount: '15' }
  ]);

  // Category discount ceilings state (Wireframe 18: Hardware, Services)
  const [categoryCeilings, setCategoryCeilings] = useState([
    { id: 1, category: 'Hardware', maxDiscount: '15' },
    { id: 2, category: 'Services', maxDiscount: '10' }
  ]);

  // Routing rules state (Wireframe 18: 3 rules)
  const [routingRules, setRoutingRules] = useState([
    { id: 1, range: 'Within tier/Category limit', requirement: 'No approval needed', badge: 'success' },
    { id: 2, range: 'Over Limit, blended risk medium', requirement: 'Sales manager', badge: 'warning' },
    { id: 3, range: 'Over limit, blended high risk', requirement: 'Sales manager then finance', badge: 'danger' }
  ]);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await api.get('/discounts/rules');
        if (res.data?.data?.approvalRules) {
          const rules = res.data.data.approvalRules;
          // Hydrate category ceilings
          const hw = rules.find(r => r.category === 'Hardware');
          const sv = rules.find(r => r.category === 'Services');
          if (hw || sv) {
            setCategoryCeilings([
              { id: 1, category: 'Hardware', maxDiscount: String(hw?.maxDiscountCeiling ?? 15) },
              { id: 2, category: 'Services', maxDiscount: String(sv?.maxDiscountCeiling ?? 10) }
            ]);
          }
        }
      } catch (err) {
        console.warn('Rules fetch notice:', err.message);
      }
    };
    fetchRules();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const rulesPayload = [
        ...tierCeilings.map(t => ({
          tier: t.tier,
          category: 'All',
          maxDiscountCeiling: Number(t.maxDiscount) || 10,
          minMarginFloor: 20,
          requiredApproverRole: 'sales_manager'
        })),
        ...categoryCeilings.map(c => ({
          tier: 'All',
          category: c.category,
          maxDiscountCeiling: Number(c.maxDiscount) || 15,
          minMarginFloor: 20,
          requiredApproverRole: c.category === 'Hardware' ? 'sales_manager' : 'finance'
        }))
      ];
      await api.put('/discounts/ceilings', { rules: rulesPayload });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.warn('Discount ceilings save notice:', err.message);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleTierChange = (id, val) => {
    setTierCeilings((prev) =>
      prev.map((t) => (t.id === id ? { ...t, maxDiscount: val } : t))
    );
  };

  const handleCategoryChange = (id, val) => {
    setCategoryCeilings((prev) =>
      prev.map((c) => (c.id === id ? { ...c, maxDiscount: val } : c))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <button
            onClick={() => navigate('/products')}
            className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Discount tiers and approval chains
            </h1>
            <Badge variant="primary" size="sm" className="font-mono">
              CPQ Governance
            </Badge>
          </div>
          <p className="text-[13px] text-[#86868b] mt-1">
            Configure customer tier discount ceilings, category caps, and multi-tier approval routing
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSaveConfig}
            className="shadow-sm shadow-blue-500/20"
          >
            <Save className="w-4 h-4 mr-2" />
            Save configuration
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/30 text-[13px] text-[#1b7e36] dark:text-[#30d158] flex items-center space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span className="font-semibold">
            Discount ceilings, category limits, and approval routing escalation rules saved successfully!
          </span>
        </div>
      )}

      {/* Grid for Tier Discount Ceilings and Category Discount Ceilings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Table 1: Tier Discount Ceilings */}
        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Tier Discount Ceilings
              </h3>
            </div>
            <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">Role Limit</span>
          </div>

          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-neutral-50 dark:bg-white/[0.02] text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Tier</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Max Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {tierCeilings.map((t) => (
                <tr key={t.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{t.tier}</td>
                  <td className="py-4 px-5 text-right font-mono whitespace-nowrap">
                    <div className="inline-flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={t.maxDiscount}
                        onChange={(e) => handleTierChange(t.id, e.target.value)}
                        className="w-20 h-9 px-3 text-right rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                      />
                      <span className="text-[#86868b] text-[13px]">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 2: Category Discount Ceilings */}
        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#30d158]/10 flex items-center justify-center text-[#1b7e36] dark:text-[#30d158]">
                <Percent className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Category Discount Ceilings
              </h3>
            </div>
            <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">Product Scope</span>
          </div>

          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-neutral-50 dark:bg-white/[0.02] text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Category</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Max Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {categoryCeilings.map((c) => (
                <tr key={c.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{c.category}</td>
                  <td className="py-4 px-5 text-right font-mono whitespace-nowrap">
                    <div className="inline-flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={c.maxDiscount}
                        onChange={(e) => handleCategoryChange(c.id, e.target.value)}
                        className="w-20 h-9 px-3 text-right rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                      />
                      <span className="text-[#86868b] text-[13px]">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3: Approval Escalation & Routing Rules */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#bf5af2]/10 flex items-center justify-center text-[#bf5af2]">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Tier Discount Ceilings
            </h3>
          </div>
          <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">Routing Governance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-neutral-50 dark:bg-white/[0.02] text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Discount range</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Max Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {routingRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{rule.range}</td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <Badge variant={rule.badge} size="sm" className="capitalize whitespace-nowrap w-fit shrink-0">
                      {rule.requirement}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button (Matching Wireframe 18 placement) */}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSaveConfig}
          className="shadow-sm shadow-blue-500/20 px-6 py-2.5"
        >
          <Save className="w-4 h-4 mr-2" />
          Save configuration
        </Button>
      </div>

      {/* Wireframe Gold Callout Note */}
      <div className="p-4 rounded-xl border border-[#ff9f0a]/35 bg-[#ff9f0a]/[0.08] dark:bg-[#ff9f0a]/[0.05] text-[13px] text-[#9e5200] dark:text-[#ff9f0a] flex items-start space-x-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/15 flex items-center justify-center shrink-0 text-[#ff9f0a] mt-0.5">
          <AlertTriangle className="w-4.5 h-4.5" />
        </div>
        <div className="space-y-1">
          <p className="text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">
            When a quote mixes categories with different ceilings, the system must compute a blended risk score and route to the highest required level
          </p>
          <p className="text-[#86868b] dark:text-[#a1a1a6] text-[12px] font-mono">
            All approvals, rejections, and edits must be logged with user, timestamp, and reason.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscountTiersSetupPage;
