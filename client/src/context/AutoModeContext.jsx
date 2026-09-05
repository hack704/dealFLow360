import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STAGES = [
  {
    id: 'cpq',
    number: 1,
    title: 'CPQ & Quotation Builder',
    shortName: '1. CPQ & Quote',
    route: '/quotations/new',
    description: 'Pick products across Hardware, Services & Subscriptions. Observe real-time blended margins and live upsell recommendations with margin deltas.',
    tag: 'Sales Rep'
  },
  {
    id: 'approvals',
    number: 2,
    title: 'Governance & Approval Chains',
    shortName: '2. Approvals',
    route: '/approvals',
    description: 'Blended risk score evaluates category discount ceilings. Multi-tier approval (Manager -> Finance) with justification audit trail.',
    tag: 'Governance'
  },
  {
    id: 'fulfillment',
    number: 3,
    title: 'Warehouse Split Allocation',
    shortName: '3. Fulfillment',
    route: '/fulfillment',
    description: 'Intelligent multi-depot inventory routing (Main Warehouse vs East Depot). Shipping cost weighting optimization with manual split override.',
    tag: 'Operations'
  },
  {
    id: 'billing',
    number: 4,
    title: 'Hybrid Billing & Subscriptions',
    shortName: '4. Billing',
    route: '/subscriptions',
    description: 'Reconcile one-time products with recurring subscription lines. Handles mid-cycle quantity change proration and refund/credit triggers.',
    tag: 'Finance'
  },
  {
    id: 'portal',
    number: 5,
    title: 'Customer Negotiation Portal',
    shortName: '5. Customer Portal',
    route: '/portal',
    description: 'Restricted customer-facing screen. Counter-offer evaluation, line comments, and 1-click confirmation with automatic re-escalation.',
    tag: 'Customer'
  },
  {
    id: 'telemetry',
    number: 6,
    title: 'Deal Health & Anomaly AI',
    shortName: '6. Deal Health',
    route: '/deal-health',
    description: 'Live monitoring of stalled deals (>7 days), rep discount anomalies, delivery slippage, and automated rep nudge action.',
    tag: 'Executive AI'
  }
];

const AutoModeContext = createContext(null);

export const AutoModeProvider = ({ children }) => {
  // Auto Mode enabled by default per user request
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [isMinimized, setIsMinimized] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync currentStageIndex based on current route if user navigates manually
  useEffect(() => {
    const activeIndex = STAGES.findIndex((s) => location.pathname.startsWith(s.route));
    if (activeIndex !== -1 && activeIndex !== currentStageIndex) {
      setCurrentStageIndex(activeIndex);
    }
  }, [location.pathname]);

  const toggleAutoMode = useCallback(() => {
    setIsAutoMode((prev) => {
      const next = !prev;
      if (!next) setIsPlaying(false);
      return next;
    });
  }, []);

  const goToStage = useCallback((index) => {
    const clampedIndex = Math.max(0, Math.min(STAGES.length - 1, index));
    setCurrentStageIndex(clampedIndex);
    setCountdown(6);
    navigate(STAGES[clampedIndex].route);
  }, [navigate]);

  const nextStage = useCallback(() => {
    const nextIndex = (currentStageIndex + 1) % STAGES.length;
    goToStage(nextIndex);
  }, [currentStageIndex, goToStage]);

  const prevStage = useCallback(() => {
    const prevIndex = (currentStageIndex - 1 + STAGES.length) % STAGES.length;
    goToStage(prevIndex);
  }, [currentStageIndex, goToStage]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
    setCountdown(6);
  }, []);

  // Auto-play timer effect
  useEffect(() => {
    if (!isAutoMode || !isPlaying) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          nextStage();
          return 6;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoMode, isPlaying, nextStage]);

  const value = {
    isAutoMode,
    toggleAutoMode,
    stages: STAGES,
    currentStage: STAGES[currentStageIndex],
    currentStageIndex,
    isPlaying,
    togglePlay,
    nextStage,
    prevStage,
    goToStage,
    countdown,
    isMinimized,
    setIsMinimized
  };

  return (
    <AutoModeContext.Provider value={value}>
      {children}
    </AutoModeContext.Provider>
  );
};

export const useAutoMode = () => {
  const context = useContext(AutoModeContext);
  if (!context) {
    return {
      isAutoMode: false,
      toggleAutoMode: () => {},
      stages: STAGES,
      currentStage: STAGES[0],
      currentStageIndex: 0,
      isPlaying: false,
      togglePlay: () => {},
      nextStage: () => {},
      prevStage: () => {},
      goToStage: () => {},
      countdown: 0,
      isMinimized: false,
      setIsMinimized: () => {}
    };
  }
  return context;
};

export default AutoModeContext;
