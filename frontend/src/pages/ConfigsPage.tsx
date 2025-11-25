import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfigs, useCreateConfig, useDeployConfig } from '@/hooks/useConfigs';
import { useGame } from '@/hooks/useGames';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
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
import { Plus, Eye, Edit, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function ConfigsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { data: game } = useGame(gameId || '');
  const [environmentId, setEnvironmentId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: allConfigs, isLoading } = useConfigs({
    game_id: gameId,
    environment_id: environmentId,
    status: statusFilter,
  });

  const createConfig = useCreateConfig();
  const deployConfig = useDeployConfig();

  const filteredConfigs = allConfigs?.filter((c) =>
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateConfig = async () => {
    if (!gameId || !environmentId) {
      toast.error('Please select a game and environment');
      return;
    }

    try {
      const newConfig = await createConfig.mutateAsync({
        game_id: gameId,
        environment_id: environmentId,
      });
      navigate(`/configs/${newConfig.id}/edit`);
      toast.success('Config created');
    } catch {
      toast.error('Failed to create config');
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">Environment</label>
          <Select value={environmentId} onValueChange={setEnvironmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {game?.environments?.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
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
            placeholder="Search configs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleCreateConfig}
            disabled={!gameId || !environmentId}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Config
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurations</CardTitle>
          <CardDescription>
            {filteredConfigs.length} configuration{filteredConfigs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConfigs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No configurations found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">v{config.version}</TableCell>
                    <TableCell>
                      <StatusBadge status={config.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(config.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{config.created_by}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/configs/${config.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {config.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/configs/${config.id}/edit`)}
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
    </div>
  );
}

