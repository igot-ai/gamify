'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Plus, Search, Gamepad2, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGames, useCreateGame } from '@/hooks/useGames';
import { useGame } from '@/contexts/GameContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { toast } from 'sonner';
import type { Game } from '@/types/api';

interface GameAvatarProps {
  game: Game;
  size?: 'sm' | 'md';
}

function GameAvatar({ game, size = 'sm' }: GameAvatarProps) {
  const sizeClasses = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  if (game.avatar_url) {
    return (
      <img
        src={`${apiUrl}${game.avatar_url}`}
        alt={game.name}
        className={`${sizeClasses} rounded-full object-cover border border-border`}
      />
    );
  }
  
  return (
    <div
      className={`${sizeClasses} bg-amber-500 rounded-full flex items-center justify-center text-white font-medium`}
    >
      {game.name[0].toUpperCase()}
    </div>
  );
}

interface GameFormData {
  app_id: string;
  name: string;
  description: string;
  avatar: File | null;
}

interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function CreateGameForm({ onSuccess }: { onSuccess: (game: Game) => void }) {
  const [formData, setFormData] = useState<GameFormData>({
    app_id: '',
    name: '',
    description: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [firebaseServiceAccount, setFirebaseServiceAccount] = useState<File | null>(null);
  const [firebaseProjectId, setFirebaseProjectId] = useState<string | null>(null);
  const [firebaseFileError, setFirebaseFileError] = useState<string | null>(null);
  const createGame = useCreateGame();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFirebaseFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFirebaseFileError(null);
    setFirebaseProjectId(null);
    
    if (!file) {
      setFirebaseServiceAccount(null);
      return;
    }

    // Validate file extension
    if (!file.name.endsWith('.json')) {
      setFirebaseFileError('Please upload a JSON file');
      return;
    }

    // Read and validate JSON content
    try {
      const content = await file.text();
      const json = JSON.parse(content) as FirebaseServiceAccount;
      
      // Validate required fields
      const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
      const missingFields = requiredFields.filter(field => !(field in json));
      
      if (missingFields.length > 0) {
        setFirebaseFileError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      if (json.type !== 'service_account') {
        setFirebaseFileError('Invalid service account type. Expected "service_account"');
        return;
      }

      if (!json.private_key.startsWith('-----BEGIN PRIVATE KEY-----')) {
        setFirebaseFileError('Invalid private key format');
        return;
      }

      setFirebaseServiceAccount(file);
      setFirebaseProjectId(json.project_id);
    } catch {
      setFirebaseFileError('Invalid JSON file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      submitData.append('app_id', formData.app_id);
      submitData.append('name', formData.name);
      if (formData.description) {
        submitData.append('description', formData.description);
      }
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }
      if (firebaseServiceAccount) {
        submitData.append('firebase_service_account', firebaseServiceAccount);
      }
      
      const newGame = await createGame.mutateAsync(submitData);
      if (newGame) {
        onSuccess(newGame);
        toast.success('Game created successfully');
      }
    } catch {
      toast.error('Failed to create game');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New Game</DialogTitle>
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
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-xs text-muted-foreground">Click to upload avatar</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">App ID *</label>
          <Input
            value={formData.app_id}
            onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
            placeholder="com.company.game"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Unique identifier for your app (e.g., com.company.game)</p>
        </div>
        <div>
          <label className="text-sm font-medium">Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Game name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Game description"
          />
        </div>
        
        {/* Firebase Service Account Upload */}
        <div>
          <label className="text-sm font-medium">Firebase Service Account</label>
          <div className="mt-1">
            <label
              className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                firebaseFileError
                  ? 'border-destructive bg-destructive/5'
                  : firebaseServiceAccount
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex flex-col items-center justify-center py-2">
                {firebaseServiceAccount ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-500 mb-1" />
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {firebaseServiceAccount.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Project: <span className="font-mono">{firebaseProjectId}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <FileJson className="h-6 w-6 text-muted-foreground mb-1" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Click to upload</span> Firebase service account JSON
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Download from Firebase Console
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFirebaseFileChange}
                className="hidden"
              />
            </label>
            {firebaseFileError && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {firebaseFileError}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4 justify-end">
        <Button type="submit" disabled={createGame.isPending}>
          {createGame.isPending ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

export function GameSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: games, isLoading: isLoadingGames } = useGames();
  const { selectedGame, selectedGameId, setSelectedGame, isLoading: isLoadingSelectedGame } = useGame();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Auto-select first game if none selected
  useEffect(() => {
    if (games && games.length > 0 && !selectedGameId && !isLoadingSelectedGame) {
      setSelectedGame(games[0]);
    }
  }, [games, selectedGameId, setSelectedGame, isLoadingSelectedGame]);

  const filteredGames = useMemo(() => {
    if (!games) return [];
    if (!searchTerm) return games;
    return games.filter((g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [games, searchTerm]);

  const handleSelectGame = (game: Game) => {
    setOpen(false);
    setSearchTerm('');
    
    // If not on a section page, navigate to the economy section with the new game
    if (!pathname?.startsWith('/sections/')) {
      router.push(`/sections/economy?gameId=${game.id}`);
    } else {
      // On section pages, just update the URL param (setSelectedGame does this)
      setSelectedGame(game);
    }
  };

  const handleCreateSuccess = (newGame: Game) => {
    setCreateDialogOpen(false);
    // Select the newly created game and navigate to it
    setSelectedGame(newGame);
    router.push(`/sections/economy?gameId=${newGame.id}`);
  };

  if (isLoadingGames) {
    return (
      <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between h-9 bg-background/50 border-border/50 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedGame ? (
                <>
                  <GameAvatar game={selectedGame} size="sm" />
                  <span className="truncate text-sm">{selectedGame.name}</span>
                </>
              ) : (
                <>
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">Select game</span>
                </>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 bg-zinc-900 border-zinc-700" align="end">
          <div className="p-2 border-b border-zinc-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[240px]">
            <div className="p-1">
              {filteredGames.length === 0 ? (
                <div className="py-6 text-center text-sm text-zinc-400">
                  {games?.length === 0 ? 'No games yet' : 'No games found'}
                </div>
              ) : (
                filteredGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleSelectGame(game)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                      selectedGame?.id === game.id
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'hover:bg-zinc-800'
                    }`}
                  >
                    <GameAvatar game={game} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${selectedGame?.id === game.id ? 'text-amber-400' : 'text-zinc-100'}`}>{game.name}</div>
                      {game.app_id && (
                        <div className="text-xs text-zinc-400 truncate font-mono">
                          {game.app_id}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-2 border-t border-zinc-700">
            <Button
              variant="ghost"
              className="w-full justify-start h-9 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => {
                setOpen(false);
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <CreateGameForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
