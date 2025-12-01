'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, Edit, Trash2, AlertCircle, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GamesPage() {
  const router = useRouter();
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
              <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
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
                  <TableHead>Game</TableHead>
                  <TableHead>Firebase Project</TableHead>
                  <TableHead>Environments</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.map((game) => (
                  <TableRow 
                    key={game.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/sections/economy?gameId=${game.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {game.avatar_url ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${game.avatar_url}`}
                            alt={game.name}
                            className="h-8 w-8 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {game.name[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium">{game.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {game.firebase_project_id}
                    </TableCell>
                    <TableCell>{game.environments?.length || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {game.created_at ? new Date(game.created_at).toLocaleDateString() : ''}
                    </TableCell>
                    <TableCell className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    game?.avatar_url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${game.avatar_url}` : null
  );

  const createGame = useCreateGame();
  const updateGameMutation = useUpdateGame(game?.id || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (game) {
        // For updates, use JSON (avatar updates not supported in edit mode for now)
        await updateGameMutation.mutateAsync(formData);
      } else {
        // For creation, use FormData to support avatar upload
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('firebase_project_id', formData.firebase_project_id);
        if (formData.description) {
          submitData.append('description', formData.description);
        }
        if (avatar) {
          submitData.append('avatar', avatar);
        }
        await createGame.mutateAsync(submitData);
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
      
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="h-20 w-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {!game && (
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {game ? 'Avatar cannot be changed after creation' : 'Click to upload avatar'}
        </span>
      </div>

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

