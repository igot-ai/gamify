'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Plus, Minus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonDiffViewerProps {
  oldValue: any;
  newValue: any;
  title?: string;
  description?: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
  lineNumber?: number;
}

/**
 * Generate git-style unified diff lines from JSON objects
 */
function generateUnifiedDiff(oldValue: any, newValue: any): DiffLine[] {
  const oldLines = JSON.stringify(oldValue, null, 2).split('\n');
  const newLines = JSON.stringify(newValue, null, 2).split('\n');
  
  const diffLines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  
  while (i < oldLines.length || j < newLines.length) {
    const oldLine = oldLines[i];
    const newLine = newLines[j];
    
    if (i >= oldLines.length) {
      // Only new lines remaining
      diffLines.push({
        type: 'added',
        content: newLine,
        lineNumber: j + 1,
      });
      j++;
    } else if (j >= newLines.length) {
      // Only old lines remaining
      diffLines.push({
        type: 'removed',
        content: oldLine,
        lineNumber: i + 1,
      });
      i++;
    } else if (oldLine === newLine) {
      // Lines match - context
      diffLines.push({
        type: 'context',
        content: oldLine,
        lineNumber: i + 1,
      });
      i++;
      j++;
    } else {
      // Lines differ - mark old as removed, new as added
      diffLines.push({
        type: 'removed',
        content: oldLine,
        lineNumber: i + 1,
      });
      diffLines.push({
        type: 'added',
        content: newLine,
        lineNumber: j + 1,
      });
      i++;
      j++;
    }
  }
  
  return diffLines;
}

export function JsonDiffViewer({
  oldValue,
  newValue,
  title = 'Changes Comparison',
  description = 'Review the differences between original and updated configuration',
}: JsonDiffViewerProps) {
  const diffLines = useMemo(() => {
    return generateUnifiedDiff(oldValue, newValue);
  }, [oldValue, newValue]);

  const summary = useMemo(() => {
    const added = diffLines.filter((d) => d.type === 'added').length;
    const removed = diffLines.filter((d) => d.type === 'removed').length;
    return { added, removed, modified: 0 };
  }, [diffLines]);

  const hasChanges = summary.added > 0 || summary.removed > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            {summary.removed > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                <Minus className="h-3 w-3 mr-1" />
                -{summary.removed} lines
              </Badge>
            )}
            {summary.added > 0 && (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                <Plus className="h-3 w-3 mr-1" />
                +{summary.added} lines
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {!hasChanges ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <p>No changes detected</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] w-full">
          <div className="rounded-lg border bg-slate-950 overflow-hidden font-mono text-sm">
            {diffLines.map((line, index) => (
              <DiffLine key={index} line={line} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface DiffLineProps {
  line: DiffLine;
}

function DiffLine({ line }: DiffLineProps) {
  const getLineStyle = () => {
    switch (line.type) {
      case 'added':
        return 'bg-green-500/10 text-green-400 border-l-2 border-green-500';
      case 'removed':
        return 'bg-red-500/10 text-red-400 border-l-2 border-red-500';
      case 'context':
        return 'bg-transparent text-slate-300';
      default:
        return 'bg-transparent text-slate-300';
    }
  };

  const getPrefix = () => {
    switch (line.type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'context':
        return ' ';
      default:
        return ' ';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start px-4 py-1 hover:bg-white/5 transition-colors',
        getLineStyle()
      )}
    >
      <span
        className={cn(
          'inline-block w-6 text-right mr-4 select-none font-bold',
          line.type === 'added' && 'text-green-500',
          line.type === 'removed' && 'text-red-500',
          line.type === 'context' && 'text-slate-600'
        )}
      >
        {getPrefix()}
      </span>
      <pre className="flex-1 whitespace-pre overflow-x-auto">
        <code>{line.content}</code>
      </pre>
    </div>
  );
}


