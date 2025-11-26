'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  useConfig,
  useApproveConfig,
  useDeployConfig,
} from '@/hooks/useConfigs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/config/StatusBadge';
import { toast } from 'sonner';
import { Edit, Check, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfigDetailPage() {
  const params = useParams();
  const configId = params?.configId as string;
  const router = useRouter();
  const { user } = useAuth();
  const { data: config, isLoading } = useConfig(configId || '');
  const approveConfig = useApproveConfig();
  const deployConfig = useDeployConfig();

  const handleApprove = async () => {
    if (!configId) return;

    try {
      await approveConfig.mutateAsync(configId);
      toast.success('Config approved');
    } catch (error) {
      toast.error('Failed to approve config');
    }
  };

  const handleDeploy = async () => {
    if (!configId) return;

    try {
      await deployConfig.mutateAsync(configId);
      toast.success('Config deployed to Firebase');
    } catch (error) {
      toast.error('Failed to deploy config');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Config not found</p>
            <Button onClick={() => router.push('/games')} className="mt-4">
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = config.status === 'draft';
  const canApprove =
    config.status === 'in_review' &&
    (user?.role === 'lead_designer' ||
      user?.role === 'product_manager' ||
      user?.role === 'admin');
  const canDeploy =
    (config.status === 'approved' || config.status === 'in_review') &&
    (user?.role === 'product_manager' || user?.role === 'admin');

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Configuration Details
            </h1>
          </div>
          <p className="text-muted-foreground">Version {config.version}</p>
        </div>
        <StatusBadge status={config.status} />
      </div>

      {/* Workflow Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Workflow actions for this configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          {canEdit && (
            <Button onClick={() => router.push(`/configs/${configId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Config
            </Button>
          )}
          {canApprove && (
            <Button
              onClick={handleApprove}
              disabled={approveConfig.isPending}
              variant="default"
            >
              <Check className="mr-2 h-4 w-4" />
              {approveConfig.isPending ? 'Approving...' : 'Approve'}
            </Button>
          )}
          {canDeploy && (
            <Button
              onClick={handleDeploy}
              disabled={deployConfig.isPending}
              variant="default"
            >
              <Zap className="mr-2 h-4 w-4" />
              {deployConfig.isPending ? 'Deploying...' : 'Deploy to Firebase'}
            </Button>
          )}
          {!canEdit && !canApprove && !canDeploy && (
            <p className="text-sm text-muted-foreground">
              No actions available for this config status
            </p>
          )}
        </CardContent>
      </Card>

      {/* Config Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={config.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">{config.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {new Date(config.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By:</span>
              <span className="font-medium">{config.created_by}</span>
            </div>
            {config.approved_by && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved By:</span>
                <span className="font-medium">{config.approved_by}</span>
              </div>
            )}
            {config.deployed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deployed At:</span>
                <span className="font-medium">
                  {new Date(config.deployed_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Economy Config:</span>
              <span className="font-medium">
                {config.economy_config ? '✓ Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ad Config:</span>
              <span className="font-medium">
                {config.ad_config ? '✓ Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Notification Config:
              </span>
              <span className="font-medium">
                {config.notification_config ? '✓ Configured' : 'Not configured'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Config Preview */}
      {config.economy_config && (
        <Card>
          <CardHeader>
            <CardTitle>Economy Configuration</CardTitle>
            <CardDescription>Preview of economy config</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(config.economy_config, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

