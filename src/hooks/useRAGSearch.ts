import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ragService, type RAGResponse } from '@/lib/ragService';
import { useRateLimit } from './useRateLimit';
import { trackSearch, trackRateLimit, trackError } from '@/lib/analytics';

export function useRAGSearch(query: string, enabled: boolean = true) {
  return useQuery<RAGResponse>({
    queryKey: ['rag-search', query],
    queryFn: async () => {
      try {
        const result = await ragService.search(query);
        // Track successful search
        trackSearch(result.sources.length > 0, result.sources.length);
        return result;
      } catch (error) {
        // Track search errors
        trackError('search_failed', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    enabled: enabled && query.length > 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}

export function useRAGStats() {
  return useQuery({
    queryKey: ['rag-stats'],
    queryFn: () => ragService.getSystemStats(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for managing search state with rate limiting
export function useSearchState() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  const rateLimit = useRateLimit();
  const search = useRAGSearch(query, isSearching);

  const handleSearch = (newQuery: string) => {
    // Check rate limit before allowing search
    if (!rateLimit.consumeQuery()) {
      setRateLimitError(
        `Rate limit exceeded. You can make ${rateLimit.queriesRemaining} more queries. ` +
        `Try again in ${rateLimit.timeUntilReset} minutes.`
      );
      // Track rate limiting
      trackRateLimit();
      return;
    }

    // Clear any previous rate limit errors
    setRateLimitError(null);
    setQuery(newQuery);
    setIsSearching(true);
  };

  const clearSearch = () => {
    setQuery('');
    setIsSearching(false);
    setRateLimitError(null);
  };

  // Combine search errors with rate limit errors
  const combinedError = rateLimitError || search.error;

  return {
    query,
    setQuery,
    handleSearch,
    clearSearch,
    isSearching,
    searchResult: search.data,
    isLoading: search.isLoading,
    error: combinedError,
    rateLimit,
    rateLimitError
  };
}