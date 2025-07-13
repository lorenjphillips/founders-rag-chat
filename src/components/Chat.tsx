import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, MessageSquare } from 'lucide-react';
import { SearchSource } from './SearchSource';
import { useSearchState, useRAGStats } from '@/hooks/useRAGSearch';
import type { SearchResult } from '@/lib/qdrant';

export function Chat() {
  const {
    handleSearch,
    clearSearch,
    searchResult,
    isLoading,
    error,
    rateLimit
  } = useSearchState();

  const stats = useRAGStats();
  
  const [inputValue, setInputValue] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSearch(inputValue.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Founders Podcast Search</h1>
        <p className="text-muted-foreground">
          Search through podcast transcripts using AI-powered semantic search
        </p>
        <div className="flex gap-2 justify-center">
          {stats.data && (
            <Badge variant="outline" className="text-xs">
              {stats.data.totalVectors?.toLocaleString()} chunks indexed
            </Badge>
          )}
          <Badge variant={rateLimit.isLimited ? "destructive" : "secondary"} className="text-xs">
            {rateLimit.queriesRemaining}/3 queries remaining
            {rateLimit.timeUntilReset > 0 && ` (reset in ${rateLimit.timeUntilReset}m)`}
          </Badge>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Transcripts
          </CardTitle>
          <CardDescription>
            Ask questions about entrepreneurship, business strategies, or specific founders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              placeholder="e.g., What did Jeff Bezos say about customer obsession?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim() || rateLimit.isLimited}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              ❌ Error: {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResult && (
        <div className="space-y-4">
          {/* AI Response */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed whitespace-pre-wrap">
                {searchResult.answer}
              </p>
            </CardContent>
          </Card>

          {/* Sources */}
          {searchResult.sources.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Sources ({searchResult.sources.length})
              </h3>
              <div className="space-y-3">
                {searchResult.sources.map((source: SearchResult, index: number) => (
                  <SearchSource 
                    key={source.id} 
                    source={source} 
                    index={index} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Clear Results */}
          <div className="text-center">
            <Button variant="outline" onClick={() => {
              clearSearch();
              setInputValue('');
            }}>
              Clear Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}