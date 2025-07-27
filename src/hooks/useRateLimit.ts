import { useState, useEffect } from 'react';
import { googleAuthService } from '@/lib/googleAuth';

interface RateLimitState {
  queriesRemaining: number;
  timeUntilReset: number; // in minutes
  isLimited: boolean;
  userTier: 'anonymous' | 'authenticated';
}

const ANONYMOUS_QUERIES_PER_HOUR = 3;
const AUTHENTICATED_QUERIES_PER_HOUR = 10;
const COOLDOWN_HOURS = 1;
const STORAGE_KEY_ANONYMOUS = 'founders_rag_rate_limit';
const STORAGE_KEY_AUTH = 'founders_rag_rate_limit_auth';

export function useRateLimit() {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    queriesRemaining: ANONYMOUS_QUERIES_PER_HOUR,
    timeUntilReset: 0,
    isLimited: false,
    userTier: 'anonymous'
  });

  useEffect(() => {
    // Check rate limit status on mount and set up periodic checks
    checkRateLimit();
    
    // Update every minute to show countdown
    const interval = setInterval(checkRateLimit, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = () => {
    const isAuthenticated = googleAuthService.isSignedIn();
    const userTier = isAuthenticated ? 'authenticated' : 'anonymous';
    const storageKey = isAuthenticated ? STORAGE_KEY_AUTH : STORAGE_KEY_ANONYMOUS;
    const queriesPerHour = isAuthenticated ? AUTHENTICATED_QUERIES_PER_HOUR : ANONYMOUS_QUERIES_PER_HOUR;
    
    const stored = localStorage.getItem(storageKey);
    const now = Date.now();
    
    if (!stored) {
      // First time user
      const initialState = {
        queriesRemaining: queriesPerHour,
        timeUntilReset: 0,
        isLimited: false,
        userTier
      };
      setRateLimitState(initialState);
      return;
    }

    const { queries, lastReset } = JSON.parse(stored);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= COOLDOWN_HOURS) {
      // Reset the limit
      const resetState = {
        queriesRemaining: queriesPerHour,
        timeUntilReset: 0,
        isLimited: false,
        userTier
      };
      setRateLimitState(resetState);
      localStorage.setItem(storageKey, JSON.stringify({
        queries: 0,
        lastReset: now
      }));
    } else {
      // Still within cooldown period
      const queriesUsed = queries || 0;
      const remaining = Math.max(0, queriesPerHour - queriesUsed);
      const minutesUntilReset = Math.ceil((COOLDOWN_HOURS * 60) - (hoursSinceReset * 60));
      
      setRateLimitState({
        queriesRemaining: remaining,
        timeUntilReset: minutesUntilReset,
        isLimited: remaining === 0,
        userTier
      });
    }
  };

  const consumeQuery = (): boolean => {
    const isAuthenticated = googleAuthService.isSignedIn();
    const userTier = isAuthenticated ? 'authenticated' : 'anonymous';
    const storageKey = isAuthenticated ? STORAGE_KEY_AUTH : STORAGE_KEY_ANONYMOUS;
    const queriesPerHour = isAuthenticated ? AUTHENTICATED_QUERIES_PER_HOUR : ANONYMOUS_QUERIES_PER_HOUR;
    
    const stored = localStorage.getItem(storageKey);
    const now = Date.now();
    
    if (!stored) {
      // First query
      localStorage.setItem(storageKey, JSON.stringify({
        queries: 1,
        lastReset: now
      }));
      setRateLimitState({
        queriesRemaining: queriesPerHour - 1,
        timeUntilReset: 0,
        isLimited: false,
        userTier
      });
      return true;
    }

    const { queries, lastReset } = JSON.parse(stored);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= COOLDOWN_HOURS) {
      // Reset period - allow query
      localStorage.setItem(storageKey, JSON.stringify({
        queries: 1,
        lastReset: now
      }));
      setRateLimitState({
        queriesRemaining: queriesPerHour - 1,
        timeUntilReset: 0,
        isLimited: false,
        userTier
      });
      return true;
    }
    
    // Within rate limit period
    const queriesUsed = queries || 0;
    
    if (queriesUsed >= queriesPerHour) {
      // Rate limited
      const minutesUntilReset = Math.ceil((COOLDOWN_HOURS * 60) - (hoursSinceReset * 60));
      setRateLimitState({
        queriesRemaining: 0,
        timeUntilReset: minutesUntilReset,
        isLimited: true,
        userTier
      });
      return false;
    }
    
    // Allow query and update count
    const newQueriesUsed = queriesUsed + 1;
    localStorage.setItem(storageKey, JSON.stringify({
      queries: newQueriesUsed,
      lastReset
    }));
    
    const remaining = queriesPerHour - newQueriesUsed;
    setRateLimitState({
      queriesRemaining: remaining,
      timeUntilReset: remaining === 0 ? Math.ceil((COOLDOWN_HOURS * 60) - (hoursSinceReset * 60)) : 0,
      isLimited: remaining === 0,
      userTier
    });
    
    return true;
  };

  return {
    ...rateLimitState,
    consumeQuery,
    checkRateLimit
  };
}