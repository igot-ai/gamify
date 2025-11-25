import type { ConfigStatus } from '../../types/api';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
    status: ConfigStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variants: Record<ConfigStatus, string> = {
        draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        in_review: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        approved: 'bg-green-500/10 text-green-500 border-green-500/20',
        deployed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        archived: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    };

    const labels: Record<ConfigStatus, string> = {
        draft: 'Draft',
        in_review: 'In Review',
        approved: 'Approved',
        deployed: 'Deployed',
        archived: 'Archived',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                variants[status],
                className
            )}
        >
            {labels[status]}
        </span>
    );
}
