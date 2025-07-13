import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/lib/qdrant';

interface SearchSourceProps {
  source: SearchResult;
  index: number;
}

export function SearchSource({ source, index }: SearchSourceProps) {
  const { payload, score } = source;
  
  // Truncate text for display
  const truncatedText = payload.chunk_text.length > 200 
    ? payload.chunk_text.substring(0, 200) + '...'
    : payload.chunk_text;

  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Source {index + 1}: {payload.main_subject}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              Episode #{payload.episode_number}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(score * 100)}% match
            </Badge>
          </div>
        </div>
        {payload.subject_details && (
          <CardDescription className="text-xs text-muted-foreground">
            {payload.subject_details}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm leading-relaxed">
          {truncatedText}
        </CardDescription>
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Chunk {payload.chunk_index + 1}</span>
          <span>{payload.chunk_tokens} tokens</span>
        </div>
        {payload.url && (
          <div className="mt-2">
            <a 
              href={payload.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Listen to full episode →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}