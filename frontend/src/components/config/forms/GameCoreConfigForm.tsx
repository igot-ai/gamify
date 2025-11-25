'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Switch } from '@/components/ui/switch';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { ConfigActions } from '../shared/ConfigActions';
import {
  gameCoreConfigSchema,
  type GameCoreConfig,
} from '@/lib/validations/gameCoreConfig';

const DEFAULT_CONFIG: GameCoreConfig = {
  version: '1.0.0',
  build_number: 1,
  min_supported_version: '1.0.0',
  force_update: false,
  maintenance_mode: false,
  maintenance_message: '',
};

interface GameCoreConfigFormProps {
  initialData?: GameCoreConfig;
  onSubmit: (data: GameCoreConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function GameCoreConfigForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving = false,
}: GameCoreConfigFormProps) {
  const mergedDefaults: GameCoreConfig = {
    ...DEFAULT_CONFIG,
    ...(initialData ?? {}),
    force_update: initialData?.force_update ?? DEFAULT_CONFIG.force_update,
    maintenance_mode: initialData?.maintenance_mode ?? DEFAULT_CONFIG.maintenance_mode,
    maintenance_message:
      initialData?.maintenance_message ?? DEFAULT_CONFIG.maintenance_message,
  };

  const form = useForm<GameCoreConfig>({
    resolver: zodResolver(gameCoreConfigSchema),
    defaultValues: mergedDefaults,
  });

  const hasChanges = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const handleSubmit = form.handleSubmit(onSubmit);

  const maintenanceMode = form.watch('maintenance_mode');

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ConfigFormSection
          title="Version Information"
          description="Configure game version and build information"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Version</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="1.0.0" />
                  </FormControl>
                  <FormDescription>
                    Current game version (format: X.Y.Z)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="build_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Build Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>
                    Build number for this release
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="min_supported_version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Supported Version</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="1.0.0" />
                  </FormControl>
                  <FormDescription>
                    Minimum client version allowed (format: X.Y.Z)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="force_update"
              render={({ field }) => (
                <FormItem className="switch-container">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Force Update</FormLabel>
                    <FormDescription>
                      Require users to update to continue
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </ConfigFormSection>

        <ConfigFormSection
          title="Maintenance Mode"
          description="Configure maintenance mode settings"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="maintenance_mode"
              render={({ field }) => (
                <FormItem className="switch-container">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Maintenance Mode</FormLabel>
                    <FormDescription>
                      Block access to the game for maintenance
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {maintenanceMode && (
              <FormField
                control={form.control}
                name="maintenance_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter message to display to users during maintenance..."
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Message shown to users when maintenance mode is active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </ConfigFormSection>

        <ConfigActions
          onSave={handleSubmit}
          onCancel={onCancel}
          hasChanges={hasChanges}
          isValid={isValid}
          isSaving={isSaving}
          showExport={false}
          showImport={false}
        />
      </form>
    </Form>
  );
}

