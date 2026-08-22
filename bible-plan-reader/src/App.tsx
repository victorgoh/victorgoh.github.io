import React, { useState, useEffect, useRef } from 'react';
import type { Plan, UserPlanMetadata, UserPreferences, Organization } from './types';
import { translate } from './utils/i18n';
import type { LanguageCode } from './utils/i18n';
import { PlanSelector } from './components/PlanSelector';
import SessionSelectorList from './components/SessionSelectorList';
import { fetchHelloAoPassage } from './utils/helloAoBible';
import ReactMarkdown from 'react-markdown';
import {
  Moon,
  Sun,
  ClipboardList,
  Settings,
  BookOpen,
  Globe,
  Flame,
  FileText,
  Check,
  Link,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Scroll,
  Tv,
  Music,
  HelpCircle,
  Target,
  RotateCcw,
  Church,
  X
} from 'lucide-react';

// Utility helper to safely load item from localStorage
const loadLocalState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

export const migratePlanSchema = (plan: any): Plan => {
  if (plan) {
    if (!plan.items && plan.days) {
      plan.items = plan.days;
      delete plan.days;
    }
    if (Array.isArray(plan.items)) {
      plan.items = plan.items.map((d: any) => ({
        item: d.item ?? d.day,
        title: d.title,
        passages: d.passages,
        devotional: d.devotional,
        media: d.media,
        prayers: d.prayers,
        reflect: d.reflect || d.reflectionQuestions,
        practice: d.practice || d.actionSteps
      }));
    }
  }
  return plan;
};

const BIBLE_VERSIONS = [
  { code: 'BSB', name: 'Berean Standard Bible (BSB) - English' },
  { code: 'WEB', name: 'World English Bible (WEB) - English' },
  { code: 'KJV', name: 'King James Version (KJV) - English' },
  { code: 'CU1', name: 'Chinese Union Version Simplified (新标点和合本-简)' },
  { code: 'CUV', name: 'Chinese Union Version Traditional (新標點和合本-繁)' },
  { code: 'TB',  name: 'Indonesian Terjemahan Baru (TB) / Melayu' }
];

