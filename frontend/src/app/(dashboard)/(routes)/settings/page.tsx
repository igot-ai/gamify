'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { toast } from 'sonner';
import { User, Save, Loader2, Shield, Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'game_operator';
  assigned_game_ids: string[];
}

interface ProfileUpdate {
  name?: string;
  password?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { checkAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });

  // Fetch current user data
  const { data: currentUser, isLoading } = useQuery<CurrentUser>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [currentUser]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdate) => {
      const response = await apiClient.patch('/auth/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data);
      checkAuth(); // Refresh auth store
      toast.success('Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match if password is provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const updateData: ProfileUpdate = {
      name: formData.name,
    };

    // Only include password if it's provided
    if (formData.password) {
      updateData.password = formData.password;
    }

    updateProfileMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Basic information about your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={currentUser?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant={currentUser?.role === 'admin' ? 'default' : 'secondary'}>
                  {currentUser?.role === 'admin' ? (
                    <><Shield className="w-3 h-3 mr-1" /> Admin</>
                  ) : (
                    <><Gamepad2 className="w-3 h-3 mr-1" /> Game Operator</>
                  )}
                </Badge>
              </div>
            </div>

            {currentUser?.assigned_game_ids && currentUser.assigned_game_ids.length > 0 && (
              <div className="grid gap-2">
                <Label>Assigned Games</Label>
                <p className="text-sm text-muted-foreground">
                  {currentUser.assigned_game_ids.length} {currentUser.assigned_game_ids.length === 1 ? 'game' : 'games'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>Change your display name or password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter display name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if you don't want to change your password
                </p>
              </div>

              {formData.password && (
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    minLength={6}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

