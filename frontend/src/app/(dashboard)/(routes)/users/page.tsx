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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
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

  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
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
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
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
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                    <TableCell className="text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                            setUserToDelete(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <UserX className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      {users.length === 0 ? 'No users found' : 'No users match your search.'}
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
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogTitle className="sr-only">Edit User</DialogTitle>
          {/* Header with avatar */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b px-6 py-5 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg shadow-blue-500/20">
                {formData.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{formData.name || 'Edit User'}</h2>
                <p className="text-sm text-slate-500">{formData.email || 'Update user details'}</p>
              </div>
            </div>
          </div>

          <form id="edit-user-form" onSubmit={handleUpdateUser} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Basic Info Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game_operator">
                      <span className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-blue-500" />
                        Game Operator
                      </span>
                    </SelectItem>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        Admin
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-xs font-medium text-slate-500 uppercase tracking-wide">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current"
                minLength={6}
                className="h-11"
              />
            </div>

            {/* Game Assignments - Only show for game_operator role */}
            {formData.role === 'game_operator' && (
              <div className="space-y-3 pt-4 border-t border-dashed">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Game Access
                  </Label>
                  <span className="text-xs text-slate-400">
                    {selectedUser?.assigned_games?.length || 0} assigned
                  </span>
                </div>
                
                {/* Current assignments as list */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden">
                  {selectedUser?.assigned_games && selectedUser.assigned_games.length > 0 ? (
                    <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-100">
                      {selectedUser.assigned_games.map((game) => (
                        <div
                          key={game.app_id}
                          className="flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                              <Gamepad2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-medium text-sm text-slate-700 truncate">{game.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGameMutation.mutate({
                              userId: selectedUser.id,
                              gameId: game.app_id,
                            })}
                            disabled={removeGameMutation.isPending}
                            className="p-1.5 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <Gamepad2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span className="text-sm text-slate-400">No games assigned yet</span>
                    </div>
                  )}
                </div>

                {/* Add new assignment */}
                {gamesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading games...
                  </div>
                ) : getUnassignedGames().length > 0 && (
                  <Select
                    onValueChange={(appId) => {
                      if (selectedUser) {
                        assignGameMutation.mutate({ userId: selectedUser.id, gameId: appId });
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white border-dashed hover:border-solid hover:border-blue-300 transition-colors">
                      <SelectValue placeholder="+ Add game access..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getUnassignedGames().map((game) => (
                        <SelectItem key={game.app_id} value={game.app_id}>
                          <span className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-slate-400" />
                            {game.name}
                            <span className="text-slate-400">({game.app_id})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

          </form>

          {/* Footer - fixed at bottom */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-white flex-shrink-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsEditDialogOpen(false)}
              className="px-5"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              form="edit-user-form"
              disabled={updateUserMutation.isPending}
              className="px-5 bg-slate-900 hover:bg-slate-800"
            >
              {updateUserMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (userToDelete) {
                  deleteUserMutation.mutate(userToDelete.id);
                }
              }}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

