// Google Analytics setup
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics measurement ID not found');
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: 'Founders RAG Chat',
    page_location: window.location.href,
    // Privacy-friendly settings
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
}

// Track events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// Track search queries (without the actual query for privacy)
export function trackSearch(hasResults: boolean, numResults?: number) {
  trackEvent('search', 'user_interaction', hasResults ? 'success' : 'no_results', numResults);
}

// Track rate limiting
export function trackRateLimit() {
  trackEvent('rate_limit_hit', 'user_interaction', 'query_blocked');
}

// Track errors
export function trackError(errorType: string, errorMessage?: string) {
  trackEvent('error', 'technical', errorType);
}