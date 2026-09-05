import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  SlidersHorizontal,
  Search,
  ArrowUpRight,
  Layers,
  Coins,
  ShieldCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const ProductCatalogPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const products = [
    {
      id: 'PRD-101',
      name: 'Laptop Pro 14',
      category: 'Hardware',
      variants: '3 (color)',
      price: 1200,
      unit: 'Each',
      tax: '15%',
      status: 'Active',
      subscription: false
    },
    {
      id: 'PRD-102',
      name: 'Onsite Setup Service',
      category: 'Services',
      variants: '—',
      price: 450,
      unit: 'Each',
      tax: '10%',
      status: 'Active',
      subscription: false
    },
    {
      id: 'PRD-103',
      name: 'Docking Station',
      category: 'Hardware',
      variants: '3 (color)',
      price: 180,
      unit: 'Each',
      tax: '15%',
      status: 'Active',
      subscription: false
    },
    {
      id: 'PRD-104',
      name: 'Care Plan 2 years',
      category: 'Subscription',
      variants: '—',
      price: 40,
      unit: 'Recurring / mo',
      tax: '0%',
      status: 'Active',
      subscription: true
    },
    {
      id: 'PRD-105',
      name: 'Enterprise Cloud Hub',
      category: 'Software',
      variants: '4 (tier)',
      price: 3600,
      unit: 'Annual',
      tax: '12%',
      status: 'Active',
      subscription: true
    },
    {
      id: 'PRD-106',
      name: 'Support SLA Platinum',
      category: 'Subscription',
      variants: '2 (response SLA)',
      price: 300,
      unit: 'Recurring / mo',
      tax: '0%',
      status: 'Active',
      subscription: true
    }
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Product Catalog
          </h1>
          <p className="text-[13px] text-[#86868b] mt-1">
            Every product, variant and price list in one place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/discount-tiers')}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2 text-[#ff9f0a]" />
            Manage Price Fields
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/products/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Catalog Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/10 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Total Products</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#1d1d1f] dark:text-white">128</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">active · 6 archived</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Spanning hardware, cloud licenses, professional services.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Pricing Tiers</span>
            <div className="w-9 h-9 rounded-xl bg-[#30d158]/10 flex items-center justify-center text-[#1b7e36] dark:text-[#30d158]">
              <Coins className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Pricelists</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#1b7e36] dark:text-[#30d158]">3</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">tiers · 2 currencies</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            USD & EUR multi-currency pricing with automated rate sync.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Configurable Matrix</span>
            <div className="w-9 h-9 rounded-xl bg-[#bf5af2]/10 flex items-center justify-center text-[#79349e] dark:text-[#bf5af2]">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Variants</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#79349e] dark:text-[#bf5af2]">340</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">SKUs across all products</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Color, RAM, storage, CPU, and deployment region options.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[#86868b] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title, SKU, or category..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all shadow-sm dark:shadow-none"
          />
        </div>

        {/* Transparent Gesture Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar p-1.5 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
          {['All', 'Hardware', 'Services', 'Subscription', 'Software'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`h-9 px-4 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap w-fit shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/25 dark:border-[#2997ff]/30 font-semibold shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
              <Package className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Products</h3>
          </div>
          <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">
            Showing {filteredProducts.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Product Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Variants</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Price</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Unit</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tax</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors whitespace-nowrap">
                      {p.name}
                    </div>
                    <div className="text-[13px] font-mono text-[#86868b] whitespace-nowrap">{p.id}</div>
                  </td>
                  <td className="py-4 px-4 text-[#86868b] whitespace-nowrap">{p.category}</td>
                  <td className="py-4 px-4 font-mono text-[#86868b] whitespace-nowrap">{p.variants}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="py-4 px-4 text-[#86868b] whitespace-nowrap">{p.unit}</td>
                  <td className="py-4 px-4 font-mono text-[#86868b] whitespace-nowrap">{p.tax}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge variant="success" size="sm">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <span className="text-[13px] text-[#0071e3] dark:text-[#2997ff] group-hover:underline inline-flex items-center gap-1 font-medium whitespace-nowrap">
                      Configure <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wireframe Gold Callout Note */}
      <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.02] text-[13px] text-[#86868b] flex items-center space-x-3">
        <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#2997ff] shrink-0"></span>
        <span>
          Click a product row to open general info, variants and tier/currency price lists.
        </span>
      </div>
    </div>
  );
};

export default ProductCatalogPage;
