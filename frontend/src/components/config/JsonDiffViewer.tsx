'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { compareObjects, formatValue, getDiffSummary, type DiffItem } from '@/lib/utils/diff';
import { Plus, Minus, Edit, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonDiffViewerProps {
  oldValue: any;
  newValue: any;
  title?: string;
  description?: string;
}

export function JsonDiffViewer({
  oldValue,
  newValue,
  title = 'Changes Comparison',
  description = 'Review the differences between original and updated configuration',
}: JsonDiffViewerProps) {
  const diffs = useMemo(() => {
    return compareObjects(oldValue, newValue);
  }, [oldValue, newValue]);

  const summary = useMemo(() => {
    return getDiffSummary(diffs);
  }, [diffs]);

  const hasChanges = diffs.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              {summary.added > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  <Plus className="h-3 w-3 mr-1" />
                  {summary.added} Added
                </Badge>
              )}
              {summary.modified > 0 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  <Edit className="h-3 w-3 mr-1" />
                  {summary.modified} Modified
                </Badge>
              )}
              {summary.removed > 0 && (
                <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">
                  <Minus className="h-3 w-3 mr-1" />
                  {summary.removed} Removed
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasChanges ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No changes detected</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <div className="space-y-3">
              {diffs.map((diff, index) => (
                <DiffItem key={index} diff={diff} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

interface DiffItemProps {
  diff: DiffItem;
}

function DiffItem({ diff }: DiffItemProps) {
  const getIcon = () => {
    switch (diff.type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (diff.type) {
      case 'added':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900';
      case 'removed':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900';
      case 'modified':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <div className={cn('rounded-lg border p-4', getBgColor())}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <code className="text-sm font-semibold text-foreground">{diff.path}</code>
            <Badge
              variant="outline"
              className={cn(
                diff.type === 'added' && 'bg-green-500/10 text-green-700 dark:text-green-400',
                diff.type === 'removed' && 'bg-red-500/10 text-red-700 dark:text-red-400',
                diff.type === 'modified' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
              )}
            >
              {diff.type.toUpperCase()}
            </Badge>
          </div>

          {diff.type === 'removed' && diff.oldValue !== undefined && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Old Value:</p>
              <pre className="text-sm bg-background p-2 rounded border border-destructive/20 overflow-x-auto">
                <code className="text-destructive">{formatValue(diff.oldValue)}</code>
              </pre>
            </div>
          )}

          {diff.type === 'added' && diff.newValue !== undefined && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">New Value:</p>
              <pre className="text-sm bg-background p-2 rounded border border-green-500/20 overflow-x-auto">
                <code className="text-green-700 dark:text-green-400">{formatValue(diff.newValue)}</code>
              </pre>
            </div>
          )}

          {diff.type === 'modified' && (
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Old Value:</p>
                <pre className="text-sm bg-background p-2 rounded border border-destructive/20 overflow-x-auto">
                  <code className="text-destructive line-through">{formatValue(diff.oldValue)}</code>
                </pre>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">New Value:</p>
                <pre className="text-sm bg-background p-2 rounded border border-green-500/20 overflow-x-auto">
                  <code className="text-green-700 dark:text-green-400">{formatValue(diff.newValue)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


