import { useState } from 'react';
import { useGames, useCreateGame, useUpdateGame, useDeleteGame } from '@/hooks/useGames';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function GamesPage() {
  const { data: games, isLoading } = useGames();
  const deleteGame = useDeleteGame();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredGames = games?.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteConfirm = async (gameId: string) => {
    try {
      await deleteGame.mutateAsync(gameId);
      toast.success('Game deleted successfully');
    } catch {
      toast.error('Failed to delete game');
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
          Games
        </h1>
        <p className="text-muted-foreground">
          Manage all your games and their configurations
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </DialogTrigger>
          <DialogContent>
            <GameForm
              onSuccess={() => {
                setIsCreateOpen(false);
                toast.success('Game created successfully');
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Games List</CardTitle>
          <CardDescription>
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {games?.length === 0
                  ? 'No games yet. Create your first game to get started.'
                  : 'No games match your search.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Firebase Project</TableHead>
                  <TableHead>Environments</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="font-medium">{game.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {game.firebase_project_id}
                    </TableCell>
                    <TableCell>{game.environments?.length || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(game.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <GameForm
                            game={game}
                            onSuccess={() => {
                              toast.success('Game updated successfully');
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Game</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{game.name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-4 justify-end">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteConfirm(game.id)}
                              disabled={deleteGame.isPending}
                            >
                              {deleteGame.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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

interface GameFormProps {
  game?: any;
  onSuccess?: () => void;
}

function GameForm({ game, onSuccess }: GameFormProps) {
  const [formData, setFormData] = useState({
    name: game?.name || '',
    description: game?.description || '',
    firebase_project_id: game?.firebase_project_id || '',
  });

  const createGame = useCreateGame();
  const updateGameMutation = useUpdateGame(game?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (game) {
        await updateGameMutation.mutateAsync(formData);
      } else {
        await createGame.mutateAsync(formData);
      }
      onSuccess?.();
    } catch {
      toast.error('Failed to save game');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{game ? 'Edit Game' : 'Create New Game'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name *</label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Game name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Game description"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Firebase Project ID *</label>
          <Input
            value={formData.firebase_project_id}
            onChange={(e) =>
              setFormData({ ...formData, firebase_project_id: e.target.value })
            }
            placeholder="your-firebase-project"
            required
          />
        </div>
      </div>
      <div className="flex gap-4 justify-end">
        <Button type="submit" disabled={createGame.isPending || updateGameMutation.isPending}>
          {game ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

