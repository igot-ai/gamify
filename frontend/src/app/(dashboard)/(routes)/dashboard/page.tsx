'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useGames } from '@/hooks/useGames';
import { apiClient } from '@/lib/api';
import { useIsAdmin } from '@/stores/authStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Users } from 'lucide-react';

interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { data: games, isLoading } = useGames();
  
  // Fetch users count (admin only)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get<UserListItem[]>('/users');
      return response.data || [];
    },
    enabled: isAdmin, // Only fetch if user is admin
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage configurations for all your games
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40 transition cursor-pointer"
          onClick={() => router.push('/games')}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Games
              <ArrowRight className="h-5 w-5" />
            </CardTitle>
            <CardDescription>Manage your game catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{games?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Games</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card
            className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 hover:border-accent/40 transition cursor-pointer"
            onClick={() => router.push('/users')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users
                </div>
                <ArrowRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>Manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {isLoadingUsers ? '...' : users.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {users.length === 0 
                  ? 'No users yet' 
                  : users.length === 1 
                  ? 'User' 
                  : 'Total Users'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Your Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map((game) => (
            <Card
              key={game.app_id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm"
              onClick={() => router.push(`/sections/economy?appId=${game.app_id}`)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{game.name}</CardTitle>
                <CardDescription>
                  {game.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App ID:</span>
                    <span className="font-mono text-xs text-foreground">
                      {game.app_id}
                    </span>
                  </div>
                </div>
                <Button className="w-full">View Configs</Button>
              </CardContent>
            </Card>
          ))}

          {(!games || games.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center mb-4">
                  No games found. Create your first game to get started.
                </p>
                <Button onClick={() => router.push('/games')}>
                  Go to Games Management
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

