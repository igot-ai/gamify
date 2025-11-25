'use client';

import { useState } from 'react';
import {
  useGames,
  useCreateGame,
  useUpdateGame,
  useDeleteGame,
} from '@/hooks/useGames';
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

export default function GamesPage() {
  const { data: games, isLoading } = useGames();
  const deleteGame = useDeleteGame();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredGames =
    games?.filter((g) =>
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
    <div className="p-8 space-y-8 animate-slide-up">
      <div className="space-y-3">
        <h1 className="text-5xl font-extrabold bg-gradient-hero bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
          Games
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage all your games and their configurations
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="🔍 Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-card/50 border-primary/20 focus:border-primary transition-all duration-300"
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect">
            <GameForm
              onSuccess={() => {
                setIsCreateOpen(false);
                toast.success('Game created successfully');
              }}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-xl shadow-primary/5">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="text-2xl text-gradient">Games List</CardTitle>
          <CardDescription className="text-base">
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredGames.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="mx-auto h-16 w-16 text-primary/50 mb-4" />
              <p className="text-muted-foreground text-lg">
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
                      {new Date(game.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <EditGameDialog game={game} />
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
                              Are you sure you want to delete "{game.name}"?
                              This action cannot be undone.
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

interface EditGameDialogProps {
  game: any;
}

function EditGameDialog({ game }: EditGameDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect">
        <GameForm
          game={game}
          onSuccess={() => {
            setIsOpen(false);
            toast.success('Game updated successfully');
          }}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface GameFormProps {
  game?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function GameForm({ game, onSuccess, onCancel }: GameFormProps) {
  const [formData, setFormData] = useState({
    name: game?.name || '',
    description: game?.description || '',
    firebase_project_id: game?.firebase_project_id || '',
  });

  const [errors, setErrors] = useState({
    name: '',
    firebase_project_id: '',
  });

  const createGame = useCreateGame();
  const updateGameMutation = useUpdateGame(game?.id || '');

  const validateForm = () => {
    const newErrors = {
      name: '',
      firebase_project_id: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Game name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Game name must be at least 2 characters';
    }

    if (!formData.firebase_project_id.trim()) {
      newErrors.firebase_project_id = 'Firebase Project ID is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.firebase_project_id)) {
      newErrors.firebase_project_id = 'Only lowercase letters, numbers, and hyphens allowed';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.firebase_project_id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (game) {
        await updateGameMutation.mutateAsync(formData);
      } else {
        await createGame.mutateAsync(formData);
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save game');
    }
  };

  const isLoading = createGame.isPending || updateGameMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>{game ? 'Edit Game' : 'Create New Game'}</DialogTitle>
        <DialogDescription>
          {game
            ? 'Update the game details below.'
            : 'Add a new game to manage its configurations across different environments.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="e.g., My Awesome Game"
            disabled={isLoading}
            className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description
          </label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Brief description of your game (optional)"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Provide a brief description to help identify this game.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="firebase_project_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Firebase Project ID <span className="text-destructive">*</span>
          </label>
          <Input
            id="firebase_project_id"
            value={formData.firebase_project_id}
            onChange={(e) => {
              setFormData({ ...formData, firebase_project_id: e.target.value });
              if (errors.firebase_project_id) setErrors({ ...errors, firebase_project_id: '' });
            }}
            placeholder="your-firebase-project"
            disabled={isLoading}
            className={errors.firebase_project_id ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.firebase_project_id && (
            <p className="text-sm text-destructive">{errors.firebase_project_id}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Find this in your Firebase Console under Project Settings.
          </p>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">⏳</span>
              {game ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            game ? 'Update Game' : 'Create Game'
          )}
        </Button>
      </div>
    </form>
  );
}

