import React, { useState, useEffect } from 'react';
import type { PlanListItem, Plan } from '../types';
import { translate } from '../utils/i18n';
import { migratePlanSchema } from '../App';
import { 
  Folder, 
  BookOpen, 
  Flame, 
  ChevronRight, 
  Clock, 
  User, 
  X, 
  ChevronDown, 
  ChevronUp,
  Tag
} from 'lucide-react';

interface PlanSelectorProps {
  activePlanId: string | null;
  repositoryUrl: string;
  onSelectPlan: (plan: Plan, startDate: Date, planUrl: string) => void;
  onClose: () => void;
}

interface NavHistoryItem {
  url: string;
  title: string;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  activePlanId,
  repositoryUrl,
  onSelectPlan,
  onClose
}) => {
  const [plans, setPlans] = useState<PlanListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  
  const [navStack, setNavStack] = useState<NavHistoryItem[]>([
    { url: repositoryUrl, title: 'All Plans' }
  ]);

  useEffect(() => {
    setNavStack([
      { url: repositoryUrl, title: 'All Plans' }
    ]);
  }, [repositoryUrl]);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const currentNav = navStack[navStack.length - 1];

  useEffect(() => {
    setLoading(true);
    setError(null);
    const registryUrl = currentNav.url.includes('?') 
      ? `${currentNav.url}&_t=${Date.now()}` 
      : `${currentNav.url}?_t=${Date.now()}`;

    fetch(registryUrl, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load plan registry');
        return res.json();
      })
      .then((data: any) => {
        const plansList = Array.isArray(data) ? data : (data.plans || []);
        setPlans(plansList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(translate('en', 'plans.cacheError') || 'Error loading plans registry');
        setLoading(false);
      });
  }, [currentNav.url]);

  const handleSelectPlanDirect = async (item: PlanListItem, date: Date) => {
    setDownloadingId(item.id);
    try {
      const planUrl = item.url.startsWith('http') || item.url.startsWith('/') ? item.url : `/${item.url}`;
      const cacheBustUrl = planUrl.includes('?') ? `${planUrl}&_t=${Date.now()}` : `${planUrl}?_t=${Date.now()}`;
      
      let planData: Plan;
      try {
        const res = await fetch(cacheBustUrl, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Failed to download plan content from network');
        planData = migratePlanSchema(await res.json());
      } catch (networkErr) {
        const cached = localStorage.getItem(`cached_plan_${item.id}`);
        if (cached) {
          planData = migratePlanSchema(JSON.parse(cached));
        } else {
          throw networkErr;
        }
      }
      
      localStorage.setItem(`cached_plan_${item.id}`, JSON.stringify(planData));
      
      onSelectPlan(planData, date, item.url);
      setDownloadingId(null);
    } catch (err) {
      console.error(err);
      alert(translate('en', 'plans.cacheError'));
      setDownloadingId(null);
    }
  };

  const handleStartPlan = (item: PlanListItem) => {
    handleSelectPlanDirect(item, new Date());
  };

  const handleCategoryClick = (item: PlanListItem) => {
    const rawUrl = item.url;
    const normalizedUrl = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;

    const isCircular = navStack.some((historyItem) => {
      const histNorm = historyItem.url.startsWith('/') ? historyItem.url : `/${historyItem.url}`;
      return histNorm === normalizedUrl;
    });

    if (isCircular) {
      const existingIdx = navStack.findIndex((historyItem) => {
        const histNorm = historyItem.url.startsWith('/') ? historyItem.url : `/${historyItem.url}`;
        return histNorm === normalizedUrl;
      });
      setNavStack(navStack.slice(0, existingIdx + 1));
    } else {
      setNavStack([...navStack, { url: normalizedUrl, title: item.title }]);
    }
  };

  const handleJumpToHistory = (index: number) => {
    setNavStack(navStack.slice(0, index + 1));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content plan-selector-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px', width: '92%' }}
      >
        <div className="modal-header">
          <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} /> {translate('en', 'plans.title')}
          </h2>
          <button 
            className="close-btn" 
            onClick={onClose} 
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {navStack.length > 1 && (
            <div 
              className="plan-breadcrumbs"
              style={{ 
                display: 'flex', 
                gap: '6px', 
                alignItems: 'center', 
                marginBottom: '16px', 
                fontSize: '0.85rem', 
                flexWrap: 'wrap',
                background: 'rgba(0, 0, 0, 0.03)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}
            >
              {navStack.map((historyItem, idx) => {
                const isLast = idx === navStack.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)' }}><ChevronRight size={14} /></span>}
                    {isLast ? (
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{historyItem.title}</span>
                    ) : (
                      <button 
                        onClick={() => handleJumpToHistory(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: 'inherit',
                          fontWeight: 500,
                          textDecoration: 'underline'
                        }}
                      >
                        {historyItem.title}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {loading && <div className="spinner-text">{translate('en', 'plans.loading')}</div>}
          
          {error && <div className="error-alert">{error}</div>}
          
          {!loading && !error && plans.length === 0 && (
            <div className="empty-state">No plans available in this section.</div>
          )}

          {!loading && !error && (
            <div className="simple-plans-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plans.map((item) => {
                const isActive = item.id === activePlanId;
                const isDownloading = downloadingId === item.id;
                const isExpanded = expandedPlanId === item.id;

                return (
                  <div 
                    key={item.id} 
                    className={`simple-plan-row ${isActive ? 'active' : ''}`}
                    style={{
                      background: isActive ? 'var(--primary-light)' : 'var(--bg-card)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 0 0 1px var(--primary)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer', minWidth: 0 }}
                        onClick={() => setExpandedPlanId(isExpanded ? null : item.id)}
                      >
                        <span style={{ color: item.type === 'prayer' || item.type === 'prayer_guide' ? 'var(--accent)' : 'var(--primary)', display: 'inline-flex' }}>
                          {item.type === 'category' ? <Folder size={18} /> : item.type === 'reading' || item.type === 'reading_plan' ? <BookOpen size={18} /> : <Flame size={18} />}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                              {item.title}
                            </span>
                            {isActive && <span className="active-badge">{translate('en', 'plans.activePlan')}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setExpandedPlanId(isExpanded ? null : item.id)}
                          style={{
                            background: 'var(--border-glass)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Toggle plan details"
                        >
                          {isExpanded ? (
                            <><ChevronUp size={14} /> Details</>
                          ) : (
                            <><ChevronDown size={14} /> Details</>
                          )}
                        </button>

                        {item.type === 'category' ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleCategoryClick(item)}
                          >
                            <Folder size={14} /> Browse
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                            onClick={() => handleStartPlan(item)}
                            disabled={isDownloading}
                          >
                            {isDownloading ? 'Loading...' : (isActive ? 'Continue' : 'Start Plan')}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div 
                        className="simple-plan-details" 
                        style={{ 
                          marginTop: '12px', 
                          paddingTop: '12px', 
                          borderTop: '1px dashed var(--border-glass)', 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                          {item.description}
                        </p>
                        <div className="plan-card-meta" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {item.type !== 'category' && item.totalItems && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                              <Clock size={13} /> {item.totalItems} entries
                            </span>
                          )}
                          {item.creator && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <User size={13} /> By {item.creator}
                            </span>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Tag size={13} /> {item.tags.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;
