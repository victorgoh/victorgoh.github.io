import React, { useState, useEffect } from 'react';
import type { PlanListItem, Plan } from '../types';
import { translate } from '../utils/i18n';
import type { LanguageCode } from '../utils/i18n';
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
  ChevronUp 
} from 'lucide-react';

interface PlanSelectorProps {
  lang: LanguageCode;
  activePlanId: string | null;
  repositoryUrl: string;
  onSelectPlan: (plan: Plan, startDate: Date, planUrl: string) => void;
  onClose: () => void;
}

interface NavHistoryItem {
  url: string;
  title: string;
}

const PlanCardIcon: React.FC<{ iconUrl?: string; type: string }> = ({ iconUrl, type }) => {
  const [imgError, setImgError] = useState<boolean>(false);

  if (iconUrl && !imgError) {
    return (
      <img 
        src={iconUrl} 
        alt="" 
        className="plan-card-icon" 
        onError={() => setImgError(true)} 
      />
    );
  }

  return (
    <div className="plan-card-icon-fallback" style={{ color: 'var(--primary)' }}>
      {type === 'category' ? (
        <Folder size={24} />
      ) : type === 'reading_plan' || type === 'reading' ? (
        <BookOpen size={24} />
      ) : (
        <Flame size={24} />
      )}
    </div>
  );
};

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  lang,
  activePlanId,
  repositoryUrl,
  onSelectPlan,
  onClose
}) => {
  const [plans, setPlans] = useState<PlanListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded plan ID in list view
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  
  // Navigation stack for directories (stores absolute/relative endpoint URLs)
  const [navStack, setNavStack] = useState<NavHistoryItem[]>([
    { url: repositoryUrl, title: lang === 'zh' ? '主目录' : lang === 'ms' ? 'Utama' : 'All Plans' }
  ]);

  // Synchronize history stack if the repository URL changes from parent search params
  useEffect(() => {
    setNavStack([
      { url: repositoryUrl, title: lang === 'zh' ? '主目录' : lang === 'ms' ? 'Utama' : 'All Plans' }
    ]);
  }, [repositoryUrl, lang]);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const currentNav = navStack[navStack.length - 1];

  // Dynamic registry fetching based on active stack node with fresh cache
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
        // Safe check for branded registry vs. flat plans list array
        const plansList = Array.isArray(data) ? data : (data.plans || []);
        setPlans(plansList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(translate(lang, 'plans.cacheError') || 'Error loading plans registry');
        setLoading(false);
      });
  }, [currentNav.url, lang]);

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
        // Graceful offline fallback to localStorage cache
        const cached = localStorage.getItem(`cached_plan_${item.id}`);
        if (cached) {
          planData = migratePlanSchema(JSON.parse(cached));
        } else {
          throw networkErr;
        }
      }
      
      // Sync iconUrl from registry item to plan payload
      if (item.iconUrl) planData.iconUrl = item.iconUrl;
      localStorage.setItem(`cached_plan_${item.id}`, JSON.stringify(planData));
      
      onSelectPlan(planData, date, item.url);
      setDownloadingId(null);
    } catch (err) {
      console.error(err);
      alert(translate(lang, 'plans.cacheError'));
      setDownloadingId(null);
    }
  };

  const handleStartPlan = (item: PlanListItem) => {
    // Start plan relative to today's date context
    handleSelectPlanDirect(item, new Date());
  };

  // Safe category navigation check to block circular directory structures
  const handleCategoryClick = (item: PlanListItem) => {
    const rawUrl = item.url;
    // Standardize URL references to catch equivalent pathways
    const normalizedUrl = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;

    // Cycle detection: Check if URL already exists in the nav history trail
    const isCircular = navStack.some((historyItem) => {
      const historyNormalized = historyItem.url.startsWith('/') 
        ? historyItem.url 
        : `/${historyItem.url}`;
      return historyNormalized === normalizedUrl;
    });

    if (isCircular) {
      const alertMsg = lang === 'zh' 
        ? '检测到循环目录引用！无法打开此分类，防止无限加载循环。' 
        : lang === 'ms'
          ? 'Rujukan pekeliling dikesan! Gagal membuka kategori untuk mengelakkan kitaran tak terhingga.'
          : 'Circular reference detected in plan directory! Blocked navigation to avoid infinite recursion loops.';
      alert(alertMsg);
      return;
    }

    // Push new category endpoint to the directory stack
    setNavStack([...navStack, { url: normalizedUrl, title: item.title }]);
  };

  const handleJumpToHistory = (index: number) => {
    setNavStack(navStack.slice(0, index + 1));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{translate(lang, 'plans.title')}</h2>
          <button className="close-btn" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
        </div>
        
        <div className="modal-body">
          {/* Breadcrumbs Navigation Stack */}
          {navStack.length > 1 && (
            <div 
              className="breadcrumbs" 
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

          {loading && <div className="spinner-text">{translate(lang, 'plans.loading')}</div>}
          
          {error && <div className="error-alert">{error}</div>}
          
          {!loading && !error && plans.length === 0 && (
            <div className="empty-state">No plans available in this section.</div>
          )}

          {!loading && !error && (
            /* Simple List View with Collapsible Details */
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
                      padding: '12px 14px',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 0 0 1px var(--primary)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      {/* Title & Icon Header */}
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer', minWidth: 0 }}
                        onClick={() => setExpandedPlanId(isExpanded ? null : item.id)}
                      >
                        <span style={{ color: item.type === 'prayer' || item.type === 'prayer_guide' ? 'var(--accent)' : 'var(--primary)', display: 'inline-flex' }}>
                          {item.type === 'category' ? <Folder size={18} /> : item.type === 'reading' || item.type === 'reading_plan' ? <BookOpen size={18} /> : <Flame size={18} />}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                              {item.title}
                            </span>
                            {isActive && <span className="active-badge">{translate(lang, 'plans.activePlan')}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setExpandedPlanId(isExpanded ? null : item.id)}
                          style={{
                            background: 'var(--border-glass)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '5px 9px',
                            fontSize: '0.78rem',
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
                            <><ChevronUp size={14} /> {lang === 'zh' ? '收起' : lang === 'ms' ? 'Tutup' : 'Details'}</>
                          ) : (
                            <><ChevronDown size={14} /> {lang === 'zh' ? '详情' : lang === 'ms' ? 'Butiran' : 'Details'}</>
                          )}
                        </button>

                        {item.type === 'category' ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleCategoryClick(item)}
                          >
                            <Folder size={14} /> {lang === 'zh' ? '浏览' : lang === 'ms' ? 'Semak' : 'Browse'}
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                            onClick={() => handleStartPlan(item)}
                            disabled={isDownloading}
                          >
                            {isDownloading ? '...' : translate(lang, 'plans.startPlanBtn')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable details panel */}
                    {isExpanded && (
                      <div 
                        className="simple-plan-details" 
                        style={{ 
                          marginTop: '10px', 
                          paddingTop: '10px', 
                          borderTop: '1px dashed var(--border-glass)', 
                          animation: 'fadeIn 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <PlanCardIcon iconUrl={item.iconUrl} type={item.type} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                              {item.description}
                            </p>
                            <div className="plan-card-meta" style={{ marginTop: '4px', fontSize: '0.8rem', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {item.type !== 'category' && item.totalItems && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} /> {lang === 'zh' ? `${item.totalItems} 个阶段` : lang === 'ms' ? `${item.totalItems} Sesi` : `${item.totalItems} Sessions`}
                                </span>
                              )}
                              {item.creator && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <User size={12} /> {translate(lang, 'plans.creator')}: {item.creator}
                                </span>
                              )}
                            </div>
                          </div>
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
