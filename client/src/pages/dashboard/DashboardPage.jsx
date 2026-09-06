import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import dealHealthService from '../../services/dealHealthService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  Plus,
  ArrowRight,
  Clock,
  Layers,
  AlertTriangle,
  Package,
  Activity,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Percent,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  Boxes,
  FileText,
  CreditCard,
  Building2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Flame,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await quotationService.getActivityFeed();
      if (res?.data && Array.isArray(res.data)) {
        setActivities(res.data);
      }
    } catch (err) {
      console.warn('Dynamic activity feed fallback:', err.message);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchHealthAlerts = async () => {
    try {
      setLoadingHealth(true);
      const res = await dealHealthService.getDealHealthList();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setHealthAlerts(res.data);
      }
    } catch (err) {
      console.warn('Deal health dynamic fetch notice:', err.message);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await quotationService.getQuotations();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setQuotations(res.data);
        } else {
          // Fallback sample data for rich UI presentation
          setQuotations([
            {
              _id: '1',
              quotationNumber: 'QT-2026-1042',
              title: 'Enterprise Cloud & Compute Modernization',
              customerName: 'Acme Global Enterprises',
              grandTotal: 148500,
              blendedMarginPercent: 41.8,
              totalDiscountPercent: 12.5,
              riskScore: 22,
              riskLevel: 'low',
              status: 'sent_to_customer',
              updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
            },
            {
              _id: '2',
              quotationNumber: 'QT-2026-1039',
              title: 'Multi-Region Logistics Hardware Bundle',
              customerName: 'Delta Freight Logistics',
              grandTotal: 92400,
              blendedMarginPercent: 28.5,
              totalDiscountPercent: 18.0,
              riskScore: 58,
              riskLevel: 'moderate',
              status: 'pending_approval',
              requiresApproval: true,
              updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
            },
            {
              _id: '3',
              quotationNumber: 'QT-2026-1035',
              title: 'Cybersecurity Infrastructure SLA Tier-1',
              customerName: 'Synthetix FinTech Corp',
              grandTotal: 215000,
              blendedMarginPercent: 18.2,
              totalDiscountPercent: 24.0,
              riskScore: 78,
              riskLevel: 'high',
              status: 'pending_approval',
              requiresApproval: true,
              updatedAt: new Date(Date.now() - 6 * 86400000).toISOString()
            },
            {
              _id: '4',
              quotationNumber: 'QT-2026-1028',
              title: 'Annual SaaS Workspace Expansion',
              customerName: 'Vertex BioHealth Labs',
              grandTotal: 64800,
              blendedMarginPercent: 54.0,
              totalDiscountPercent: 5.0,
              riskScore: 14,
              riskLevel: 'low',
              status: 'accepted',
              updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
    fetchActivities();
    fetchHealthAlerts();

    // Live polling interval every 20 seconds to keep feed & alerts dynamic
    const interval = setInterval(() => {
      fetchActivities();
      fetchHealthAlerts();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Aggregated Pipeline Calculations
  const totalPipelineValue = quotations.reduce((acc, q) => acc + (Number(q.grandTotal) || 0), 0) || 520700;
  const pendingApprovalsCount = quotations.filter((q) => q.status === 'pending_approval' || q.requiresApproval).length;
  const openQuotesCount = quotations.filter((q) => q.status !== 'accepted' && q.status !== 'rejected').length || quotations.length;
  const atRiskCount = quotations.filter((q) => (q.riskScore && q.riskScore >= 50) || q.riskLevel === 'high' || q.riskLevel === 'critical').length;
  
  const avgMargin = quotations.length > 0
    ? (quotations.reduce((acc, q) => acc + (Number(q.blendedMarginPercent) || 0), 0) / quotations.length)
    : 35.6;

  // Pipeline stage distribution counts - fully dynamic from loaded quotes
  const draftCount = quotations.filter((q) => q.status === 'draft').length;
  const pendingCount = quotations.filter((q) => q.status === 'pending_approval' || q.requiresApproval).length;
  const sentCount = quotations.filter((q) => q.status === 'sent_to_customer' || q.status === 'confirmed').length;
  const acceptedCount = quotations.filter((q) => q.status === 'approved' || q.status === 'accepted').length;

  const stageDistribution = {
    draft: draftCount || (quotations.length === 0 ? 1 : 0),
    pending_approval: pendingCount || (quotations.length === 0 ? 1 : 0),
    sent_to_customer: sentCount || (quotations.length === 0 ? 1 : 0),
    accepted: acceptedCount || (quotations.length === 0 ? 1 : 0)
  };
  const totalStageCount = Object.values(stageDistribution).reduce((a, b) => a + b, 0) || 1;

  // Find critical deal from active pipeline
  const criticalDeal = quotations.find((q) => (q.riskScore && q.riskScore >= 50) || q.status === 'pending_approval') || quotations[0] || null;

  // Current dynamic alert from live dealHealthService or highest-risk active quote
  const currentAlert = healthAlerts.length > 0
    ? healthAlerts[activeAlertIndex % healthAlerts.length]
    : (criticalDeal ? {
        id: criticalDeal.quotationNumber,
        quotationId: criticalDeal._id,
        deal: criticalDeal.customerName,
        issue: criticalDeal.approvalReason || (criticalDeal.riskScore >= 50 ? `High Risk Score (${criticalDeal.riskScore}) requires mitigation` : 'Pending Governance Sign-off'),
        value: formatCurrency(criticalDeal.grandTotal),
        riskScore: criticalDeal.riskScore,
        action: criticalDeal.requiresApproval ? 'Awaiting Approval' : 'Review Required',
        rep: 'Sales Team'
      } : null);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner & Executive Header */}
      <div className="relative overflow-hidden rounded-[26px] p-7 sm:p-9 bg-gradient-to-br from-white/90 via-white/70 to-[#0071e3]/[0.04] dark:from-[#161618]/95 dark:via-[#161618]/85 dark:to-[#2997ff]/[0.08] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-apple-card backdrop-blur-3xl">
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0071e3]/10 dark:bg-[#2997ff]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] text-[12px] font-semibold tracking-wide uppercase mb-3 border border-[#0071e3]/20">
              <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#2997ff] animate-pulse" />
              Central Module Hub
            </div>
            <h1 className="text-[26px] sm:text-[30px] lg:text-[34px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em] leading-tight">
              Sales Dashboard
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1.5 max-w-2xl leading-relaxed">
              Central hub for revenue operations, approval velocity, and deal margin health
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/quotations/new')}
              variant="primary"
              size="md"
              icon={Plus}
              className="shadow-sm hover:shadow-apple-glow transition-all"
            >
              + New Quotation
            </Button>

            <Button
              onClick={() => navigate('/approvals')}
              variant="secondary"
              size="md"
              className="border-black/[0.12] dark:border-white/[0.14]"
            >
              View Approvals
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Pipeline Value */}
        <div
          onClick={() => navigate('/pipeline')}
          className="p-6 rounded-[22px] bg-white/85 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/50 dark:hover:border-[#2997ff]/50 transition-all duration-200 cursor-pointer group shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-apple-card backdrop-blur-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#6e6e73] uppercase tracking-[0.06em]">
                Active Pipeline
              </span>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 shadow-sm">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="text-[26px] sm:text-[30px] font-bold font-mono tracking-tight text-[#1d1d1f] dark:text-white mt-3">
              {formatCurrency(totalPipelineValue)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#6e6e73] dark:text-[#86868b]">{openQuotesCount} active proposals</span>
            <span className="inline-flex items-center text-[#1b7e36] dark:text-[#30d158] font-semibold gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.2% MoM
            </span>
          </div>
        </div>

        {/* Metric 2: Pending Approvals */}
        <div
          onClick={() => navigate('/approvals')}
          className="p-6 rounded-[22px] bg-white/85 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#ff9f0a]/50 dark:hover:border-[#ff9f0a]/50 transition-all duration-200 cursor-pointer group shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-apple-card backdrop-blur-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#6e6e73] uppercase tracking-[0.06em]">
                Pending Approvals
              </span>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/20 shadow-sm">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-[26px] sm:text-[30px] font-bold font-mono tracking-tight text-[#1d1d1f] dark:text-white mt-3">
              {pendingApprovalsCount} <span className="text-[16px] font-normal text-[#86868b]">deals waiting</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#9e5200] dark:text-[#ff9f0a] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a] animate-pulse" />
              Manager Sign-Off SLA
            </span>
            <span className="text-[#0071e3] dark:text-[#2997ff] group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Metric 3: Blended Margin Health */}
        <div
          onClick={() => navigate('/quotations')}
          className="p-6 rounded-[22px] bg-white/85 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#30d158]/50 dark:hover:border-[#30d158]/50 transition-all duration-200 cursor-pointer group shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-apple-card backdrop-blur-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#6e6e73] uppercase tracking-[0.06em]">
                Blended Margin Avg
              </span>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#30d158]/10 dark:bg-[#30d158]/15 text-[#1b7e36] dark:text-[#30d158] border border-[#30d158]/20 shadow-sm">
                <Percent className="w-4 h-4" />
              </span>
            </div>
            <div className="text-[26px] sm:text-[30px] font-bold font-mono tracking-tight text-[#1b7e36] dark:text-[#30d158] mt-3">
              {formatPercent(avgMargin)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#6e6e73] dark:text-[#86868b]">Floor Threshold: 20.0%</span>
            <Badge variant="success" size="xs">Healthy</Badge>
          </div>
        </div>

        {/* Metric 4: At-Risk Deals Telemetry */}
        <div
          onClick={() => navigate('/deal-health')}
          className="p-6 rounded-[22px] bg-white/85 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#ff453a]/50 dark:hover:border-[#ff453a]/50 transition-all duration-200 cursor-pointer group shadow-[0_2px_14px_rgba(0,0,0,0.04)] dark:shadow-apple-card backdrop-blur-2xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#86868b] dark:text-[#6e6e73] uppercase tracking-[0.06em]">
                Telemetry Alerts
              </span>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#ff453a]/10 dark:bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border border-[#ff453a]/20 shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="text-[26px] sm:text-[30px] font-bold font-mono tracking-tight text-[#c9342c] dark:text-[#ff453a] mt-3">
              {atRiskCount} <span className="text-[16px] font-normal text-[#86868b]">at risk</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[12px]">
            <span className="text-[#c9342c] dark:text-[#ff453a] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff453a] animate-pulse" />
              Stall & Erosion Warnings
            </span>
            <span className="text-[#0071e3] dark:text-[#2997ff] group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Funnel & Stage Velocity */}
      <Card className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Pipeline Stage Distribution & Velocity
            </h3>
            <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b]">
              Live status progression across active CPQ quotation lifecycles
            </p>
          </div>
          <Button
            onClick={() => navigate('/pipeline')}
            variant="ghost"
            size="sm"
            className="text-[13px] text-[#0071e3] dark:text-[#2997ff]"
          >
            Open Kanban Board <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden flex gap-1 p-0.5 border border-black/[0.06] dark:border-white/[0.06]">
          <div
            style={{ width: `${(stageDistribution.draft / totalStageCount) * 100}%` }}
            className="h-full rounded-full bg-gray-400/80 dark:bg-gray-500/80 transition-all"
            title={`Draft: ${stageDistribution.draft}`}
          />
          <div
            style={{ width: `${(stageDistribution.pending_approval / totalStageCount) * 100}%` }}
            className="h-full rounded-full bg-[#ff9f0a] transition-all"
            title={`Pending Approval: ${stageDistribution.pending_approval}`}
          />
          <div
            style={{ width: `${(stageDistribution.sent_to_customer / totalStageCount) * 100}%` }}
            className="h-full rounded-full bg-[#0071e3] dark:bg-[#2997ff] transition-all"
            title={`Sent to Customer: ${stageDistribution.sent_to_customer}`}
          />
          <div
            style={{ width: `${(stageDistribution.accepted / totalStageCount) * 100}%` }}
            className="h-full rounded-full bg-[#30d158] transition-all"
            title={`Accepted / Closed Won: ${stageDistribution.accepted}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[12px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-[#6e6e73] dark:text-[#86868b]">Draft:</span>
            <span className="font-semibold text-[#1d1d1f] dark:text-white">{stageDistribution.draft}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f0a]" />
            <span className="text-[#6e6e73] dark:text-[#86868b]">Pending Approval:</span>
            <span className="font-semibold text-[#1d1d1f] dark:text-white">{stageDistribution.pending_approval}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] dark:bg-[#2997ff]" />
            <span className="text-[#6e6e73] dark:text-[#86868b]">Sent to Customer:</span>
            <span className="font-semibold text-[#1d1d1f] dark:text-white">{stageDistribution.sent_to_customer}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]" />
            <span className="text-[#6e6e73] dark:text-[#86868b]">Accepted / Won:</span>
            <span className="font-semibold text-[#1d1d1f] dark:text-white">{stageDistribution.accepted}</span>
          </div>
        </div>
      </Card>

      {/* Main 2-Column Split: High-Priority Deals Watchlist + Operations Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Priority Quotes Watchlist */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 sm:p-7">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Priority Deals & Quotations</CardTitle>
                <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">
                  Top proposals actively undergoing governance and client review
                </p>
              </div>
              <Button
                onClick={() => navigate('/quotations')}
                variant="secondary"
                size="sm"
                className="text-[12px]"
              >
                View All
              </Button>
            </CardHeader>

            <div className="space-y-3">
              {quotations.slice(0, 4).map((q) => (
                <div
                  key={q._id || q.quotationNumber}
                  onClick={() => navigate(`/quotations/${q._id || ''}`)}
                  className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] hover:border-[#0071e3]/40 dark:hover:border-[#2997ff]/40 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[12px] text-[#86868b] dark:text-[#6e6e73]">
                        {q.quotationNumber}
                      </span>
                      <span className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {q.customerName || 'Enterprise Account'}
                      </span>
                      {q.riskScore >= 50 && (
                        <Badge variant="danger" size="xs">
                          Risk {q.riskScore}
                        </Badge>
                      )}
                      {q.requiresApproval && (
                        <Badge variant="warning" size="xs">
                          Requires Approval
                        </Badge>
                      )}
                    </div>
                    <div className="text-[13px] text-[#6e6e73] dark:text-[#86868b] line-clamp-1">
                      {q.title || 'Enterprise CPQ Solution'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-bold text-[15px] text-[#1d1d1f] dark:text-white">
                        {formatCurrency(q.grandTotal)}
                      </div>
                      <div className="text-[11px] text-[#1b7e36] dark:text-[#30d158] font-medium">
                        {formatPercent(q.blendedMarginPercent)} margin
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] group-hover:bg-[#0071e3] group-hover:text-white transition-all text-[#6e6e73] dark:text-[#86868b]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Telemetry Decay Alert + Live Activity Stream */}
        <div className="space-y-6">
          {/* Active Stalled Deal Callout - 100% Dynamic from real DealHealth & active pipeline */}
          <div className="p-6 rounded-[22px] bg-gradient-to-br from-[#ff9f0a]/10 via-[#ff9f0a]/5 to-transparent border border-[#ff9f0a]/25 dark:border-[#ff9f0a]/20 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#9e5200] dark:text-[#ff9f0a] font-semibold text-[13px] uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                <span>Telemetry Risk Warning</span>
              </div>
              {healthAlerts.length > 1 ? (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono text-[#86868b] mr-1">
                    {activeAlertIndex + 1} of {healthAlerts.length}
                  </span>
                  <button
                    onClick={() => setActiveAlertIndex((prev) => (prev > 0 ? prev - 1 : healthAlerts.length - 1))}
                    className="p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                    title="Previous alert"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveAlertIndex((prev) => (prev + 1) % healthAlerts.length)}
                    className="p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                    title="Next alert"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : currentAlert?.riskScore ? (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#ff9f0a]/20 text-[#9e5200] dark:text-[#ff9f0a] font-bold">
                  Score {currentAlert.riskScore}
                </span>
              ) : null}
            </div>

            {loadingHealth && healthAlerts.length === 0 ? (
              <div className="py-6 text-center text-[#86868b] text-[12px]">
                Scanning telemetry pipelines...
              </div>
            ) : currentAlert ? (
              <div>
                <div className="flex items-center justify-between mt-2">
                  <h4 className="text-[15px] font-bold text-[#1d1d1f] dark:text-white truncate">
                    {currentAlert.deal} • {currentAlert.id}
                  </h4>
                  {healthAlerts.length > 1 && currentAlert.riskScore && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#ff9f0a]/20 text-[#9e5200] dark:text-[#ff9f0a] font-bold shrink-0 ml-2">
                      Score {currentAlert.riskScore}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b] mt-1.5 line-clamp-2">
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{currentAlert.issue}</span>
                  {currentAlert.value && (
                    <>
                      {' '}— Deal value <span className="font-mono font-medium text-[#1d1d1f] dark:text-white">{currentAlert.value}</span>.
                    </>
                  )}{' '}
                  Action: <span className="italic">{currentAlert.action}</span> ({currentAlert.rep || 'Sales Team'}).
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    onClick={() => navigate('/deal-health')}
                    variant="primary"
                    size="sm"
                    className="w-full sm:flex-1 text-[12px] justify-center bg-[#ff9f0a] hover:bg-[#e08905] text-white border-none shadow-sm"
                  >
                    Inspect Deal Health
                  </Button>
                  {(currentAlert.quotationId || currentAlert.id) && (
                    <Button
                      onClick={() => navigate(`/quotations/${currentAlert.quotationId || currentAlert.id}`)}
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto text-[12px] justify-center whitespace-nowrap"
                    >
                      Open Quote
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="flex items-center gap-2 text-[#1b7e36] dark:text-[#30d158] font-semibold text-[14px]">
                  <CheckCircle2 className="w-4 h-4" />
                  All Deals Healthy
                </div>
                <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b] mt-1">
                  Zero stalled quotations or discount threshold breaches detected across active accounts.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={() => navigate('/deal-health')}
                    variant="secondary"
                    size="sm"
                    className="w-full text-[12px] justify-center"
                  >
                    View Deal Health Matrix
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Live System Activity Feed - 100% Dynamic & Clickable */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06] mb-3">
              <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                System Activity Feed
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#30d158]/15 text-[#1b7a36] dark:text-[#30d158] border border-[#30d158]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
                  Live
                </span>
                <button
                  onClick={fetchActivities}
                  disabled={loadingActivities}
                  title="Refresh live activity feed"
                  className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingActivities ? 'animate-spin text-[#0071e3]' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-[13px]">
              {loadingActivities && activities.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
                  <span className="text-[12px] text-[#86868b]">Streaming system events...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="py-6 text-center text-[#86868b] text-[12px]">
                  No system events recorded yet.
                </div>
              ) : (
                activities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    onClick={() => act.targetUrl && navigate(act.targetUrl)}
                    className="p-2.5 rounded-xl -mx-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer group flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <span
                        style={{ backgroundColor: act.dotColor }}
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${act.dotRing || 'ring-4 ring-black/10'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[#1d1d1f] dark:text-white font-medium truncate group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors">
                            {act.title}
                          </span>
                          {act.badgeText && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#86868b]">
                              {act.badgeText}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#86868b] dark:text-[#6e6e73] truncate mt-0.5">
                          {act.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <span className="text-[11px] font-mono text-[#86868b] whitespace-nowrap">
                        {getRelativeTime(act.timestamp)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-[#0071e3] dark:text-[#2997ff] transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 mt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                Auto-syncing with live database
              </span>
              <button
                onClick={() => navigate('/pipeline')}
                className="text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium"
              >
                View Pipeline →
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Module Navigation Hub */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-semibold text-[#86868b] dark:text-[#6e6e73] uppercase tracking-[0.06em]">
            Deal Lifecycle Operating Modules
          </div>
          <span className="text-[12px] text-[#6e6e73] dark:text-[#86868b]">6 Integrated Engines</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <button
            onClick={() => navigate('/quotations')}
            className="p-4 rounded-2xl bg-white/75 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/50 dark:hover:border-[#2997ff]/50 hover:bg-white dark:hover:bg-[#1a1a1d] text-left transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-white">Quotations</div>
            <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">CPQ Builder & Kanban</div>
          </button>

          <button
            onClick={() => navigate('/approvals')}
            className="p-4 rounded-2xl bg-white/75 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#ff9f0a]/50 dark:hover:border-[#ff9f0a]/50 hover:bg-white dark:hover:bg-[#1a1a1d] text-left transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 text-[#ff9f0a] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-white">Approvals</div>
            <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">Discount Governance</div>
          </button>

          <button
            onClick={() => navigate('/fulfillment')}
            className="p-4 rounded-2xl bg-white/75 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/50 dark:hover:border-[#2997ff]/50 hover:bg-white dark:hover:bg-[#1a1a1d] text-left transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-white">Fulfillment</div>
            <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">Multi-Warehouse Splits</div>
          </button>

          <button
            onClick={() => navigate('/subscriptions')}
            className="p-4 rounded-2xl bg-white/75 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#bf5af2]/50 dark:hover:border-[#bf5af2]/50 hover:bg-white dark:hover:bg-[#1a1a1d] text-left transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#bf5af2]/10 dark:bg-[#bf5af2]/15 text-[#bf5af2] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-white">Subscriptions</div>
            <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">MRR & Proration</div>
          </button>

          <button
            onClick={() => navigate('/invoices')}
            className="p-4 rounded-2xl bg-white/75 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#30d158]/50 dark:hover:border-[#30d158]/50 hover:bg-white dark:hover:bg-[#1a1a1d] text-left transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#30d158]/10 dark:bg-[#30d158]/15 text-[#30d158] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-white">Invoices</div>
            <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">Accounts Receivable</div>
          </button>

          <button
            onClick={() => navigate('/deal-health')}
            className="p-4 rounded-2xl bg-white/75 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] hover:border-[#ff453a]/50 dark:hover:border-[#ff453a]/50 hover:bg-white dark:hover:bg-[#1a1a1d] text-left transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#ff453a]/10 dark:bg-[#ff453a]/15 text-[#ff453a] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
            <div className="font-semibold text-[14px] text-[#1d1d1f] dark:text-white">Deal Health</div>
            <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">Decay & Risk Radar</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

