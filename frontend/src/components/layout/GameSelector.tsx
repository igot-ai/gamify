'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Plus, Search, Gamepad2 } from 'lucide-react';
import { useGames, useCreateGame } from '@/hooks/useGames';
import { useSelectedGame } from '@/hooks/useSelectedGame';
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
import { useIsAdmin } from '@/stores/authStore';

interface GameLogoProps {
  game: Game;
  size?: 'sm' | 'md';
}

function GameLogo({ game, size = 'sm' }: GameLogoProps) {
  const sizeClasses = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  if (game.logo_url) {
    return (
      <img
        src={`${apiUrl}${game.logo_url}`}
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
  logo: File | null;
}

function CreateGameForm({ onSuccess }: { onSuccess: (game: Game) => void }) {
  const [formData, setFormData] = useState<GameFormData>({
    app_id: '',
    name: '',
    description: '',
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const createGame = useCreateGame();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
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
      const submitData = new FormData();
      submitData.append('app_id', formData.app_id);
      submitData.append('name', formData.name);
      if (formData.description) {
        submitData.append('description', formData.description);
      }
      if (formData.logo) {
        submitData.append('logo', formData.logo);
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
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-xs text-muted-foreground">Click to upload logo</span>
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
  const { selectedGame, selectedGameId, setSelectedGame, isLoading: isLoadingSelectedGame } = useSelectedGame();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const isAdmin = useIsAdmin();

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
      router.push(`/sections/economy?appId=${game.app_id}`);
    } else {
      // On section pages, just update the URL param (setSelectedGame does this)
      setSelectedGame(game);
    }
  };

  const handleCreateSuccess = (newGame: Game) => {
    setCreateDialogOpen(false);
    // Select the newly created game and navigate to economy section with currencies tab
    setSelectedGame(newGame);
    router.push(`/sections/economy?appId=${newGame.app_id}&tab=currencies`);
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
                  <GameLogo game={selectedGame} size="sm" />
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
        <PopoverContent className="w-[280px] p-0 bg-white border-border" align="end">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[240px]">
            <div className="p-1">
              {filteredGames.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {games?.length === 0 ? 'No games yet' : 'No games found'}
                </div>
              ) : (
                filteredGames.map((game) => (
                  <button
                    key={game.app_id}
                    onClick={() => handleSelectGame(game)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                      selectedGame?.app_id === game.app_id
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <GameLogo game={game} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${selectedGame?.app_id === game.app_id ? 'text-amber-600' : 'text-foreground'}`}>{game.name}</div>
                      {game.app_id && (
                        <div className="text-xs text-muted-foreground truncate font-mono">
                          {game.app_id}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
          
          {isAdmin && (
            <div className="p-2 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start h-9 text-foreground hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setOpen(false);
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Game
              </Button>
            </div>
          )}
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
