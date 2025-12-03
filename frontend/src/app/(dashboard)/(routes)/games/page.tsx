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
import { Plus, Edit, Trash2, Gamepad2 } from 'lucide-react';
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
                  <TableHead>App ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.map((game) => (
                  <TableRow 
                    key={game.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/sections/economy?appId=${game.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {game.logo_url ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${game.logo_url}`}
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
                      {game.app_id}
                    </TableCell>
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
    app_id: game?.app_id || '',
    name: game?.name || '',
    description: game?.description || '',
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    game?.logo_url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${game.logo_url}` : null
  );

  const createGame = useCreateGame();
  const updateGameMutation = useUpdateGame(game?.id || '');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (game) {
        // For updates, use JSON (logo and app_id updates not supported in edit mode)
        const { app_id, ...updateData } = formData;
        await updateGameMutation.mutateAsync(updateData);
      } else {
        // For creation, use FormData to support file uploads
        const submitData = new FormData();
        submitData.append('app_id', formData.app_id);
        submitData.append('name', formData.name);
        if (formData.description) {
          submitData.append('description', formData.description);
        }
        if (logo) {
          submitData.append('logo', logo);
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
      
      {/* Logo Upload */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo preview"
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
              onChange={handleLogoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {game ? 'Logo cannot be changed after creation' : 'Click to upload logo'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">App ID *</label>
          <Input
            value={formData.app_id}
            onChange={(e) =>
              setFormData({ ...formData, app_id: e.target.value })
            }
            placeholder="com.company.game"
            required
            disabled={!!game}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {game ? 'App ID cannot be changed after creation' : 'Unique identifier for your app (e.g., com.company.game)'}
          </p>
        </div>
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
      </div>
      <div className="flex gap-4 justify-end">
        <Button 
          type="submit" 
          disabled={createGame.isPending || updateGameMutation.isPending}
        >
          {game ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
