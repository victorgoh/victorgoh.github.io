import React, { useState, useEffect } from 'react';
import type { Plan, UserPlanMetadata, UserPreferences, Customization } from './types';
import { translate } from './utils/i18n';
import { PlanSelector } from './components/PlanSelector';
import TableOfContents from './components/TableOfContents';
import CollapsibleSection from './components/CollapsibleSection';
import { fetchHelloAoPassage } from './utils/helloAoBible';
import { buildBibleComUrl } from './utils/bibleUrl';
import {
  trackPlanSelected,
  trackItemViewed,
  trackItemCompleted,
  trackPlanCompleted,
  trackScriptureRead,
  trackBibleLinkClicked,
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
  Compass,
  X,
  Share2,
  Trash2,
  ListOrdered,
  BookOpen,
  Clock
} from 'lucide-react';
import { calculateReadingTime } from './utils/readingTime';

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
  const CACHE_VERSION = 'v1.6';
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

  const [customizationInfo, setCustomizationInfo] = useState<Customization | null>(null);

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
  
  const [showSelector, setShowSelector] = useState<boolean>(() => {
    const activeId = localStorage.getItem('active_plan_id');
    const params = new URLSearchParams(window.location.search);
    return !activeId && !params.get('plan');
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showTOC, setShowTOC] = useState<boolean>(false);

  // Section collapse states (remembers user expand/collapse preference)
  const [sectionsOpen, setSectionsOpen] = useState<{
    passages: boolean;
    devotional: boolean;
    prayers: boolean;
    reflect: boolean;
    practice: boolean;
  }>(() => {
    return loadLocalState('sections_open_state', {
      passages: true,
      devotional: true,
      prayers: false,
      reflect: false,
      practice: false
    });
  });

  const toggleSection = (section: 'passages' | 'devotional' | 'prayers' | 'reflect' | 'practice') => {
    setSectionsOpen((prev) => {
      const updated = { ...prev, [section]: !prev[section] };
      localStorage.setItem('sections_open_state', JSON.stringify(updated));
      return updated;
    });
  };

  const expandAllSections = () => {
    const allOpen = {
      passages: true,
      devotional: true,
      prayers: true,
      reflect: true,
      practice: true
    };
    setSectionsOpen(allOpen);
    localStorage.setItem('sections_open_state', JSON.stringify(allOpen));
  };

  const collapseAllSections = () => {
    const allClosed = {
      passages: false,
      devotional: false,
      prayers: false,
      reflect: false,
      practice: false
    };
    setSectionsOpen(allClosed);
    localStorage.setItem('sections_open_state', JSON.stringify(allClosed));
  };

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
        if (data && !Array.isArray(data) && data.customization) {
          setCustomizationInfo(data.customization as Customization);
        } else {
          setCustomizationInfo(null);
        }

        const activeId = localStorage.getItem('active_plan_id');
        if (!activeId) {
          setShowSelector(true);
        }
      })
      .catch((err) => {
        console.error('Error loading customization details:', err);
        setCustomizationInfo(null);
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
      document.title = 'EQUIP: Rooted and Formed';
      trackPageView(window.location.pathname + window.location.search, 'EQUIP: Rooted and Formed');
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

  const toggleItemCompletion = (itemNumber: number) => {
    if (!activePlan) return;
    const itemProgress = [...planMetadata.progress];
    const idx = itemProgress.indexOf(itemNumber);
    const isNowCompleted = idx === -1;

    if (isNowCompleted) {
      itemProgress.push(itemNumber);
    } else {
      itemProgress.splice(idx, 1);
    }

    trackItemCompleted(activePlan.id, itemNumber, activePlan.items.length, isNowCompleted);
    if (isNowCompleted && itemProgress.length === activePlan.items.length) {
      trackPlanCompleted(activePlan.id, activePlan.title, activePlan.items.length);
    }

    updateMetadata({
      ...planMetadata,
      progress: itemProgress
    });
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

  const handleResetApp = () => {
    if (window.confirm('Reset all app data? This will clear all downloaded plans, reading progress, and local settings, and return to the plan selection screen.')) {
      localStorage.clear();
      window.location.href = window.location.origin + window.location.pathname;
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
            <Compass size={headerExpanded ? 24 : 18} strokeWidth={2.2} />
          </span>
          
          {headerExpanded ? (
            <div style={{ display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
              <h1 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                {customizationInfo ? customizationInfo.name : t('appTitle')}
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {t('subtitle')}
              </p>
            </div>
          ) : (
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {customizationInfo ? customizationInfo.name : t('appTitle')}
            </span>
          )}
        </div>
        <div className="header-controls" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '6px' }}>
          {activePlan && (
            <button 
              className="icon-btn" 
              onClick={() => setShowTOC(true)} 
              title="Table of Contents" 
              aria-label="Table of Contents"
            >
              <ListOrdered size={18} />
            </button>
          )}
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
            <Compass size={48} strokeWidth={2.2} />
          </div>
          <h2>Welcome to {customizationInfo ? customizationInfo.name : t('appTitle')}</h2>
          <p style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Select a reading plan to:
          </p>

          <ul style={{ 
            listStyle: 'none', 
            padding: '14px 18px', 
            margin: '4px 0 14px 0', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            textAlign: 'left', 
            maxWidth: '390px', 
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            boxSizing: 'border-box'
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <span style={{ color: 'var(--primary)', display: 'inline-flex', flexShrink: 0 }}><Check size={16} strokeWidth={2.5} /></span>
              <span>Guide your personal quiet time & reflection</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <span style={{ color: 'var(--primary)', display: 'inline-flex', flexShrink: 0 }}><Check size={16} strokeWidth={2.5} /></span>
              <span>Facilitate small group discussions</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <span style={{ color: 'var(--primary)', display: 'inline-flex', flexShrink: 0 }}><Check size={16} strokeWidth={2.5} /></span>
              <span>Learn, pray, and grow together in community</span>
            </li>
          </ul>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={() => setShowSelector(true)}>
              Browse Available Plans
            </button>
            {customizationInfo?.website && (
              <a 
                href={customizationInfo.website} 
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
                        {/* Table of Contents Trigger Button */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className="session-selector-btn"
                            onClick={() => setShowTOC(true)}
                            title="Open Table of Contents"
                            style={{
                              background: 'var(--primary-light)',
                              border: '1px solid var(--border-glass)',
                              color: 'var(--primary)',
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '6px 12px',
                              borderRadius: '10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isPrayer ? <Flame size={16} /> : <FileText size={16} />} 
                            <span>{`${planMetadata.progress.includes(currentItem) ? '✓ ' : ''}${isPrayer ? 'Session' : 'Day'} ${currentItem} of ${totalItems}`}</span>
                            <ListOrdered size={15} style={{ opacity: 0.75 }} />
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

                      <h1 style={{ marginTop: '14px', fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.3 }}>
                        {activeItemConfig.title}
                      </h1>
                    </div>
                  </div>

                  {/* Section Controls Bar (TOC button + Reading Time + Collapse/Expand toggles) */}
                  <div 
                    className="section-controls-bar"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px',
                      marginBottom: '14px',
                      padding: '4px 2px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowTOC(true)}
                      className="btn btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontWeight: 600
                      }}
                      title="Open Table of Contents"
                    >
                      <ListOrdered size={15} />
                      <span>TOC</span>
                    </button>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {/* Reading Time Indicator */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(128, 128, 128, 0.08)'
                        }}
                        title={`Estimated reading time: ~${calculateReadingTime(activeItemConfig)} min`}
                      >
                        <Clock size={12} />
                        <span>~{calculateReadingTime(activeItemConfig)} min</span>
                      </span>

                      <button
                        type="button"
                        onClick={collapseAllSections}
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          padding: '5px 10px',
                          borderRadius: '8px'
                        }}
                        title="Collapse all sections to shorten height"
                      >
                        <ChevronUp size={13} />
                        <span>Collapse</span>
                      </button>
                      <button
                        type="button"
                        onClick={expandAllSections}
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          padding: '5px 10px',
                          borderRadius: '8px'
                        }}
                        title="Expand all sections"
                      >
                        <ChevronDown size={13} />
                        <span>Expand</span>
                      </button>
                    </div>
                  </div>

                  {/* Scripture Reading Section */}
                  {activeItemConfig.passages && activeItemConfig.passages.length > 0 && (
                    <CollapsibleSection
                      id="passages"
                      title={t('itemView.readPassages') || 'Scripture'}
                      icon={<Scroll size={18} />}
                      badge={`${activeItemConfig.passages.length} ${activeItemConfig.passages.length === 1 ? 'passage' : 'passages'}`}
                      isOpen={sectionsOpen.passages}
                      onToggle={() => toggleSection('passages')}
                    >
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
                                background: 'var(--bg-app)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '10px',
                                padding: '12px 14px',
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
                                        onClick={() => {
                                          if (activePlan) {
                                            trackBibleLinkClicked(
                                              activePlan.id,
                                              currentItem,
                                              p.reference,
                                              selectedTranslation,
                                              bibleUrl
                                            );
                                          }
                                        }}
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
                                    background: 'var(--bg-card)',
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
                    </CollapsibleSection>
                  )}

                  {/* Devotional Study Content */}
                  {activeItemConfig.devotional && (
                    <CollapsibleSection
                      id="devotional"
                      title={activeItemConfig.devotional.title || (isPrayer ? 'Focus & Meditation' : 'Devotional Study')}
                      icon={<BookOpen size={18} />}
                      badge={activeItemConfig.devotional.author ? `By ${activeItemConfig.devotional.author}` : undefined}
                      isOpen={sectionsOpen.devotional}
                      onToggle={() => toggleSection('devotional')}
                    >
                      <div className="devotional-content" style={{ lineHeight: 1.75 }}>
                        <ReactMarkdown>{activeItemConfig.devotional.content}</ReactMarkdown>
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Personal / Guided Prayers */}
                  {activeItemConfig.prayers && activeItemConfig.prayers.length > 0 && (
                    <CollapsibleSection
                      id="prayers"
                      title="Personal Prayer"
                      icon={<span style={{ fontSize: '1.1rem' }}>🙏</span>}
                      badge={`${activeItemConfig.prayers.length} ${activeItemConfig.prayers.length === 1 ? 'prayer' : 'prayers'}`}
                      isOpen={sectionsOpen.prayers}
                      onToggle={() => toggleSection('prayers')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeItemConfig.prayers.map((pr, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'var(--bg-app)',
                              border: '1px solid var(--border-glass)',
                              borderLeft: '4px solid var(--primary)',
                              borderRadius: '10px',
                              padding: '14px 18px',
                              fontSize: '0.95rem',
                              lineHeight: 1.7,
                              fontStyle: 'italic'
                            }}
                          >
                            {pr.topic && pr.topic !== 'Personal Prayer' && (
                              <div style={{ fontWeight: 700, fontStyle: 'normal', color: 'var(--primary)', marginBottom: '6px', fontSize: '0.9rem' }}>
                                {pr.topic}
                              </div>
                            )}
                            <div className="markdown-inline-content">
                              <ReactMarkdown>{pr.description}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Reflection & Group Discussion Questions */}
                  {activeItemConfig.reflect && activeItemConfig.reflect.length > 0 && (
                    <CollapsibleSection
                      id="reflect"
                      title={t('itemView.reflectionQuestions')}
                      icon={<span style={{ fontSize: '1.1rem' }}>💬</span>}
                      badge={`${activeItemConfig.reflect.length} ${activeItemConfig.reflect.length === 1 ? 'question' : 'questions'}`}
                      isOpen={sectionsOpen.reflect}
                      onToggle={() => toggleSection('reflect')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeItemConfig.reflect.map((q, idx) => (
                          <div 
                            key={idx}
                            style={{
                              background: 'var(--bg-app)',
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
                    </CollapsibleSection>
                  )}

                  {/* Practice / Action Steps */}
                  {activeItemConfig.practice && activeItemConfig.practice.length > 0 && (
                    <CollapsibleSection
                      id="practice"
                      title={t('itemView.actionSteps')}
                      icon={<span style={{ fontSize: '1.1rem' }}>🎯</span>}
                      badge={`${activeItemConfig.practice.length} ${activeItemConfig.practice.length === 1 ? 'step' : 'steps'}`}
                      isOpen={sectionsOpen.practice}
                      onToggle={() => toggleSection('practice')}
                      accentColor="var(--accent)"
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeItemConfig.practice.map((act, idx) => (
                          <div 
                            key={idx}
                            style={{
                              background: 'var(--bg-app)',
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
                    </CollapsibleSection>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', position: 'relative' }}>
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

                      {/* Bottom Table of Contents Button */}
                      <div>
                        <button
                          className="session-selector-btn"
                          onClick={() => setShowTOC(true)}
                          title="Open Table of Contents"
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
                          <ListOrdered size={15} />
                          <span>{`${currentItem} of ${totalItems}`}</span>
                        </button>
                      </div>

                      {/* Mark Done / Completed Button */}
                      <button 
                        className={`btn ${planMetadata.progress.includes(currentItem) ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600 }}
                        onClick={() => toggleItemCompletion(currentItem)}
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

                    {/* Reset App Data Option */}
                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', marginTop: '6px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.84rem', color: 'var(--danger, #ef4444)' }}>
                        Reset Application
                      </label>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Clears all cached plans, saved reading progress, and local settings, and returns to the plan selection screen.
                      </p>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleResetApp}
                        style={{
                          width: '100%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          fontSize: '0.84rem',
                          fontWeight: 600
                        }}
                      >
                        <Trash2 size={15} /> Reset App & Return to Select Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button as First Button in Bottom Controls */}
              <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontWeight: 600 }} 
                  onClick={() => setShowSettings(false)}
                >
                  <X size={16} /> {t('settings.close')}
                </button>
              </div>

              {/* Sync & Refresh Plan Button */}
              {activePlan && (
                <div>
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

      {/* Table of Contents Drawer / Modal */}
      {activePlan && (
        <TableOfContents
          isOpen={showTOC}
          onClose={() => setShowTOC(false)}
          plan={activePlan}
          currentItem={currentItem}
          completedItems={planMetadata.progress}
          onSelectItem={(itemNumber) => {
            setCurrentItem(itemNumber);
            setShowTOC(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onToggleComplete={(itemNumber) => {
            toggleItemCompletion(itemNumber);
          }}
        />
      )}
    </div>
  );
};

export default App;

