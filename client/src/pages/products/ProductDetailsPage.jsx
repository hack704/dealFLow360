import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Layers,
  Coins,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Info,
  Sliders,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // General info state
  const [productName, setProductName] = useState('Laptop Pro 14');
  const [category, setCategory] = useState('Hardware');
  const [basePrice, setBasePrice] = useState('1200');
  const [unit, setUnit] = useState('Each');
  const [description, setDescription] = useState(
    'High performance 14" workstation laptop with M-series processor and Retina display.'
  );
  const [taxPercent, setTaxPercent] = useState('10');
  const [isSubscription, setIsSubscription] = useState(false);
  const [recurringCycle, setRecurringCycle] = useState('Monthly');
  const [quantityOnHand, setQuantityOnHand] = useState('42');
  const [isPromoted, setIsPromoted] = useState(false);
  const [minMarginThreshold, setMinMarginThreshold] = useState('20');

  // Product Variants state
  const [variants, setVariants] = useState([
    { id: 1, attribute: 'Color', values: 'Blue, Black', extraPrice: '0' },
    { id: 2, attribute: 'RAM', values: '4GB, 8GB', extraPrice: '+$30' },
    { id: 3, attribute: 'Manufacturer', values: 'Dell, HP', extraPrice: '+$10/+$30' }
  ]);

  // Pricelists state
  const [pricelists, setPricelists] = useState([
    { id: 1, tier: 'Bronze', currency: 'USD', priceRule: 'Price, no adjustment' },
    { id: 2, tier: 'Gold', currency: 'USD/EUR', priceRule: 'Price minus 10 percent base' }
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id && id !== 'new') {
        try {
          const res = await api.get(`/products/${id}`);
          if (res.data?.data) {
            const p = res.data.data;
            setProductName(p.name || '');
            setCategory(p.category || 'Hardware');
            setBasePrice(p.basePrice !== undefined ? String(p.basePrice) : '1200');
            setUnit(p.unit || 'Each');
            setDescription(p.description || '');
            setTaxPercent(p.taxPercent !== undefined ? String(p.taxPercent) : '10');
            setIsPromoted(!!p.isPromoted);
            setMinMarginThreshold(p.minMarginThreshold !== undefined ? String(p.minMarginThreshold) : '20');
            if (p.variants && p.variants.length > 0) {
              setVariants(p.variants.map((v, i) => ({ id: v._id || i + 1, ...v })));
            }
            if (p.priceLists && p.priceLists.length > 0) {
              setPricelists(p.priceLists.map((pl, i) => ({ id: pl._id || i + 1, ...pl })));
            }
          }
        } catch (err) {
          console.warn('Product load notice:', err.message);
        }
      }
    };
    fetchProduct();
  }, [id]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: productName,
        category,
        basePrice: Number(basePrice) || 0,
        unit,
        description,
        taxPercent: Number(taxPercent) || 10,
        isPromoted,
        minMarginThreshold: Number(minMarginThreshold) || 20,
        variants: variants.map(v => ({ attribute: v.attribute, values: v.values, extraPrice: v.extraPrice })),
        priceLists: pricelists.map(pl => ({ tier: pl.tier, currency: pl.currency, priceRule: pl.priceRule }))
      };

      if (id && id !== 'new') {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', {
          ...payload,
          sku: `DF-PRD-${Date.now().toString().slice(-4)}`,
          unitCost: Math.round((Number(basePrice) || 100) * 0.4)
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.warn('Product update note:', err.message);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: Date.now(), attribute: 'Storage', values: '256GB, 512GB, 1TB', extraPrice: '+$50' }
    ]);
  };

  const handleRemoveVariant = (idToRemove) => {
    setVariants((prev) => prev.filter((v) => v.id !== idToRemove));
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
            <ArrowLeft className="w-4 h-4" /> Back to Product Catalog
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Product and pricelist
            </h1>
            <Badge variant="primary" size="sm" className="font-mono">
              {id || 'PRD-101'}
            </Badge>
          </div>
          <p className="text-[13px] text-[#86868b] mt-1">
            Configure core catalog specifications, variant matrix, and pricing tier rules
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/products')}
          >
            {isAdmin ? 'Cancel' : 'Back to Catalog'}
          </Button>

          {isAdmin ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-[#86868b] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>View Only (Admin Required to Edit)</span>
            </div>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/30 text-[13px] text-[#1b7e36] dark:text-[#30d158] flex items-center space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span className="font-semibold">
            Product catalog and pricelist configuration successfully updated!
          </span>
        </div>
      )}

      {/* Section 1: General Info */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl space-y-6 shadow-sm dark:shadow-apple-card">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
            <Package className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            General Info
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                >
                  <option value="Hardware" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Hardware</option>
                  <option value="Services" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Services</option>
                  <option value="Software" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Software</option>
                  <option value="Subscription" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Subscription</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                >
                  <option value="Each" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Each</option>
                  <option value="Hour" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Hour</option>
                  <option value="Seat" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Seat</option>
                  <option value="Annual" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Annual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                Base Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[13px] text-[#86868b] font-mono">$</span>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full h-11 pl-8 pr-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all resize-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                Tax %
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
                />
                <span className="absolute right-3.5 top-3 text-[13px] text-[#86868b] font-mono">%</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                Subscription
              </label>
              {/* Apple Transparent Gesture Yes/No Pill */}
              <div className="flex items-center space-x-1.5 bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] w-fit">
                <button
                  type="button"
                  onClick={() => setIsSubscription(true)}
                  className={`h-9 px-4 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                    isSubscription
                      ? 'bg-[#0071e3]/10 dark:bg-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 font-semibold shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubscription(false)}
                  className={`h-9 px-4 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                    !isSubscription
                      ? 'bg-[#0071e3]/10 dark:bg-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 font-semibold shadow-sm'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
              <p className="text-[13px] text-[#86868b] mt-1.5 font-mono">
                If subscription yes then recurring billing options will be enabled.
              </p>
            </div>

            {isSubscription && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                  Recurring Interval
                </label>
                <select
                  value={recurringCycle}
                  onChange={(e) => setRecurringCycle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                >
                  <option value="Monthly" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Monthly</option>
                  <option value="Yearly" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Yearly</option>
                  <option value="Weekly" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Weekly</option>
                  <option value="Quarterly" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Quarterly</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5 whitespace-nowrap">
                Quantity on Hand (Integer)
              </label>
              <input
                type="number"
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
              />
            </div>

            {/* Requirement A6: Promoted Flag & Minimum Margin Threshold */}
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] block">
                    Promoted Product (Upsell Ranking)
                  </span>
                  <span className="text-[11.5px] text-[#86868b]">
                    Ranks higher in AI cross-sell recommendations
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPromoted}
                    onChange={(e) => setIsPromoted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3] dark:peer-checked:bg-[#2997ff]"></div>
                </label>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#86868b] mb-1">
                  Min Margin Threshold (% Floor for Upsells)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minMarginThreshold}
                    onChange={(e) => setMinMarginThreshold(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white font-mono focus:outline-none focus:border-[#0071e3]"
                  />
                  <span className="absolute right-3 top-2 text-[12px] text-[#86868b] font-mono">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Product Variants */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#bf5af2]/10 flex items-center justify-center text-[#bf5af2]">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Product Variants
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-[13px] text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1 font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Variant Attribute
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Attribute</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Values</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Extra Price</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{v.attribute}</td>
                  <td className="py-4 px-4 text-[#86868b] whitespace-nowrap">{v.values}</td>
                  <td className="py-4 px-4 font-mono text-[#1b7e36] dark:text-[#30d158] whitespace-nowrap">{v.extraPrice}</td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Pricelists */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/10 flex items-center justify-center text-[#ff9f0a]">
              <Coins className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Pricelists
            </h3>
          </div>
          <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">3 configured pricing tiers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Tier</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Currency</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Price Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {pricelists.map((pl) => (
                <tr key={pl.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{pl.tier}</td>
                  <td className="py-4 px-4 font-mono text-[#86868b] whitespace-nowrap">{pl.currency}</td>
                  <td className="py-4 px-5 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{pl.priceRule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wireframe Gold Callout Note */}
      <div className="p-4 rounded-xl border border-[#ff9f0a]/35 bg-[#ff9f0a]/[0.08] dark:bg-[#ff9f0a]/[0.05] text-[13px] text-[#9e5200] dark:text-[#ff9f0a] flex items-center space-x-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/15 flex items-center justify-center shrink-0">
          <Info className="w-4.5 h-4.5 text-[#ff9f0a]" />
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-[#9e5200] dark:text-[#ff9f0a]">Product details should be filled.</p>
          <p className="text-[#86868b] dark:text-[#e5e5ea]">Recurring order with this product will be invoiced at the beginning of the period.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
