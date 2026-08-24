import React, { useState, useEffect, useRef } from 'react';
import type { Plan, UserPlanMetadata, UserPreferences, Organization } from './types';
import { translate } from './utils/i18n';
import { PlanSelector } from './components/PlanSelector';
import SessionSelectorList from './components/SessionSelectorList';
import { fetchHelloAoPassage } from './utils/helloAoBible';
import { buildBibleComUrl } from './utils/bibleUrl';
import {
  trackPlanSelected,
  trackItemViewed,
  trackItemCompleted,
  trackPlanCompleted,
  trackScriptureRead,
  trackContentShared,
  trackSettingsChanged,
  trackPageView
} from './utils/analytics';
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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Loader2,
  Scroll,
  RotateCcw,
  RefreshCw,
  Church,
  X,
  Share2
} from 'lucide-react';

// Custom WhatsApp SVG Icon
const WhatsAppIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 16, style }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

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

export const App: React.FC = () => {
  const CACHE_VERSION = 'v1.4';
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

  const [orgInfo, setOrgInfo] = useState<Organization | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const local = localStorage.getItem('app_theme');
    if (local === 'light' || local === 'dark') return local;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [pref, setPref] = useState<UserPreferences>(() => {
    return loadLocalState<UserPreferences>('user_preferences', {
      fontSize: 'medium',
      bibleTranslation: 'BSB'
    });
  });

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

  const [, setStartDate] = useState<Date | null>(() => {
    const activeId = localStorage.getItem('active_plan_id');
    if (activeId) {
      const meta = loadLocalState<UserPlanMetadata | null>(`plan_metadata_${activeId}`, null);
      if (meta && meta.startDate) return new Date(meta.startDate);
    }
    return null;
  });

  const [currentItem, setCurrentItem] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session') || params.get('item');
    if (sessionParam) {
      const parsed = parseInt(sessionParam);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1;
  });
  
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [headerExpanded, setHeaderExpanded] = useState<boolean>(false);
  
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showItemSelector, setShowItemSelector] = useState<boolean>(false);
  const [showBottomSelector, setShowBottomSelector] = useState<boolean>(false);
  const bottomSessionListRef = useRef<HTMLDivElement | null>(null);
  const sessionListRef = useRef<HTMLDivElement | null>(null);

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

  const [fetchedPassages, setFetchedPassages] = useState<Record<string, string>>({});
  const [loadingPassages, setLoadingPassages] = useState<Record<string, boolean>>({});
  const [openPassageIndices, setOpenPassageIndices] = useState<Record<number, boolean>>({});

  // Reset passage accordion state whenever switching lessons/items
  useEffect(() => {
    setOpenPassageIndices({});
  }, [currentItem, activePlan?.id]);

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

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const sessionParam = params.get('session') || params.get('item');

    if (planParam) {
      const decodedPlanUrl = decodeURIComponent(planParam);
      const isDirectJson = decodedPlanUrl.endsWith('.json');
      const targetUrl = isDirectJson ? decodedPlanUrl : `${decodedPlanUrl}/plan.json`;
      const fullUrl = targetUrl.startsWith('http') || targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
      const cacheBustUrl = fullUrl.includes('?') ? `${fullUrl}&_t=${Date.now()}` : `${fullUrl}?_t=${Date.now()}`;

      fetch(cacheBustUrl, { cache: 'no-cache' })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load plan from URL parameter');
          return res.json();
        })
        .then((rawPlan) => {
          const planData = migratePlanSchema(rawPlan);
          localStorage.setItem(`cached_plan_${planData.id}`, JSON.stringify(planData));
          localStorage.setItem('active_plan_id', planData.id);
          localStorage.setItem(`active_plan_url_${planData.id}`, decodedPlanUrl);

          const savedMeta = loadLocalState<UserPlanMetadata>(`plan_metadata_${planData.id}`, {
            startDate: new Date().toISOString(),
            progress: [],
            completedItems: {}
          });

          setActivePlan(planData);
          setPlanMetadata(savedMeta);
          if (savedMeta.startDate) setStartDate(new Date(savedMeta.startDate));

          if (sessionParam) {
            const parsedSession = parseInt(sessionParam);
            if (!isNaN(parsedSession) && parsedSession > 0) {
              setCurrentItem(parsedSession);
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching plan from URL query param:', err);
        });
    }
  }, []);

  const revalidateActivePlan = async (isManual = false) => {
    if (!activePlan?.id) return;
    const planId = activePlan.id;
    if (isManual) setIsSyncing(true);

    try {
      const storedUrl = localStorage.getItem(`active_plan_url_${planId}`);
      const targetUrl = storedUrl 
        ? (storedUrl.startsWith('http') || storedUrl.startsWith('/') ? storedUrl : `/${storedUrl}`)
        : `/plans/${planId}.json`;
      
      const cacheBustUrl = targetUrl.includes('?') 
        ? `${targetUrl}&_t=${Date.now()}` 
        : `${targetUrl}?_t=${Date.now()}`;

      const res = await fetch(cacheBustUrl, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to fetch plan from network');
      
      const freshPlanRaw = await res.json();
      const freshPlan = migratePlanSchema(freshPlanRaw);

      const freshStr = JSON.stringify(freshPlan);
      const cachedStr = localStorage.getItem(`cached_plan_${planId}`);
      
      if (freshStr !== cachedStr) {
        localStorage.setItem(`cached_plan_${planId}`, freshStr);
        setActivePlan(freshPlan);
        if (isManual) {
          setSyncFeedback(translate('en', 'settings.syncSuccess'));
          setTimeout(() => setSyncFeedback(null), 3000);
        }
      } else if (isManual) {
        setSyncFeedback(translate('en', 'settings.syncUpToDate'));
        setTimeout(() => setSyncFeedback(null), 3000);
      }
    } catch (err) {
      console.debug('[PlanSync] Background revalidation skipped or offline:', err);
      if (isManual) {
        setSyncFeedback(translate('en', 'plans.cacheError'));
        setTimeout(() => setSyncFeedback(null), 3000);
      }
    } finally {
      if (isManual) setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (activePlan?.id) {
      revalidateActivePlan(false);
    }
  }, [activePlan?.id]);

  useEffect(() => {
    const cacheBustedRepoUrl = repositoryUrl.includes('?') 
      ? `${repositoryUrl}&_t=${Date.now()}` 
      : `${repositoryUrl}?_t=${Date.now()}`;

    fetch(cacheBustedRepoUrl, { cache: 'no-cache' })
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
          if (!matchedItem && !activeId) {
            const fallbackItem = plansList.find((p: any) => p.type !== 'category') || plansList[0];
            if (fallbackItem && fallbackItem.url) {
              const fbUrl = fallbackItem.url.startsWith('http') || fallbackItem.url.startsWith('/') ? fallbackItem.url : `/${fallbackItem.url}`;
              const cacheBustFb = fbUrl.includes('?') ? `${fbUrl}&_t=${Date.now()}` : `${fbUrl}?_t=${Date.now()}`;
              fetch(cacheBustFb, { cache: 'no-cache' })
                .then((res) => res.json())
                .then((rawPlan) => {
                  const planData = migratePlanSchema(rawPlan);
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove('size-small', 'size-medium', 'size-large', 'size-xl');
    document.documentElement.classList.add(`size-${pref.fontSize || 'medium'}`);
  }, [pref.fontSize]);

  useEffect(() => {
    if (activePlan) {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get('session') || params.get('item');
      
      if (sessionParam) {
        const parsed = parseInt(sessionParam);
        if (!isNaN(parsed) && parsed > 0 && parsed <= activePlan.items.length) {
          setCurrentItem(parsed);
          return;
        }
      }

      if (planMetadata.progress && planMetadata.progress.length > 0) {
        const maxCompleted = Math.max(...planMetadata.progress);
        const nextItem = maxCompleted < activePlan.items.length ? maxCompleted + 1 : activePlan.items.length;
        setCurrentItem(nextItem);
      } else {
        setCurrentItem(1);
      }
    }
  }, [activePlan?.id]);

  const activeItemConfig = activePlan?.items.find((d) => d.item === currentItem);

  useEffect(() => {
    if (activePlan && activeItemConfig) {
      const passages = activeItemConfig.passages?.map(p => p.reference).join(', ');
      const pageTitle = `${currentItem}. ${activeItemConfig.title} | ${activePlan.title}`;
      document.title = pageTitle;

      const rawContent = activeItemConfig.devotional?.content || '';
      const cleanSnippet = rawContent
        .replace(/#{1,6}\s+[^\n]+/g, '')
        .replace(/[*_~`>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);

      const desc = passages 
        ? `Scripture: ${passages}. ${cleanSnippet}` 
        : (cleanSnippet || activePlan.title);

      const setMeta = (name: string, content: string, isProperty = false) => {
        let tag = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          if (isProperty) tag.setAttribute('property', name);
          else tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      setMeta('description', desc);
      setMeta('og:title', pageTitle, true);
      setMeta('og:description', desc, true);
      setMeta('twitter:title', pageTitle);
      setMeta('twitter:description', desc);

      // Track virtual page view and item view in Google Analytics
      const pagePath = window.location.pathname + window.location.search;
      trackPageView(pagePath, pageTitle);
      trackItemViewed(activePlan.id, currentItem, activeItemConfig.title, activePlan.title);
    } else if (activePlan) {
      document.title = activePlan.title;
      trackPageView(window.location.pathname + window.location.search, activePlan.title);
    } else {
      document.title = 'Bible Reading & Prayer Guide';
      trackPageView(window.location.pathname + window.location.search, 'Bible Reading & Prayer Guide');
    }
  }, [activePlan, activeItemConfig, currentItem]);

  const handleSelectPlan = (plan: Plan, selectedStartDate: Date, planUrl: string) => {
    setActivePlan(plan);
    setStartDate(selectedStartDate);
    setShowSelector(false);
    localStorage.setItem('active_plan_id', plan.id);
    localStorage.setItem(`active_plan_url_${plan.id}`, planUrl);

    // Track plan selection in GA4
    trackPlanSelected(plan.id, plan.title, plan.type);

    const savedMeta = loadLocalState<UserPlanMetadata>(`plan_metadata_${plan.id}`, {
      startDate: selectedStartDate.toISOString(),
      progress: [],
      completedItems: {}
    });

    setPlanMetadata(savedMeta);

    if (savedMeta.progress && savedMeta.progress.length > 0) {
      const maxCompleted = Math.max(...savedMeta.progress);
      const nextItem = maxCompleted < plan.items.length ? maxCompleted + 1 : plan.items.length;
      setCurrentItem(nextItem);
    } else {
      setCurrentItem(1);
    }
  };

  const updateMetadata = (newMeta: UserPlanMetadata) => {
    if (!activePlan) return;
    setPlanMetadata(newMeta);
    localStorage.setItem(`plan_metadata_${activePlan.id}`, JSON.stringify(newMeta));
  };

  const togglePassageInline = async (pReference: string, idx: number, hasLocalText: boolean) => {
    const nextState = !openPassageIndices[idx];
    setOpenPassageIndices(prev => ({ ...prev, [idx]: nextState }));

    if (nextState && activePlan) {
      trackScriptureRead(activePlan.id, currentItem, pReference);
    }

    const passageKey = `${pReference}_BSB`;
    if (nextState && !hasLocalText && !fetchedPassages[passageKey] && !loadingPassages[passageKey]) {
      setLoadingPassages(prev => ({ ...prev, [passageKey]: true }));
      try {
        const text = await fetchHelloAoPassage(pReference, 'BSB');
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
    if (window.confirm('Are you sure you want to reset all progress for this plan?')) {
      const resetMeta: UserPlanMetadata = {
        startDate: new Date().toISOString(),
        progress: [],
        completedItems: {}
      };
      setStartDate(new Date());
      updateMetadata(resetMeta);
      setCurrentItem(1);
      setShowSettings(false);
    }
  };

  const handleUpdateSettings = (updatedPref: UserPreferences) => {
    if (updatedPref.fontSize !== pref.fontSize) {
      trackSettingsChanged('fontSize', updatedPref.fontSize);
    }
    if (updatedPref.bibleTranslation !== pref.bibleTranslation) {
      trackSettingsChanged('bibleTranslation', updatedPref.bibleTranslation || 'BSB');
    }
    setPref(updatedPref);
    localStorage.setItem('user_preferences', JSON.stringify(updatedPref));
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    trackSettingsChanged('theme', nextTheme);
    setTheme(nextTheme);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return translate('en', key, params);
  };

  const isPrayer = activePlan?.type === 'prayer_guide';
  const totalItems = activePlan?.items.length || 1;

  const getLessonShareDetails = () => {
    if (!activePlan || !activeItemConfig) return null;
    const planUrl = localStorage.getItem(`active_plan_url_${activePlan.id}`) || `plans/${activePlan.id}.json`;
    const fullUrl = planUrl.startsWith('http') ? planUrl : new URL(planUrl, window.location.origin).href;
    const shareUrl = `${window.location.origin}${window.location.pathname}?plan=${encodeURIComponent(fullUrl)}&session=${currentItem}`;
    
    const passages = activeItemConfig.passages?.map(p => p.reference).join(', ') || '';
    const rawContent = activeItemConfig.devotional?.content || '';
    
    const cleanSnippet = rawContent
      .replace(/#{1,6}\s+[^\n]+/g, '')
      .replace(/[*_~`>]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220);

    // WhatsApp formatted (uses asterisk markdown for WhatsApp bold styling)
    const whatsappMessage = [
      `📖 *${activePlan.title}*`,
      `*${currentItem}. ${activeItemConfig.title}*`,
      passages ? `📜 *Passage:* ${passages}` : '',
      cleanSnippet ? `\n"${cleanSnippet}..."` : '',
      `\n👉 *Open & Read:*`,
      shareUrl
    ].filter(Boolean).join('\n');

    // Standard plain-text formatted (clean without markdown asterisks for generic share/copy)
    const standardMessage = [
      `📖 ${activePlan.title}`,
      `${currentItem}. ${activeItemConfig.title}`,
      passages ? `📜 Passage: ${passages}` : '',
      cleanSnippet ? `\n"${cleanSnippet}..."` : '',
      `\n👉 Open & Read:`,
      shareUrl
    ].filter(Boolean).join('\n');

    return { shareUrl, passages, cleanSnippet, whatsappMessage, standardMessage };
  };

  const handleShareWhatsApp = () => {
    const details = getLessonShareDetails();
    if (!details || !activePlan) return;

    trackContentShared('whatsapp', activePlan.id, currentItem, activePlan.title);

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(details.whatsappMessage)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareSession = async () => {
    const details = getLessonShareDetails();
    if (!details || !activePlan || !activeItemConfig) return;
    
    // Check if Native Web Share is supported (e.g. mobile Safari / Chrome)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentItem}. ${activeItemConfig.title} | ${activePlan.title}`,
          text: details.standardMessage
        });
        trackContentShared('native_share', activePlan.id, currentItem, activePlan.title);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // User cancelled share sheet
        console.debug('Native share fallback to clipboard:', err);
      }
    }

    // Default to clipboard copy with clean standard format
    try {
      await navigator.clipboard.writeText(details.standardMessage);
      trackContentShared('copy_link', activePlan.id, currentItem, activePlan.title);
      setShareStatus('copied');
      setTimeout(() => setShareStatus(null), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert(`Lesson Content:\n\n${details.standardMessage}`);
    }
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
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Church size={headerExpanded ? 24 : 18} />
          </span>
          
          {headerExpanded ? (
            <div style={{ display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
              <h1 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                {orgInfo ? orgInfo.name : t('appTitle')}
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {t('subtitle')}
              </p>
            </div>
          ) : (
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {orgInfo ? orgInfo.name : t('appTitle')}
            </span>
          )}
        </div>
        <div className="header-controls" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '6px' }}>
          <button 
            className="icon-btn" 
            onClick={toggleTheme} 
            title="Toggle Dark Mode" 
            aria-label="Toggle Dark Mode"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setShowSelector(true)} 
            title={t('plans.choosePlan')} 
            aria-label="Select Plan"
          >
            <ClipboardList size={18} />
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setShowSettings(true)} 
            title={t('settings.title')} 
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Active Plan Header Card */}
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
              fontSize: '0.68rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              color: 'var(--primary)',
              fontWeight: 700
            }}>
              {activePlan.type === 'reading' || activePlan.type === 'reading_plan' ? t('tabs.readReflect') : t('tabs.prayer')}
            </span>
            <h2 style={{ 
              fontSize: headerExpanded ? '1.25rem' : '1.05rem', 
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
          <div className="empty-view-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={48} />
          </div>
          <h2>Welcome to {orgInfo ? orgInfo.name : t('appTitle')}</h2>
          <p>{orgInfo ? `Browse plans provided by ${orgInfo.name} to begin your daily devotion.` : 'Please select a reading plan to begin your personal reflection or small group study.'}</p>
          
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
                    <div className="item-view-title" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
                        {/* Selector Popover Button */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className="session-selector-btn"
                            onClick={() => setShowItemSelector(!showItemSelector)}
                            title="Jump to item"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '6px 10px',
                              margin: '-6px -10px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isPrayer ? <Flame size={16} /> : <FileText size={16} />} 
                            <span>{`${currentItem} of ${totalItems}`}</span>
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Top Quick Actions (WhatsApp icon & Copy Link icon) */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className="btn btn-whatsapp"
                            onClick={handleShareWhatsApp}
                            title="Share to WhatsApp"
                            aria-label="Share to WhatsApp"
                            style={{
                              width: '32px',
                              height: '32px',
                              padding: 0,
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <WhatsAppIcon size={17} />
                          </button>

                          <button
                            className="icon-btn"
                            onClick={handleShareSession}
                            title="Copy Summary & Link"
                            aria-label="Copy Summary & Link"
                            style={{
                              width: '32px',
                              height: '32px',
                              padding: 0,
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: shareStatus === 'copied' ? 'var(--success)' : 'inherit'
                            }}
                          >
                            {shareStatus === 'copied' ? <Check size={16} /> : <Link size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Contents Picker Popover */}
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
                            zIndex: 100,
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            <span>Contents</span>
                            <span>{currentItem} / {totalItems}</span>
                          </div>

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
                            <SessionSelectorList
                              items={activePlan.items}
                              currentItem={currentItem}
                              completedItems={planMetadata.progress}
                              planType={activePlan.type}
                              onSelect={(itemNumber) => {
                                setCurrentItem(itemNumber);
                                setShowItemSelector(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <h1 style={{ marginTop: '12px', fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.3 }}>
                        {activeItemConfig.title}
                      </h1>
                    </div>
                  </div>

                  {/* Scripture Reading Section */}
                  {activeItemConfig.passages && activeItemConfig.passages.length > 0 && (
                    <div className="passages-section" style={{ marginTop: '16px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                        {t('itemView.readPassages')}
                      </div>
                      <div className="passage-cards-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeItemConfig.passages.map((p, idx) => {
                          const isInlineOpen = !!openPassageIndices[idx];
                          const passageKey = `${p.reference}_BSB`;
                          const inlineText = p.text || fetchedPassages[passageKey];
                          const isLoading = loadingPassages[passageKey];

                          return (
                            <div 
                              key={idx} 
                              className="passage-card"
                              style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Scroll size={16} style={{ color: 'var(--primary)' }} />
                                  <span style={{ fontWeight: 600, fontSize: '0.98rem' }}>{p.reference}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => togglePassageInline(p.reference, idx, !!p.text)}
                                    style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '6px' }}
                                  >
                                    {isInlineOpen ? 'Hide Text' : t('itemView.readInline')}
                                  </button>
                                  {(() => {
                                    const selectedTranslation = pref.bibleTranslation || 'BSB';
                                    const bibleUrl = buildBibleComUrl(p.reference, selectedTranslation, p.url);
                                    if (!bibleUrl) return null;
                                    return (
                                      <a 
                                        href={bibleUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.78rem', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center' }}
                                        title={`Open ${p.reference} on Bible.com (${selectedTranslation})`}
                                        aria-label={`Open ${p.reference} on Bible.com in ${selectedTranslation}`}
                                      >
                                        <ExternalLink size={13} />
                                      </a>
                                    );
                                  })()}
                                </div>
                              </div>

                              {isInlineOpen && (
                                <div 
                                  className="bible-text-panel"
                                  style={{
                                    marginTop: '8px',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    background: 'var(--bg-app)',
                                    border: '1px solid var(--border-glass)',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.7
                                  }}
                                >
                                  {isLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                      <Loader2 size={16} className="animate-spin" /> Loading Scripture (BSB)...
                                    </div>
                                  ) : (
                                    <ReactMarkdown>{inlineText}</ReactMarkdown>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Devotional Study Content */}
                  {activeItemConfig.devotional && (
                    <div className="devotional-content" style={{ marginTop: '20px', lineHeight: 1.75 }}>
                      {activeItemConfig.devotional.author && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>
                          {t('itemView.devotionalBy', { author: activeItemConfig.devotional.author })}
                        </div>
                      )}
                      <ReactMarkdown>{activeItemConfig.devotional.content}</ReactMarkdown>
                    </div>
                  )}

                  {/* Reflection & Group Discussion Questions */}
                  {activeItemConfig.reflect && activeItemConfig.reflect.length > 0 && (
                    <div className="section-block reflection-section" style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💬 {t('itemView.reflectionQuestions')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeItemConfig.reflect.map((q, idx) => (
                          <div 
                            key={idx}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '10px',
                              padding: '12px 16px',
                              fontSize: '0.95rem',
                              lineHeight: 1.6,
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'baseline'
                            }}
                          >
                            <span style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{idx + 1}.</span>
                            <div className="markdown-inline-content">
                              <ReactMarkdown>{q}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practice / Action Steps */}
                  {activeItemConfig.practice && activeItemConfig.practice.length > 0 && (
                    <div className="section-block practice-section" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🎯 {t('itemView.actionSteps')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeItemConfig.practice.map((act, idx) => (
                          <div 
                            key={idx}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '10px',
                              padding: '12px 16px',
                              fontSize: '0.95rem',
                              lineHeight: 1.6,
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'baseline'
                            }}
                          >
                            <span style={{ fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>•</span>
                            <div className="markdown-inline-content">
                              <ReactMarkdown>{act}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Navigation & Share Bar */}
                  <div 
                    className="item-nav-container"
                    style={{ 
                      marginTop: '36px', 
                      paddingTop: '20px', 
                      borderTop: '1px solid var(--border-glass)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    {/* Quick Share Bar */}
                    <div 
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Share:</strong> Send to your group or friends
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-whatsapp"
                          onClick={handleShareWhatsApp}
                          title="Share to WhatsApp"
                          aria-label="Share to WhatsApp"
                          style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <WhatsAppIcon size={16} /> WhatsApp
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={handleShareSession}
                          title="Share or copy link"
                          aria-label="Share"
                          style={{ 
                            fontSize: '0.82rem', 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            color: shareStatus === 'copied' ? 'var(--success)' : 'inherit'
                          }}
                        >
                          {shareStatus === 'copied' ? <Check size={15} /> : <Share2 size={15} />}
                          <span>{shareStatus === 'copied' ? 'Copied!' : 'Share'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Previous / Next / Complete Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        disabled={currentItem <= 1}
                        onClick={() => {
                          if (currentItem > 1) {
                            setCurrentItem(currentItem - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        title={t('itemView.prev')}
                        aria-label="Previous"
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

                      {/* Bottom Selector Popover Button */}
                      <div style={{ position: 'relative' }}>
                        <button
                          className="session-selector-btn"
                          onClick={() => setShowBottomSelector(!showBottomSelector)}
                          title="Jump to item"
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-main)',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>{`${currentItem} of ${totalItems}`}</span>
                          <ChevronDown size={14} />
                        </button>

                        {showBottomSelector && (
                          <div 
                            className="item-selector-popover bottom"
                            style={{
                              position: 'absolute',
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '280px',
                              background: 'var(--bg-card)',
                              backdropFilter: 'blur(var(--blur-glass))',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '16px',
                              padding: '16px',
                              marginBottom: '12px',
                              boxShadow: 'var(--shadow-lg)',
                              animation: 'fadeIn 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              zIndex: 100,
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              <span>Contents</span>
                              <span>{currentItem} / {totalItems}</span>
                            </div>

                            <SessionSelectorList
                              ref={bottomSessionListRef}
                              items={activePlan.items}
                              currentItem={currentItem}
                              completedItems={planMetadata.progress}
                              planType={activePlan.type}
                              onSelect={(itemNumber) => {
                                setCurrentItem(itemNumber);
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
                        style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600 }}
                        onClick={() => {
                          const itemProgress = [...planMetadata.progress];
                          const idx = itemProgress.indexOf(currentItem);
                          const isNowCompleted = idx === -1;
                          
                          if (isNowCompleted) {
                            itemProgress.push(currentItem);
                          } else {
                            itemProgress.splice(idx, 1);
                          }

                          if (activePlan) {
                            trackItemCompleted(activePlan.id, currentItem, totalItems, isNowCompleted);
                            if (isNowCompleted && itemProgress.length === activePlan.items.length) {
                              trackPlanCompleted(activePlan.id, activePlan.title, totalItems);
                            }
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
                        title={t('itemView.next')}
                        aria-label="Next"
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
                <div className="empty-view">Item not found.</div>
              )}
            </main>
        </div>
      )}

      {/* Settings Modal (Simplified) */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} /> {t('settings.title')}
              </h2>
              <button 
                className="close-btn" 
                onClick={() => setShowSettings(false)} 
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close Settings"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Font Size Selection */}
              <div className="form-group">
                <label htmlFor="settings-font-size" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  {t('settings.fontSize')}
                </label>
                <select
                  id="settings-font-size"
                  value={pref.fontSize || 'medium'}
                  onChange={(e) => handleUpdateSettings({ ...pref, fontSize: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="small">{t('settings.fontSizes.small')}</option>
                  <option value="medium">{t('settings.fontSizes.medium')}</option>
                  <option value="large">{t('settings.fontSizes.large')}</option>
                  <option value="xl">{t('settings.fontSizes.xl')}</option>
                </select>
              </div>

              {/* Advanced Settings Section */}
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 2px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <SlidersHorizontal size={16} style={{ color: 'var(--primary)' }} />
                    Advanced Settings
                  </span>
                  {showAdvancedSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAdvancedSettings && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                    <div className="form-group">
                      <label htmlFor="settings-bible-translation" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.84rem' }}>
                        Bible Link Translation
                      </label>
                      <select
                        id="settings-bible-translation"
                        value={pref.bibleTranslation || 'BSB'}
                        onChange={(e) => handleUpdateSettings({ ...pref, bibleTranslation: e.target.value as any })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-glass)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem'
                        }}
                      >
                        <option value="BSB">BSB — Berean Standard Bible (Default)</option>
                        <option value="ESV">ESV — English Standard Version</option>
                        <option value="CSB">CSB — Christian Standard Bible</option>
                        <option value="NIV">NIV — New International Version</option>
                        <option value="NLT">NLT — New Living Translation</option>
                        <option value="NKJV">NKJV — New King James Version</option>
                        <option value="NASB2020">NASB2020 — New American Standard Bible 2020</option>
                        <option value="MSG">MSG — The Message</option>
                        <option value="NRSVUE">NRSVUE — New Revised Standard Version Updated Edition</option>
                        <option value="AMP">AMP — Amplified Bible</option>
                      </select>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        This only changes what translation is opened when clicking external links to Bible.com. The default BSB verses displayed in the app are not changed.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sync & Refresh Plan Button */}
              {activePlan && (
                <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }} 
                    onClick={() => revalidateActivePlan(true)}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {isSyncing ? t('settings.syncing') : t('settings.syncPlan')}
                  </button>
                  {syncFeedback && (
                    <div style={{ fontSize: '0.82rem', textAlign: 'center', marginTop: '8px', color: 'var(--primary)', fontWeight: 500 }}>
                      {syncFeedback}
                    </div>
                  )}
                </div>
              )}

              {/* Reset plan option */}
              {activePlan && (
                <div>
                  <button 
                    className="btn btn-danger" 
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }} 
                    onClick={handleRestartPlan}
                  >
                    <RotateCcw size={16} /> {t('progress.restartPlan')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Selector Modal */}
      {showSelector && (
        <PlanSelector
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