export const App: React.FC = () => {
  // Automatic cache invalidation when plan schemas or JSON content are updated
  const CACHE_VERSION = 'v1.1';
  try {
    if (localStorage.getItem('app_plan_cache_version') !== CACHE_VERSION) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('cached_plan_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('app_plan_cache_version', CACHE_VERSION);
    }
  } catch (e) {
    console.error(e);
  }

  // Dynamic custom repository URL state (URL query param "?repo=" overrides localStorage, falls back to default '/plans.json')
  const [repositoryUrl] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const repoParam = params.get('repo');
    if (repoParam && repoParam.startsWith('https://')) {
      const cleanRepo = encodeURI(repoParam);
      localStorage.setItem('custom_plans_repository', cleanRepo);
      return cleanRepo;
    }
    return localStorage.getItem('custom_plans_repository') || '/plans.json';
  });

  // Organization branding details
  const [orgInfo, setOrgInfo] = useState<Organization | null>(null);

  // Theme & Preferences State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const local = localStorage.getItem('app_theme');
    if (local === 'light' || local === 'dark') return local;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [pref, setPref] = useState<UserPreferences>(() => {
    const loaded = loadLocalState<UserPreferences>('user_preferences', {
      language: 'en',
      bibleTranslation: 'NIV',
      fontSize: 'medium',
      fontTheme: 'editorial'
    });
    if (loaded.fontTheme !== 'editorial' && loaded.fontTheme !== 'warm') {
      loaded.fontTheme = 'editorial';
    }
    return loaded;
  });

  // Active Plan States
  const [activePlan, setActivePlan] = useState<Plan | null>(() => {
    const activeId = localStorage.getItem('active_plan_id');
    if (activeId) {
      const cached = localStorage.getItem(`cached_plan_${activeId}`);
      if (cached) {
        try {
          return migratePlanSchema(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      }
    }
    return null;
  });

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const activeId = localStorage.getItem('active_plan_id');
    if (activeId) {
      const meta = loadLocalState<UserPlanMetadata | null>(`plan_metadata_${activeId}`, null);
      if (meta && meta.startDate) return new Date(meta.startDate);
    }
    return null;
  });

  const [currentItem, setCurrentItem] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    if (sessionParam) {
      const parsed = parseInt(sessionParam);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1;
  });
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showShareHelp, setShowShareHelp] = useState<boolean>(false);
  const [headerExpanded, setHeaderExpanded] = useState<boolean>(false);
  
  // Modal Overlays
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showItemSelector, setShowItemSelector] = useState<boolean>(false);
  const [showBottomSelector, setShowBottomSelector] = useState<boolean>(false);
  const bottomSessionListRef = useRef<HTMLDivElement | null>(null);
  const sessionListRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll active session row into view when selector popover is toggled open
  useEffect(() => {
    if (showItemSelector) {
      const timer = setTimeout(() => {
        const activeItem = document.getElementById(`session-selector-item-${currentItem}`);
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showItemSelector, currentItem]);

  // Local Bible API text fetch cache states
  const [fetchedPassages, setFetchedPassages] = useState<Record<string, string>>({});
  const [loadingPassages, setLoadingPassages] = useState<Record<string, boolean>>({});

  // Active Plan Metadata (progress, journal, checkboxes)
  const [planMetadata, setPlanMetadata] = useState<UserPlanMetadata>(() => {
    const activeId = localStorage.getItem('active_plan_id');
    if (activeId) {
      return loadLocalState<UserPlanMetadata>(`plan_metadata_${activeId}`, {
        startDate: new Date().toISOString(),
        progress: [],
        completedItems: {}
      });
    }
    return {
      startDate: new Date().toISOString(),
      progress: [],
      completedItems: {}
    };
  });

  // Parse dynamic plans shared via link "?plan=" on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const startParam = params.get('start'); // e.g. YYYY-MM-DD
    const sessionParam = params.get('session');
    
    if (planParam) {
      const cleanPlan = encodeURI(planParam);
      const fetchUrl = cleanPlan.startsWith('http') ? cleanPlan : `/${cleanPlan}`;
      fetch(fetchUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load shared plan');
          return res.json();
        })
        .then((plan: Plan) => {
          const migrated = migratePlanSchema(plan);
          // Cache plan payload
          localStorage.setItem(`cached_plan_${migrated.id}`, JSON.stringify(migrated));
          localStorage.setItem('active_plan_id', migrated.id);
          localStorage.setItem(`active_plan_url_${migrated.id}`, cleanPlan);
          
          // Calculate start date
          const parsedStart = startParam ? new Date(startParam) : new Date();
          const dateStr = parsedStart.toISOString();
          localStorage.setItem(`plan_metadata_${migrated.id}`, JSON.stringify({
            startDate: dateStr,
            progress: [],
            completedItems: {}
          }));
          
          // Clear query params and redirect to load plan with session
          const nextSearch = sessionParam ? `?session=${sessionParam}` : '';
          const redirectUrl = window.location.origin + window.location.pathname + nextSearch;
          window.location.href = redirectUrl;
        })
        .catch((err) => {
          console.error('Error loading shared plan via link:', err);
          alert('Failed to load the shared bible plan. Please check the URL.');
        });
    }
    
    // Clear "?repo" parameter so it stays clean in address bar
    if (params.get('repo')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch organization branding details
  useEffect(() => {
    fetch(repositoryUrl)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && !Array.isArray(data) && data.organization) {
          setOrgInfo(data.organization as Organization);
        } else {
          setOrgInfo(null);
        }

        const plansList = Array.isArray(data) ? data : (data?.plans || []);
        const activeId = localStorage.getItem('active_plan_id');
        if (plansList.length > 0) {
          const matchedItem = activeId ? plansList.find((p: any) => p.id === activeId) : null;
          if (matchedItem) {
            setActivePlan((prev) => {
              if (!prev) return prev;
              const updated = {
                ...prev,
                bannerUrl: matchedItem.bannerUrl || prev.bannerUrl,
                iconUrl: matchedItem.iconUrl || prev.iconUrl
              };
              localStorage.setItem(`cached_plan_${activeId}`, JSON.stringify(updated));
              return updated;
            });
          } else {
            // Auto fallback to first available plan if current active plan ID is invalid/deleted or null
            const fallbackItem = plansList.find((p: any) => p.type !== 'category') || plansList[0];
            if (fallbackItem && fallbackItem.url) {
              fetch(`/${fallbackItem.url}`)
                .then((res) => res.json())
                .then((rawPlan) => {
                  const planData = migratePlanSchema(rawPlan);
                  if (fallbackItem.bannerUrl) planData.bannerUrl = fallbackItem.bannerUrl;
                  if (fallbackItem.iconUrl) planData.iconUrl = fallbackItem.iconUrl;
                  localStorage.setItem(`cached_plan_${fallbackItem.id}`, JSON.stringify(planData));
                  localStorage.setItem('active_plan_id', fallbackItem.id);
                  localStorage.setItem(`active_plan_url_${fallbackItem.id}`, fallbackItem.url);
                  setActivePlan(planData);
                })
                .catch((e) => console.error('Error loading fallback plan:', e));
            }
          }
        }
      })
      .catch((err) => {
        console.error('Error loading organization details:', err);
        setOrgInfo(null);
      });
  }, [repositoryUrl]);



  // Removed Journal auto-save timer/status hooks

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Sync font size and theme configurations to html classes
  useEffect(() => {
    // Clear old classes
    document.documentElement.classList.remove(
      'size-small', 'size-medium', 'size-large', 'size-xl',
      'theme-font-modern', 'theme-font-editorial', 'theme-font-warm', 'theme-font-majestic'
    );
    
    // Add current classes
    document.documentElement.classList.add(`size-${pref.fontSize || 'medium'}`);
    const activeTheme = (pref.fontTheme === 'warm') ? 'warm' : 'editorial';
    document.documentElement.classList.add(`theme-font-${activeTheme}`);
  }, [pref.fontSize, pref.fontTheme]);

  // Recalculate item when plan or start date changes (on startup or plan load)
  useEffect(() => {
    if (activePlan) {
      // Check if session query param was supplied to override date/progress
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get('session');
      
      if (sessionParam) {
        const parsed = parseInt(sessionParam);
        if (!isNaN(parsed) && parsed > 0 && parsed <= activePlan.items.length) {
          setCurrentItem(parsed);
          
          // Clear query param asynchronously to avoid resetting during React mount/remount cycles
          setTimeout(() => {
            const cleanUrl = new URL(window.location.href);
            if (cleanUrl.searchParams.has('session')) {
              cleanUrl.searchParams.delete('session');
              window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);
            }
          }, 1000);
          return;
        }
      }

      // If a session parameter is present in the URL, bypass the default date/progress calculation
      if (params.has('session')) {
        return;
      }

      if (planMetadata.progress && planMetadata.progress.length > 0) {
        // Show the next item after the last completed item
        const maxCompleted = Math.max(...planMetadata.progress);
        const nextItem = maxCompleted + 1;
        const targetItem = Math.min(activePlan.items.length, nextItem);
        setCurrentItem(targetItem);
      } else if (startDate) {
        // Fall back to date elapsed calculation if there is no progress
        const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const today = new Date();
        const curr = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const diffTime = curr.getTime() - start.getTime();
        const diffItems = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const targetItem = Math.max(1, Math.min(activePlan.items.length, diffItems));
        setCurrentItem(targetItem);
      }
    }
  }, [activePlan, startDate]);



  // Load correct metadata when active plan ID changes
  const handleSelectPlan = (plan: Plan, selectedStartDate: Date, planUrl: string) => {
    localStorage.setItem('active_plan_id', plan.id);
    localStorage.setItem(`active_plan_url_${plan.id}`, planUrl);
    setActivePlan(plan);
    
    // Convert date string for storage safely
    const dateStr = selectedStartDate.toISOString();
    setStartDate(selectedStartDate);

    const loadedMeta = loadLocalState<UserPlanMetadata>(`plan_metadata_${plan.id}`, {
      startDate: dateStr,
      progress: [],
      completedItems: {}
    });
    
    // Explicitly enforce current start date update
    loadedMeta.startDate = dateStr;
    
    setPlanMetadata(loadedMeta);
    localStorage.setItem(`plan_metadata_${plan.id}`, JSON.stringify(loadedMeta));
    setShowSelector(false);
  };

  const updateMetadata = (newMeta: UserPlanMetadata) => {
    if (!activePlan) return;
    setPlanMetadata(newMeta);
    localStorage.setItem(`plan_metadata_${activePlan.id}`, JSON.stringify(newMeta));
  };

  const togglePassageInline = async (pReference: string, idx: number, hasLocalText: boolean) => {
    const updatedCompletedItems = { ...planMetadata.completedItems };
    if (!updatedCompletedItems[currentItem]) {
      updatedCompletedItems[currentItem] = {};
    }
    const nextState = !updatedCompletedItems[currentItem][`passage-inline-${idx}`];
    updatedCompletedItems[currentItem][`passage-inline-${idx}`] = nextState;
    updateMetadata({ ...planMetadata, completedItems: updatedCompletedItems });

    const passageKey = `${pReference}_${pref.bibleTranslation || 'BSB'}`;
    if (nextState && !hasLocalText && !fetchedPassages[passageKey] && !loadingPassages[passageKey]) {
      setLoadingPassages(prev => ({ ...prev, [passageKey]: true }));
      try {
        const text = await fetchHelloAoPassage(pReference, pref.bibleTranslation || 'BSB');
        setFetchedPassages(prev => ({ ...prev, [passageKey]: text }));
      } catch (err) {
        console.error('HelloAO Scripture Fetch Error:', err);
        setFetchedPassages(prev => ({
          ...prev,
          [passageKey]: 'Could not load Scripture text. Please check your connection or consult your personal Bible.'
        }));
      } finally {
        setLoadingPassages(prev => ({ ...prev, [passageKey]: false }));
      }
    }
  };

  const handleRestartPlan = () => {
    if (!activePlan) return;
    const confirmText = pref.language === 'zh' 
      ? '确定要重置当前计划的进度吗？' 
      : pref.language === 'ms'
        ? 'Adakah anda pasti mahu menetapkan semula kemajuan rancangan ini?'
        : 'Are you sure you want to reset all progress for this plan?';
        
    if (window.confirm(confirmText)) {
      const resetMeta: UserPlanMetadata = {
        startDate: new Date().toISOString(),
        progress: [],
        completedItems: {}
      };
      setStartDate(new Date());
      updateMetadata(resetMeta);
      setCurrentItem(1);
    }
  };

  const handleUpdateSettings = (updatedPref: UserPreferences) => {
    setPref(updatedPref);
    localStorage.setItem('user_preferences', JSON.stringify(updatedPref));
    setShowSettings(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Translate wrapper
  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(pref.language, key, params);
  };

  // Helper to parse embedded media links
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {
      console.log('Error parsing youtube link', e);
    }
    return '';
  };

  const isPrayer = activePlan?.type === 'prayer_guide';
  const totalItems = activePlan?.items.length || 1;
  const activeItemConfig = activePlan?.items.find((d) => d.item === currentItem);





  const handleShareSession = () => {
    if (!activePlan) return;
    const planUrl = localStorage.getItem(`active_plan_url_${activePlan.id}`) || `plans/${activePlan.id}.json`;
    const fullUrl = planUrl.startsWith('http') ? planUrl : new URL(planUrl, window.location.origin).href;
    const shareUrl = `${window.location.origin}${window.location.pathname}?plan=${encodeURIComponent(fullUrl)}&session=${currentItem}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareStatus('copied');
        setTimeout(() => setShareStatus(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        alert(`${t('itemView.shareSession')}: ${shareUrl}`);
      });
  };
  return (
    <div className="app-container">
      {/* Top Header Glass */}
      <header 
        className={`header-glass ${headerExpanded ? 'expanded' : 'collapsed'}`} 
        onClick={() => setHeaderExpanded(!headerExpanded)} 
        style={{ cursor: 'pointer', padding: headerExpanded ? '16px 20px' : '10px 20px', transition: 'all 0.2s ease' }}
      >
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {orgInfo?.logoUrl ? (
            <img 
              src={orgInfo.logoUrl} 
              alt="" 
              style={{ 
                height: headerExpanded ? '32px' : '20px', 
                objectFit: 'contain', 
                transition: 'height 0.2s ease' 
              }} 
            />
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Church size={headerExpanded ? 24 : 18} />
            </span>
          )}
          
          {headerExpanded ? (
            <div style={{ display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
              <h1 style={{ fontSize: '1.2rem', margin: 0 }}>
                {orgInfo ? orgInfo.name : t('appTitle')}
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {t('subtitle')}
              </p>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {orgInfo ? orgInfo.name : t('appTitle')}
            </span>
          )}
        </div>
        <div className="header-controls" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '6px' }}>
          <button className="icon-btn" onClick={toggleTheme} title={t('settings.theme')} aria-label="Toggle Dark Mode" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="icon-btn" onClick={() => setShowSelector(true)} title={t('plans.choosePlan')} aria-label="Change Plan" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
            <ClipboardList size={18} />
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title={t('settings.title')} aria-label="Settings" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Active Plan Info Section */}
      {activePlan && (
        <section 
          className="active-plan-banner-wrapper"
          style={{ 
            padding: headerExpanded ? '16px 20px' : '10px 16px',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="active-plan-info" style={{ textAlign: 'left', width: '100%' }}>
            <span style={{ 
              fontSize: headerExpanded ? '0.75rem' : '0.65rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              color: 'var(--primary)',
              fontWeight: 700
            }}>
              {activePlan.type === 'reading' || activePlan.type === 'reading_plan' ? t('tabs.readReflect') : t('tabs.prayer')}
            </span>
            <h2 style={{ 
              fontSize: headerExpanded ? '1.3rem' : '1.05rem', 
              marginTop: '2px', 
              marginBottom: '0', 
              color: 'var(--text-main)',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}>
              {activePlan.title}
            </h2>
          </div>
        </section>
      )}

      {/* Main View Shell */}
      {!activePlan ? (
        <div className="empty-view">
          {orgInfo?.logoUrl ? (
            <img 
              src={orgInfo.logoUrl} 
              alt="" 
              style={{ height: '80px', width: '80px', objectFit: 'contain', marginBottom: '16px', borderRadius: '16px' }} 
            />
          ) : (
            <div className="empty-view-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={48} />
            </div>
          )}
          <h2>Welcome to {orgInfo ? orgInfo.name : t('appTitle')}</h2>
          <p>{orgInfo ? `Browse plans provided by ${orgInfo.name} to begin your daily devotion.` : 'Please select a reading plan or prayer guide to begin your daily devotion.'}</p>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => setShowSelector(true)}>
              Browse Available Plans
            </button>
            {orgInfo?.website && (
              <a 
                href={orgInfo.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Globe size={16} /> Visit Website
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="content-grid">
            <main className="main-content-card">
              {activeItemConfig ? (
                <>
                  <div className="item-view-header" style={{ position: 'relative' }}>
                    <div className="item-view-title">
                      <h2>{activeItemConfig.title}</h2>
                      <div className="item-view-subtitle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <button 
                            className="item-selector-trigger"
                            onClick={() => setShowItemSelector(!showItemSelector)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '6px 12px',
                              margin: '-6px -12px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontFamily: 'var(--font-ui)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isPrayer ? <Flame size={16} /> : <FileText size={16} />} {isPrayer 
                               ? t('itemView.itemHeaderPrayer', { item: currentItem }) 
                               : t('itemView.itemHeaderReading', { item: currentItem })} <ChevronDown size={14} />
                          </button>

                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', position: 'relative', marginLeft: '6px' }}>
                            <button
                              className="share-session-trigger"
                              onClick={handleShareSession}
                              title={t('itemView.shareWithFriend')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: shareStatus === 'copied' ? 'var(--success)' : 'var(--text-muted)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                fontFamily: 'var(--font-ui)'
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{shareStatus === 'copied' ? <Check size={14} /> : <Link size={14} />}</span>
                              <span style={{ fontSize: '0.75rem' }}>
                                {shareStatus === 'copied' ? t('itemView.shareCopied') : t('itemView.shareWithFriend')}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowShareHelp(!showShareHelp);
                              }}
                              onMouseEnter={() => setShowShareHelp(true)}
                              onMouseLeave={() => setShowShareHelp(false)}
                              title="What is this?"
                              aria-label="Share Information"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                                borderRadius: '50%',
                                opacity: 0.75
                              }}
                            >
                              <HelpCircle size={13} />
                            </button>

                            {showShareHelp && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  width: '230px',
                                  background: 'var(--bg-card)',
                                  backdropFilter: 'blur(var(--blur-glass))',
                                  border: '1px solid var(--border-glass)',
                                  borderRadius: '12px',
                                  padding: '10px 14px',
                                  marginTop: '6px',
                                  boxShadow: 'var(--shadow-md)',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.4,
                                  color: 'var(--text-main)',
                                  zIndex: 110,
                                  animation: 'fadeIn 0.15s ease'
                                }}
                              >
                                <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>💡 {t('itemView.shareWithFriend')}</div>
                                {t('itemView.shareHelpTooltip')}
                              </div>
                            )}
                          </div>
                        </div>

                        {showItemSelector && (
                          <div 
                            className="item-selector-popover"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: 'var(--bg-card)',
                              backdropFilter: 'blur(var(--blur-glass))',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '16px',
                              padding: '16px',
                              marginTop: '12px',
                              boxShadow: 'var(--shadow-md)',
                              animation: 'fadeIn 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              zIndex: 10,
                              boxSizing: 'border-box'
                            }}
                          >
                            {/* Header details */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              <span>
                                {pref.language === 'zh' ? '选择阶段' : pref.language === 'ms' ? 'Pilih Sesi' : 'Select Session'}
                              </span>
                              <span>
                                {currentItem} / {totalItems}
                              </span>
                            </div>

                            {/* Scrollable list of session titles */}
                            <div 
                              ref={sessionListRef}
                              className="session-selector-list"
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                paddingRight: '4px',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                              }}
                            >
                              {activePlan.items.map((day) => {
                                const isCompleted = planMetadata.progress.includes(day.item);
                                const isCurrent = day.item === currentItem;
                                
                                return (
                                  <button
                                    key={day.item}
                                    id={`session-selector-item-${day.item}`}
                                    onClick={() => {
                                      setCurrentItem(day.item);
                                      setShowItemSelector(false);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`session-selector-row ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '10px 12px',
                                      borderRadius: '10px',
                                      border: isCurrent ? '1px solid var(--primary)' : '1px solid transparent',
                                      background: isCurrent ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.02)',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      width: '100%',
                                      transition: 'all 0.15s ease',
                                      color: 'inherit',
                                      fontFamily: 'inherit',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    {/* Left Circle Indicator */}
                                    <div 
                                      className={`circle-indicator ${isCompleted ? 'completed' : ''}`}
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        border: isCompleted ? 'none' : '2px solid var(--text-muted)',
                                        background: isCompleted ? 'var(--success)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        fontSize: '0.65rem',
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      {isCompleted && <Check size={12} strokeWidth={3} />}
                                    </div>

                                    {/* Text Column */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600, 
                                        color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '2px'
                                      }}>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}>
                                          {activePlan?.type === 'prayer_guide' ? (
                                            <Flame size={12} aria-label="Prayer guide" />
                                          ) : (
                                            <FileText size={12} aria-label="Reading session" />
                                          )}
                                          <span style={{ marginLeft: '6px' }}>
                                            {pref.language === 'zh' ? `第 ${day.item} 阶段` : pref.language === 'ms' ? `Sesi ${day.item}` : `Session ${day.item}`}
                                          </span>
                                        </div>
                                      </div>
                                      <div style={{ 
                                        fontSize: '0.9rem', 
                                        fontWeight: isCurrent ? 600 : 500, 
                                        color: 'var(--text-main)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {day.title}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeItemConfig.passages && activeItemConfig.passages.length > 0 && (
                    <div className="passage-section">
                      <h4 className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><BookOpen size={14} /> {t('itemView.readPassages')}</h4>
                      <div className="passage-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeItemConfig.passages.map((p, idx) => {
                          const isInlineOpen = planMetadata?.completedItems?.[currentItem]?.[`passage-inline-${idx}`] || false;
                          const passageKey = `${p.reference}_${pref.bibleTranslation || 'BSB'}`;
                          const isFetching = loadingPassages[passageKey];
                          const fetchedText = fetchedPassages[passageKey];

                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button
                                className="passage-toggle-btn"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  background: 'var(--bg-glass)',
                                  border: '1px solid var(--border-glass)',
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  color: 'var(--text-main)',
                                  fontSize: '1rem',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={() => togglePassageInline(p.reference, idx, !!p.text)}
                              >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  <BookOpen size={16} /> {p.reference}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  {isInlineOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </span>
                              </button>
                              
                              {isInlineOpen && (
                                <div 
                                  className="bible-text-panel" 
                                  style={{ 
                                    background: 'var(--bg-card)', 
                                    border: '1px solid var(--border-glass)', 
                                    borderRadius: '12px', 
                                    padding: '16px 20px', 
                                    fontSize: '1.05rem', 
                                    lineHeight: '1.75', 
                                    color: 'var(--text-main)',
                                    fontFamily: 'var(--font-serif)'
                                  }}
                                >
                                  {p.text ? (
                                    <ReactMarkdown>{p.text}</ReactMarkdown>
                                  ) : isFetching ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}><Loader2 size={16} className="spin" /> Loading Scripture text...</span>
                                  ) : fetchedText ? (
                                    <ReactMarkdown>{fetchedText}</ReactMarkdown>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Could not load Scripture text. Please check your connection.</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeItemConfig.devotional && (
                    <div className="devotional-section">
                      <h4 className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Scroll size={14} /> Devotional</h4>
                      {activeItemConfig.devotional.title && (
                        <h3 className="devotional-title">{activeItemConfig.devotional.title}</h3>
                      )}
                      {activeItemConfig.devotional.author && (
                        <div className="devotional-author">
                          {t('itemView.devotionalBy', { author: activeItemConfig.devotional.author })}
                        </div>
                      )}

                      {activeItemConfig.media && (
                        <div className="devotional-media-container">
                          {activeItemConfig.media.image?.url && (
                            <div className="media-image-wrapper">
                              <img src={activeItemConfig.media.image.url} alt={activeItemConfig.media.image.caption || "Devotional illustration"} />
                              {activeItemConfig.media.image.caption && (
                                <div className="media-image-caption">{activeItemConfig.media.image.caption}</div>
                              )}
                            </div>
                          )}
                          
                          {activeItemConfig.media.video?.url && (
                            <div className="media-video-wrapper">
                              {getYouTubeEmbedUrl(activeItemConfig.media.video.url) ? (
                                <iframe 
                                  src={getYouTubeEmbedUrl(activeItemConfig.media.video.url)}
                                  title={activeItemConfig.media.video.title || "Video"}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <a href={activeItemConfig.media.video.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Tv size={16} /> Play Video: {activeItemConfig.media.video.title || 'Link'}
                                </a>
                              )}
                            </div>
                          )}

                          {activeItemConfig.media.audio?.url && (
                            <div className="media-audio-wrapper">
                              <div className="audio-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Music size={16} /> {activeItemConfig.media.audio.title || 'Devotional Audio Podcast'}</div>
                              <audio controls src={activeItemConfig.media.audio.url} />
                            </div>
                          )}
                        </div>
                      )}

                      {activeItemConfig.devotional.content && (
                        <div className="devotional-content"><ReactMarkdown>{activeItemConfig.devotional.content}</ReactMarkdown></div>
                      )}
                    </div>
                  )}

                  {((activeItemConfig.reflect && activeItemConfig.reflect.length > 0) || (activeItemConfig.reflectionQuestions && activeItemConfig.reflectionQuestions.length > 0)) && (
                    <div className="passage-section">
                      <h4 className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><HelpCircle size={14} /> {t('itemView.reflectionQuestions')}</h4>
                      <ol className="questions-list">
                        {(activeItemConfig.reflect || activeItemConfig.reflectionQuestions || []).map((q, idx) => (
                          <li key={idx}><ReactMarkdown components={{ p: React.Fragment }}>{q}</ReactMarkdown></li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {((activeItemConfig.practice && activeItemConfig.practice.length > 0) || (activeItemConfig.actionSteps && activeItemConfig.actionSteps.length > 0)) && (
                    <div className="passage-section">
                      <h4 className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> {t('itemView.actionSteps')}</h4>
                      <ol className="action-steps-list">
                        {(activeItemConfig.practice || activeItemConfig.actionSteps || []).map((step, idx) => (
                          <li key={idx}><ReactMarkdown components={{ p: React.Fragment }}>{step}</ReactMarkdown></li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {activeItemConfig.prayers && activeItemConfig.prayers.length > 0 && (
                    <div className="passage-section">
                      <h4 className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Flame size={14} /> {t('tabs.prayer')}</h4>
                      <div className="prayers-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activeItemConfig.prayers.map((p, idx) => (
                          <div key={idx} className="prayer-item-display" style={{ borderLeft: '3px solid var(--primary-light)', paddingLeft: '16px' }}>
                            <div className="prayer-topic" style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                              {p.topic}
                            </div>
                            <div className="prayer-desc">
                              <ReactMarkdown components={{ p: React.Fragment }}>{p.description}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bottom-controls-section" style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-glass)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Prev Button */}
                      <button
                        className="btn btn-secondary"
                        disabled={currentItem <= 1}
                        onClick={() => {
                          if (currentItem > 1) {
                            setCurrentItem(currentItem - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        title={t('itemView.prevSession')}
                        aria-label="Previous Session"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          opacity: currentItem <= 1 ? 0.4 : 1,
                          cursor: currentItem <= 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <ChevronLeft size={20} />
                      </button>

                      {/* Sessions Dropdown Selector */}
                      <div style={{ position: 'relative' }}>
                        <button
                          className="item-selector-trigger"
                          onClick={() => setShowBottomSelector(!showBottomSelector)}
                          style={{
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--primary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: 'var(--font-ui)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isPrayer ? <Flame size={16} /> : <FileText size={16} />}
                          <span>{isPrayer ? t('itemView.itemHeaderPrayer', { item: currentItem }) : t('itemView.itemHeaderReading', { item: currentItem })}</span>
                          <ChevronDown size={14} />
                        </button>

                        {showBottomSelector && (
                          <div
                            className="item-selector-popover"
                            style={{
                              position: 'absolute',
                              bottom: '120%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '320px',
                              maxWidth: '90vw',
                              background: 'var(--bg-card)',
                              backdropFilter: 'blur(var(--blur-glass))',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '16px',
                              padding: '16px',
                              boxShadow: 'var(--shadow-md)',
                              animation: 'fadeIn 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              zIndex: 100,
                              boxSizing: 'border-box'
                            }}
                          >
                            <SessionSelectorList
                              ref={bottomSessionListRef}
                              items={activePlan.items.map(item => ({ item: item.item, title: item.title }))}
                              currentItem={currentItem}
                              completedItems={planMetadata.progress}
                              planType={activePlan?.type ?? 'reading'}
                              onSelect={(item) => {
                                setCurrentItem(item);
                                setShowBottomSelector(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Mark Done / Completed Button */}
                      <button 
                        className={`btn ${planMetadata.progress.includes(currentItem) ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}
                        onClick={() => {
                          const itemProgress = [...planMetadata.progress];
                          const idx = itemProgress.indexOf(currentItem);
                          if (idx === -1) {
                            itemProgress.push(currentItem);
                          } else {
                            itemProgress.splice(idx, 1);
                          }
                          updateMetadata({
                            ...planMetadata,
                            progress: itemProgress
                          });
                        }}
                      >
                        {planMetadata.progress.includes(currentItem) ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                            <Check size={18} /> {t('itemView.completed')}
                          </span>
                        ) : (
                          t('itemView.markComplete')
                        )}
                      </button>

                      {/* Next Button */}
                      <button
                        className="btn btn-secondary"
                        disabled={!activePlan || currentItem >= activePlan.items.length}
                        onClick={() => {
                          if (activePlan && currentItem < activePlan.items.length) {
                            setCurrentItem(currentItem + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        title={t('itemView.nextSession')}
                        aria-label="Next Session"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          opacity: (!activePlan || currentItem >= activePlan.items.length) ? 0.4 : 1,
                          cursor: (!activePlan || currentItem >= activePlan.items.length) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                </>
              ) : (
                <div className="empty-view">Day configuration not found.</div>
              )}
            </main>
        </div>
      )}

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Settings size={20} /> {t('settings.title')}</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Language Selection */}
              <div className="form-group">
                <label htmlFor="settings-language">{t('settings.language')}</label>
                <select
                  id="settings-language"
                  value={pref.language}
                  onChange={(e) => handleUpdateSettings({ ...pref, language: e.target.value as LanguageCode })}
                >
                  <option value="en">English</option>
                  <option value="zh">中文 (Chinese)</option>
                  <option value="ms">Bahasa Melayu (BM)</option>
                </select>
              </div>

               {/* Bible Version Selection */}
              <div className="form-group">
                <label htmlFor="settings-bible-version">{t('settings.bibleVersion')}</label>
                <select
                  id="settings-bible-version"
                  value={pref.bibleTranslation}
                  onChange={(e) => handleUpdateSettings({ ...pref, bibleTranslation: e.target.value })}
                >
                  {BIBLE_VERSIONS.map((v) => (
                    <option key={v.code} value={v.code}>{v.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  *{t('settings.bibleVersionHint')}
                </p>
              </div>

              {/* Font Size Selection */}
              <div className="form-group">
                <label htmlFor="settings-font-size">{t('settings.fontSize')}</label>
                <select
                  id="settings-font-size"
                  value={pref.fontSize || 'medium'}
                  onChange={(e) => handleUpdateSettings({ ...pref, fontSize: e.target.value as any })}
                >
                  <option value="small">{t('settings.fontSizes.small')}</option>
                  <option value="medium">{t('settings.fontSizes.medium')}</option>
                  <option value="large">{t('settings.fontSizes.large')}</option>
                  <option value="xl">{t('settings.fontSizes.xl')}</option>
                </select>
              </div>

              {/* Font Theme Selection */}
              <div className="form-group">
                <label htmlFor="settings-font-theme">{t('settings.fontTheme')}</label>
                <select
                  id="settings-font-theme"
                  value={pref.fontTheme === 'warm' ? 'warm' : 'editorial'}
                  onChange={(e) => handleUpdateSettings({ ...pref, fontTheme: e.target.value as any })}
                >
                  <option value="editorial">{t('settings.fontThemes.editorial')}</option>
                  <option value="warm">{t('settings.fontThemes.warm')}</option>
                </select>
              </div>

              {/* Reset plan option */}
              {activePlan && (
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
                  <button className="btn btn-danger" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleRestartPlan}>
                    <RotateCcw size={16} /> {t('progress.restartPlan')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Selector Modal overlay */}
      {showSelector && (
        <PlanSelector
          lang={pref.language}
          activePlanId={activePlan?.id || null}
          repositoryUrl={repositoryUrl}
          onSelectPlan={handleSelectPlan}
          onClose={() => setShowSelector(false)}
        />
      )}

    </div>
  );
};

export default App;
