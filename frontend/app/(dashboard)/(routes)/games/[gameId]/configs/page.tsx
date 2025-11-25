'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useConfigs,
  useCreateConfig,
  useDeployConfig,
} from '@/hooks/useConfigs';
import { useGame } from '@/hooks/useGames';
import type { GameConfig } from '@/types/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { StatusBadge } from '@/components/config/StatusBadge';
import { Plus, Eye, Edit, Zap, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { getDefaultTemplate, type ConfigType } from '@/lib/configTemplates';

export default function ConfigsPage() {
  const params = useParams();
  const gameId = params?.gameId as string;
  const router = useRouter();
  const { data: game } = useGame(gameId || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedConfigTypes, setSelectedConfigTypes] = useState<Set<ConfigType>>(new Set());

  // Fetch all configs for this game (no environment filter - one config per game)
  const { data: allConfigs, isLoading } = useConfigs({
    game_id: gameId,
    status: statusFilter === 'all' ? '' : statusFilter,
  });

  const createConfig = useCreateConfig();
  const deployConfig = useDeployConfig();

  // Config type options
  const configTypes: Array<{ id: ConfigType; name: string; description: string }> = [
    { id: 'economy', name: 'Economy', description: 'Currencies, IAP packages, rewards' },
    { id: 'shop', name: 'Shop', description: 'Shop items, categories, bundles' },
    { id: 'ads', name: 'Ads', description: 'Ad networks and placements' },
    { id: 'notifications', name: 'Notifications', description: 'Push and local notifications' },
    { id: 'boosters', name: 'Boosters', description: 'Power-ups and boosters' },
    { id: 'chapter_reward', name: 'Chapter Rewards', description: 'Level progression rewards' },
    { id: 'game_core', name: 'Game Core', description: 'Core game settings' },
  ];

  // Handle toggling config type selection
  const handleToggleConfigType = (configType: ConfigType) => {
    const newSelected = new Set(selectedConfigTypes);
    if (newSelected.has(configType)) {
      newSelected.delete(configType);
    } else {
      newSelected.add(configType);
    }
    setSelectedConfigTypes(newSelected);
  };

  // Sort configs by version (descending - latest first)
  const sortedConfigs = useMemo(() => {
    if (!allConfigs) return [];
    return [...allConfigs].sort((a, b) => (b.version || 0) - (a.version || 0));
  }, [allConfigs]);

  const filteredConfigs = useMemo(() => {
    return sortedConfigs.filter((c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.version?.toString().includes(searchTerm)
    );
  }, [sortedConfigs, searchTerm]);

  // Check if config exists for this game
  const hasExistingConfig = sortedConfigs.length > 0;
  const latestConfig = sortedConfigs[0]; // Latest version (highest version number)

  const handleCreateConfig = async () => {
    if (!gameId) {
      toast.error('Game ID is required');
      return;
    }

    try {
      let newConfig: GameConfig | undefined;
      
      if (hasExistingConfig && latestConfig) {
        // Create new version based on latest config
        // Copy all config data from latest version
        const configData = {
          game_core_config: latestConfig.data?.game_core || null,
          economy_config: latestConfig.data?.economy || null,
          ad_config: latestConfig.data?.ad || null,
          notification_config: latestConfig.data?.notifications || null,
          booster_config: latestConfig.data?.boosters || null,
          chapter_reward_config: latestConfig.data?.chapter_reward || null,
          shop_config: latestConfig.data?.shop || null,
          analytics_config: latestConfig.data?.analytics || null,
          ux_config: latestConfig.data?.ux || null,
        };

        newConfig = await createConfig.mutateAsync({
          game_id: gameId,
          configData, // Pass existing config data
        });
        if (newConfig) {
          toast.success(`New version v${newConfig.version} created from v${latestConfig.version}`);
        }
      } else {
        // Create first config for this game
        // Initialize default templates for selected config types
        const configData: any = {};
        
        selectedConfigTypes.forEach((configType) => {
          const template = getDefaultTemplate(configType);
          const configKey = configType === 'economy' ? 'economy_config' :
                           configType === 'shop' ? 'shop_config' :
                           configType === 'ads' ? 'ad_config' :
                           configType === 'notifications' ? 'notification_config' :
                           configType === 'boosters' ? 'booster_config' :
                           configType === 'chapter_reward' ? 'chapter_reward_config' :
                           configType === 'game_core' ? 'game_core_config' :
                           null;
          
          if (configKey) {
            configData[configKey] = template;
          }
        });

        newConfig = await createConfig.mutateAsync({
          game_id: gameId,
          configData: Object.keys(configData).length > 0 ? configData : undefined,
        });
        
        if (newConfig) {
          const count = selectedConfigTypes.size;
          toast.success(
            count > 0
              ? `Configuration created with ${count} default template${count > 1 ? 's' : ''}`
              : 'Configuration created - configure sections in the editor'
          );
        }
      }
      
      setShowCreateDialog(false);
      setSelectedConfigTypes(new Set()); // Reset selection
      if (newConfig?.id) {
        router.push(`/configs/${newConfig.id}/edit`);
      } else {
        toast.error('Failed to create config - no ID returned');
      }
    } catch (error: any) {
      console.error('Config creation error:', error);
      toast.error(error?.response?.data?.detail || 'Failed to create config');
    }
  };

  const handleDeploy = async (configId: string) => {
    try {
      await deployConfig.mutateAsync(configId);
      toast.success('Config deployed to Firebase');
    } catch {
      toast.error('Failed to deploy config');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Configurations
        </h1>
        <p className="text-muted-foreground">
          {game?.name} - Manage and deploy game configurations
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 max-w-md">
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search by version or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={!gameId}
            className="ml-auto"
          >
            {hasExistingConfig ? (
              <>
                <GitBranch className="mr-2 h-4 w-4" />
                New Version
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Config
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Versions</CardTitle>
          <CardDescription>
            {hasExistingConfig ? (
              <>
                {filteredConfigs.length} version{filteredConfigs.length !== 1 ? 's' : ''} for{' '}
                <span className="font-medium">{game?.name}</span>
                {latestConfig && (
                  <span className="ml-2 text-primary">
                    (Latest: v{latestConfig.version})
                  </span>
                )}
              </>
            ) : (
              'No configurations yet. Create the first configuration for this game.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConfigs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {hasExistingConfig
                  ? 'No configurations match your filters'
                  : 'No configurations found'}
              </p>
              {!hasExistingConfig && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Configuration
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigs.map((config, index) => (
                  <TableRow
                    key={config.id}
                    className={index === 0 ? 'bg-muted/50' : ''}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">v{config.version}</span>
                        {index === 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Latest
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={config.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(config.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {config.createdBy}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/configs/${config.id}`)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {config.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/configs/${config.id}/edit`)
                          }
                          title="Edit config"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {config.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeploy(config.id)}
                          disabled={deployConfig.isPending}
                          title="Deploy to Firebase"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Config Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          setSelectedConfigTypes(new Set());
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {hasExistingConfig ? 'Create New Version' : 'Create Configuration'}
            </DialogTitle>
            <DialogDescription>
              {hasExistingConfig ? (
                <>
                  Create a new version based on the latest configuration (v{latestConfig?.version}).
                  The new version will start as a draft and inherit all settings from v{latestConfig?.version}.
                </>
              ) : (
                <>
                  Create the first configuration for <strong>{game?.name}</strong>.
                  {' '}Select which configuration sections to initialize with default templates, or create an empty config and configure sections later.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {!hasExistingConfig && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Configuration Sections (Optional)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Select sections to initialize with default templates. You can configure all sections later in the editor.
                </p>
              </div>
              
              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                {configTypes.map((configType) => (
                  <label
                    key={configType.id}
                    className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConfigTypes.has(configType.id)}
                      onChange={() => handleToggleConfigType(configType.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm">{configType.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {configType.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedConfigTypes.size > 0 && (
                <div className="rounded-lg bg-primary/10 p-3 text-sm">
                  <strong>{selectedConfigTypes.size}</strong> section{selectedConfigTypes.size > 1 ? 's' : ''} selected
                  {' '}· Default templates will be loaded for easy editing
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setSelectedConfigTypes(new Set());
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateConfig} disabled={createConfig.isPending}>
              {createConfig.isPending ? (
                'Creating...'
              ) : hasExistingConfig ? (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Create Version
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Config
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

