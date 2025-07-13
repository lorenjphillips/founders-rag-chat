import { useState, useEffect } from 'react';

interface RateLimitState {
  queriesRemaining: number;
  timeUntilReset: number; // in minutes
  isLimited: boolean;
}

const QUERIES_PER_HOUR = 20;
const COOLDOWN_HOURS = 1;
const STORAGE_KEY = 'founders_rag_rate_limit';

export function useRateLimit() {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    queriesRemaining: QUERIES_PER_HOUR,
    timeUntilReset: 0,
    isLimited: false
  });

  useEffect(() => {
    // Check rate limit status on mount and set up periodic checks
    checkRateLimit();
    
    // Update every minute to show countdown
    const interval = setInterval(checkRateLimit, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    
    if (!stored) {
      // First time user
      const initialState = {
        queriesRemaining: QUERIES_PER_HOUR,
        timeUntilReset: 0,
        isLimited: false
      };
      setRateLimitState(initialState);
      return;
    }

    const { queries, lastReset } = JSON.parse(stored);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= COOLDOWN_HOURS) {
      // Reset the limit
      const resetState = {
        queriesRemaining: QUERIES_PER_HOUR,
        timeUntilReset: 0,
        isLimited: false
      };
      setRateLimitState(resetState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        queries: 0,
        lastReset: now
      }));
    } else {
      // Still within cooldown period
      const queriesUsed = queries || 0;
      const remaining = Math.max(0, QUERIES_PER_HOUR - queriesUsed);
      const minutesUntilReset = Math.ceil((COOLDOWN_HOURS * 60) - (hoursSinceReset * 60));
      
      setRateLimitState({
        queriesRemaining: remaining,
        timeUntilReset: minutesUntilReset,
        isLimited: remaining === 0
      });
    }
  };

  const consumeQuery = (): boolean => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    
    if (!stored) {
      // First query
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        queries: 1,
        lastReset: now
      }));
      setRateLimitState({
        queriesRemaining: QUERIES_PER_HOUR - 1,
        timeUntilReset: 0,
        isLimited: false
      });
      return true;
    }

    const { queries, lastReset } = JSON.parse(stored);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= COOLDOWN_HOURS) {
      // Reset period - allow query
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        queries: 1,
        lastReset: now
      }));
      setRateLimitState({
        queriesRemaining: QUERIES_PER_HOUR - 1,
        timeUntilReset: 0,
        isLimited: false
      });
      return true;
    }
    
    // Within rate limit period
    const queriesUsed = queries || 0;
    
    if (queriesUsed >= QUERIES_PER_HOUR) {
      // Rate limited
      const minutesUntilReset = Math.ceil((COOLDOWN_HOURS * 60) - (hoursSinceReset * 60));
      setRateLimitState({
        queriesRemaining: 0,
        timeUntilReset: minutesUntilReset,
        isLimited: true
      });
      return false;
    }
    
    // Allow query and update count
    const newQueriesUsed = queriesUsed + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      queries: newQueriesUsed,
      lastReset
    }));
    
    const remaining = QUERIES_PER_HOUR - newQueriesUsed;
    setRateLimitState({
      queriesRemaining: remaining,
      timeUntilReset: remaining === 0 ? Math.ceil((COOLDOWN_HOURS * 60) - (hoursSinceReset * 60)) : 0,
      isLimited: remaining === 0
    });
    
    return true;
  };

  return {
    ...rateLimitState,
    consumeQuery,
    checkRateLimit
  };
}