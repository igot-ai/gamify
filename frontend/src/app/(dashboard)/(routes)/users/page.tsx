'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore, useIsAdmin } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Plus, 
  Pencil, 
  UserX, 
  Loader2, 
  Users, 
  Shield, 
  Gamepad2,
  X 
} from 'lucide-react';
import { toast } from 'sonner';

type UserRole = 'admin' | 'game_operator';

interface Game {
  app_id: string;
  name: string;
}

interface AssignedGame {
  app_id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  assigned_games?: AssignedGame[];
}

interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export default function UsersPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { isLoading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    password: '',
    role: 'game_operator',
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, authLoading, router]);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get<UserListItem[]>('/users');
      return response.data;
    },
    enabled: isAdmin,
  });

  // Fetch all games for assignment
  const { data: gamesResponse, isLoading: gamesLoading } = useQuery({
    queryKey: ['all-games-for-assignment'],
    queryFn: async () => {
      const response = await apiClient.get<Game[]>('/games');
      return response.data;
    },
  });
  const games = gamesResponse ?? [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiClient.post<User>('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('User created successfully');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create user';
      toast.error(message);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const response = await apiClient.patch<User>(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      toast.success('User updated successfully');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update user';
      toast.error(message);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to delete user';
      toast.error(message);
    },
  });

  // Assign game mutation
  const assignGameMutation = useMutation({
    mutationFn: async ({ userId, gameId }: { userId: string; gameId: string }) => {
      const response = await apiClient.post<User>(`/users/${userId}/games/${gameId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(data);
      toast.success('Game assigned successfully');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to assign game';
      toast.error(message);
    },
  });

  // Remove game assignment mutation
  const removeGameMutation = useMutation({
    mutationFn: async ({ userId, gameId }: { userId: string; gameId: string }) => {
      const response = await apiClient.delete<User>(`/users/${userId}/games/${gameId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(data);
      toast.success('Game assignment removed');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to remove game';
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'game_operator',
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const updateData: Partial<UserFormData> = {
      email: formData.email,
      name: formData.name,
      role: formData.role,
    };
    
    // Only include password if it was changed
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const openEditDialog = async (user: UserListItem) => {
    // Fetch full user details with assigned games
    try {
      const response = await apiClient.get<User>(`/users/${user.id}`);
      setSelectedUser(response.data);
      setFormData({
        email: response.data.email,
        name: response.data.name,
        password: '',
        role: response.data.role,
      });
      setIsEditDialogOpen(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const openAssignDialog = async (user: UserListItem) => {
    try {
      const response = await apiClient.get<User>(`/users/${user.id}`);
      setSelectedUser(response.data);
      setIsAssignDialogOpen(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const getUnassignedGames = () => {
    if (!selectedUser?.assigned_games) return games;
    const assignedAppIds = new Set(selectedUser.assigned_games.map(g => g.app_id));
    return games.filter(game => !assignedAppIds.has(game.app_id));
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a73e8] rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500">Manage users and their game assignments</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? (
                          <><Shield className="w-3 h-3 mr-1" /> Admin</>
                        ) : (
                          <><Gamepad2 className="w-3 h-3 mr-1" /> Operator</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === 'game_operator' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAssignDialog(user)}
                          >
                            <Gamepad2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                            if (confirm('Are you sure you want to delete this user?')) {
                              deleteUserMutation.mutate(user.id);
                              }
                            }}
                          >
                            <UserX className="w-4 h-4 text-red-500" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They will receive login credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game_operator">Game Operator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="game_operator">Game Operator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Games Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Game Assignments</DialogTitle>
            <DialogDescription>
              Assign games to {selectedUser?.name}. Operators can only access assigned games.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current assignments */}
            <div>
              <Label className="text-slate-700">Assigned Games</Label>
              <div className="mt-2 space-y-2">
                {selectedUser?.assigned_games && selectedUser.assigned_games.length > 0 ? (
                  selectedUser.assigned_games.map((game) => (
                    <div
                      key={game.app_id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-sm">{game.name}</span>
                        <span className="text-xs text-slate-500 ml-2">({game.app_id})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGameMutation.mutate({
                          userId: selectedUser.id,
                          gameId: game.app_id,
                        })}
                        disabled={removeGameMutation.isPending}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-2">No games assigned</p>
                )}
              </div>
            </div>

            {/* Add new assignment */}
            <div>
              <Label className="text-slate-700">Add Game</Label>
              {gamesLoading ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading games...
                </div>
              ) : getUnassignedGames().length > 0 ? (
                <Select
                  onValueChange={(appId) => {
                    if (selectedUser) {
                      assignGameMutation.mutate({ userId: selectedUser.id, gameId: appId });
                    }
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a game to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnassignedGames().map((game) => (
                      <SelectItem key={game.app_id} value={game.app_id}>
                        {game.name} ({game.app_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-2 text-sm text-slate-500">All games are already assigned</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAssignDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

