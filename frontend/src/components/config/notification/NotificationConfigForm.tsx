'use client';

import * as React from 'react';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Trash2,
  ChevronDown,
  X,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/Badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import {
  notificationConfigSchema,
  type NotificationConfig,
  type NotificationChannel,
  type NotificationStrategy,
  type NotificationMessage,
  defaultNotificationConfig,
  defaultChannel,
  defaultStrategy,
  defaultMessage,
} from '@/lib/validations/notificationConfig';

interface NotificationConfigFormProps {
  initialData?: NotificationConfig;
  onSubmit: (data: NotificationConfig) => void;
  onChange?: (data: NotificationConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface NotificationConfigFormRef {
  getData: () => NotificationConfig;
  reset: (data: NotificationConfig) => void;
}

// Importance level labels
const importanceLevels = [
  { value: 1, label: 'Low' },
  { value: 3, label: 'Default' },
  { value: 4, label: 'High' },
];

// Lock screen visibility labels
const visibilityLevels = [
  { value: 1, label: 'Public' },
  { value: 0, label: 'Private' },
  { value: -1, label: 'Secret' },
];

// Repeat policy options
const repeatPolicyOptions = [
  { value: 0, label: 'None' },
  { value: 2, label: 'Daily' },
];

// Scheduling mode options
const schedulingModeOptions = [
  { value: 0, label: 'Random' },
  { value: 1, label: 'Sequential' },
];

export const NotificationConfigForm = forwardRef<NotificationConfigFormRef, NotificationConfigFormProps>(
  function NotificationConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    const [expandedChannel, setExpandedChannel] = useState<number | null>(null);
    const [expandedStrategy, setExpandedStrategy] = useState<number | null>(null);
    const [originalData, setOriginalData] = useState<NotificationConfig | undefined>();
    const initializedRef = React.useRef(false);

    // Merge initial data with defaults
    const mergedDefaults: NotificationConfig = {
      ...defaultNotificationConfig,
      ...initialData,
      channels: initialData?.channels?.length ? initialData.channels : defaultNotificationConfig.channels,
      strategies: initialData?.strategies || [],
    };

    const form = useForm<NotificationConfig>({
      resolver: zodResolver(notificationConfigSchema) as any,
      defaultValues: mergedDefaults,
    });

    // Field arrays for channels and strategies
    const {
      fields: channelFields,
      append: appendChannel,
      remove: removeChannel,
      replace: replaceChannels,
    } = useFieldArray({
      control: form.control,
      name: 'channels',
    });

    const {
      fields: strategyFields,
      append: appendStrategy,
      remove: removeStrategy,
      replace: replaceStrategies,
    } = useFieldArray({
      control: form.control,
      name: 'strategies',
    });

    React.useEffect(() => {
      if (initialData) {
        setOriginalData(JSON.parse(JSON.stringify(initialData)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    const isValid = form.formState.isValid;
    const handleSubmit = form.handleSubmit(onSubmit);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: NotificationConfig) => {
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
        // Also replace field arrays to sync useFieldArray state
        if (data.channels) {
          replaceChannels(data.channels);
        }
        if (data.strategies) {
          replaceStrategies(data.strategies);
        }
      },
    }));

    // Watch for changes and notify parent
    React.useEffect(() => {
      const subscription = form.watch((data) => {
        if (onChange) {
          onChange(data as NotificationConfig);
        }
      });
      return () => subscription.unsubscribe();
    }, [form, onChange]);

    // Channel handlers
    const handleAddChannel = () => {
      const newChannel: NotificationChannel = {
        ...defaultChannel,
        id: `channel_${channelFields.length + 1}`,
        name: `Channel ${channelFields.length + 1}`,
      };
      appendChannel(newChannel);
      setExpandedChannel(channelFields.length);
    };

    const handleRemoveChannel = (index: number) => {
      removeChannel(index);
      if (expandedChannel === index) {
        setExpandedChannel(null);
      } else if (expandedChannel !== null && expandedChannel > index) {
        setExpandedChannel(expandedChannel - 1);
      }
    };

    const handleClearAllChannels = () => {
      for (let i = channelFields.length - 1; i >= 0; i--) {
        removeChannel(i);
      }
      setExpandedChannel(null);
    };

    // Strategy handlers
    const handleAddStrategy = () => {
      const channels = form.getValues('channels');
      const defaultChanId = channels.length > 0 ? channels[0].id : 'default_channel';
      
      const newStrategy: NotificationStrategy = {
        ...defaultStrategy,
        id: `strategy_${strategyFields.length + 1}`,
        name: `Strategy ${strategyFields.length + 1}`,
        defaultChannelId: defaultChanId,
      };
      appendStrategy(newStrategy);
      setExpandedStrategy(strategyFields.length);
    };

    const handleRemoveStrategy = (index: number) => {
      removeStrategy(index);
      if (expandedStrategy === index) {
        setExpandedStrategy(null);
      } else if (expandedStrategy !== null && expandedStrategy > index) {
        setExpandedStrategy(expandedStrategy - 1);
      }
    };

    const handleClearAllStrategies = () => {
      for (let i = strategyFields.length - 1; i >= 0; i--) {
        removeStrategy(i);
      }
      setExpandedStrategy(null);
    };

    // Get channel options for strategy dropdown
    const getChannelOptions = () => {
      const channels = form.watch('channels');
      return channels.map((c) => ({
        value: c.id,
        label: `${c.id} - ${c.name}`,
      }));
    };

    return (
      <Form {...form}>
        <FormWithJsonTabs formData={form.watch()} originalData={originalData} onJsonChange={(data) => {
          form.reset(data);
          if (data.channels) replaceChannels(data.channels);
          if (data.strategies) replaceStrategies(data.strategies);
        }}>
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: General Settings */}
          <ConfigFormSection
            title="General Settings"
            description="Configure core notification behavior."
            defaultOpen={true}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Notifications</FormLabel>
                      <FormDescription>
                        Enable or disable the notification system
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

          {/* Section 2: Notification Channels */}
          <ConfigFormSection
            title={`Notification Channels (${channelFields.length})`}
            description="Platform-specific channel settings for Android notifications."
            defaultOpen={true}
            headerActions={
              <div className="flex items-center gap-2">
                {channelFields.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllChannels}
                    className="gap-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddChannel}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Channel
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              {channelFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                  <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm">No channels configured</p>
                  <p className="text-xs mt-1">Click "Add Channel" to get started</p>
                </div>
              ) : (
                channelFields.map((field, index) => {
                  const channel = form.watch(`channels.${index}`);
                  const isExpanded = expandedChannel === index;

                  return (
                    <Collapsible
                      key={field.id}
                      open={isExpanded}
                      onOpenChange={() => setExpandedChannel(isExpanded ? null : index)}
                    >
                      <div
                        className={cn(
                          'rounded-lg border transition-all duration-200',
                          isExpanded
                            ? 'border-primary/70 bg-card shadow-stripe-md'
                            : 'border-border/80 bg-card/50 hover:border-border hover:shadow-stripe-sm'
                        )}
                      >
                        {/* Collapsed Header */}
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <ChevronDown
                                className={cn(
                                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                                  isExpanded && 'rotate-180'
                                )}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {channel?.name || 'Unnamed'} ({channel?.id || 'no-id'})
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                Importance: {importanceLevels.find(l => l.value === channel?.importance)?.label || channel?.importance}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveChannel(index);
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CollapsibleTrigger>

                        {/* Expanded Content */}
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`channels.${index}.id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ID</FormLabel>
                                    <FormControl>
                                      <Input placeholder="channel_id" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`channels.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Channel Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`channels.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Channel description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Platform Defaults */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-muted-foreground">Platform Defaults</h4>
                              <div className="flex items-center gap-4">
                                <FormField
                                  control={form.control}
                                  name={`channels.${index}.defaultBadge`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel>Default Badge</FormLabel>
                                      <div className="flex items-center gap-2">
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min={0}
                                            className="w-20"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                          />
                                        </FormControl>
                                        <div className="flex gap-1">
                                          {[0, 1, 5, 10].map((val) => (
                                            <Button
                                              key={val}
                                              type="button"
                                              variant={field.value === val ? 'default' : 'outline'}
                                              size="sm"
                                              className="h-8 px-2 text-xs"
                                              onClick={() => field.onChange(val)}
                                            >
                                              {val === 0 ? 'None' : val}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Android Settings */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-muted-foreground">Android Settings</h4>
                              
                              {/* Importance Level */}
                              <FormField
                                control={form.control}
                                name={`channels.${index}.importance`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Importance Level</FormLabel>
                                    <div className="flex gap-1">
                                      {importanceLevels.map((level) => (
                                        <Button
                                          key={level.value}
                                          type="button"
                                          variant={field.value === level.value ? 'default' : 'outline'}
                                          size="sm"
                                          className="flex-1 h-9"
                                          onClick={() => field.onChange(level.value)}
                                        >
                                          {level.label}
                                        </Button>
                                      ))}
                                    </div>
                                    <FormDescription className="text-xs">
                                      {field.value === 1 && 'Low priority - no sound or peek'}
                                      {field.value === 3 && 'Default priority - normal sound and peek behavior'}
                                      {field.value === 4 && 'High priority - makes sound and appears as heads-up'}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Behavior Settings */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`channels.${index}.enableLights`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">Enable Lights</FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`channels.${index}.enableVibration`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">Enable Vibration</FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`channels.${index}.canBypassDnd`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">Bypass DND</FormLabel>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`channels.${index}.canShowBadge`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">Show Badge</FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>

                              {/* Lock Screen Visibility */}
                              <FormField
                                control={form.control}
                                name={`channels.${index}.lockScreenVisibility`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lock Screen Visibility</FormLabel>
                                    <div className="flex gap-1">
                                      {visibilityLevels.map((level) => (
                                        <Button
                                          key={level.value}
                                          type="button"
                                          variant={field.value === level.value ? 'default' : 'outline'}
                                          size="sm"
                                          className="flex-1 h-9"
                                          onClick={() => field.onChange(level.value)}
                                        >
                                          {level.label}
                                        </Button>
                                      ))}
                                    </div>
                                    <FormDescription className="text-xs">
                                      {field.value === 1 && 'Show all notification content on lock screen'}
                                      {field.value === 0 && 'Show limited content on lock screen'}
                                      {field.value === -1 && 'Do not show any content on lock screen'}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })
              )}
            </div>
          </ConfigFormSection>

          {/* Section 3: Strategies */}
          <ConfigFormSection
            title={`Notification Strategies (${strategyFields.length})`}
            description="Define when and what notifications to send."
            defaultOpen={true}
            headerActions={
              <div className="flex items-center gap-2">
                {strategyFields.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllStrategies}
                    className="gap-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStrategy}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Strategy
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              {strategyFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm">No strategies configured</p>
                  <p className="text-xs mt-1">Click "Add Strategy" to get started</p>
                </div>
              ) : (
                strategyFields.map((field, index) => (
                  <StrategyItem
                    key={field.id}
                    index={index}
                    form={form}
                    isExpanded={expandedStrategy === index}
                    onToggle={() => setExpandedStrategy(expandedStrategy === index ? null : index)}
                    onRemove={() => handleRemoveStrategy(index)}
                    channelOptions={getChannelOptions()}
                  />
                ))
              )}
            </div>
          </ConfigFormSection>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || isSaving}
              className="shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          </form>
        </FormWithJsonTabs>
      </Form>
    );
  }
);

// Strategy Item Component
interface StrategyItemProps {
  index: number;
  form: ReturnType<typeof useForm<NotificationConfig>>;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  channelOptions: { value: string; label: string }[];
}

function StrategyItem({ index, form, isExpanded, onToggle, onRemove, channelOptions }: StrategyItemProps) {
  const strategy = form.watch(`strategies.${index}`);
  const mode = form.watch(`strategies.${index}.mode`);

  // Nested field array for notifications within this strategy
  const {
    fields: notificationFields,
    append: appendNotification,
    remove: removeNotification,
  } = useFieldArray({
    control: form.control,
    name: `strategies.${index}.notifications`,
  });

  const handleAddNotification = () => {
    const newNotification: NotificationMessage = {
      ...defaultMessage,
      title: `NOTIFICATION_${index + 1}_${notificationFields.length + 1}_T`,
      body: `NOTIFICATION_${index + 1}_${notificationFields.length + 1}_B`,
    };
    appendNotification(newNotification);
  };

  // Format delay seconds to human-readable
  const formatDelay = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        className={cn(
          'rounded-lg border transition-all duration-200',
          isExpanded
            ? 'border-primary/70 bg-card shadow-stripe-md'
            : 'border-border/80 bg-card/50 hover:border-border hover:shadow-stripe-sm'
        )}
      >
        {/* Collapsed Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  strategy?.active ? 'bg-green-500' : 'bg-muted-foreground'
                )}
              />
              <span className="text-sm font-medium text-foreground">
                {strategy?.name || 'Unnamed'} ({strategy?.id || 'no-id'})
              </span>
              {strategy?.autoScheduled && (
                <Badge variant="secondary" className="text-xs">AUTO</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {mode === 0 ? 'Delay' : 'Fixed Time'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={strategy?.active ? 'default' : 'secondary'}>
                {strategy?.active ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`strategies.${index}.id`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID</FormLabel>
                    <FormControl>
                      <Input placeholder="strategy_id" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`strategies.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Strategy Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mode Selection */}
            <FormField
              control={form.control}
              name={`strategies.${index}.mode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={field.value === 0 ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => field.onChange(0)}
                    >
                      Delay
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 1 ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => field.onChange(1)}
                    >
                      Fixed Time
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mode-specific settings */}
            {mode === 0 ? (
              <FormField
                control={form.control}
                name={`strategies.${index}.delaySeconds`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      = {formatDelay(field.value)} after trigger
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4 p-3 rounded-lg bg-muted/20 border border-border/30">
                <h4 className="text-sm font-medium">Fixed Time Settings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`strategies.${index}.fixedHour`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hour (0-23)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={23}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`strategies.${index}.fixedMinute`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minute (0-59)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`strategies.${index}.fixedDaysOffset`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days Offset</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Auto Scheduled & Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`strategies.${index}.active`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Active</FormLabel>
                      <FormDescription className="text-xs">
                        Enable this strategy
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
              <FormField
                control={form.control}
                name={`strategies.${index}.autoScheduled`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Auto Scheduled</FormLabel>
                      <FormDescription className="text-xs">
                        Include in auto-scheduling
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

            {/* Scheduling Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`strategies.${index}.repeatPolicy`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat Policy</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {repeatPolicyOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
name={`strategies.${index}.schedulingMode`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduling Mode</FormLabel>
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schedulingModeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
              />
              <FormField
                control={form.control}
                name={`strategies.${index}.defaultChannelId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Channel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Notifications ({notificationFields.length})
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNotification}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              {notificationFields.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                  <p className="text-xs">No notifications. Add at least one.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notificationFields.map((notifField, notifIndex) => (
                    <div
                      key={notifField.id}
                      className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Notification {notifIndex + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notifIndex)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          disabled={notificationFields.length <= 1}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`strategies.${index}.notifications.${notifIndex}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Title (Key)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="TITLE_KEY"
                                  className="h-8 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`strategies.${index}.notifications.${notifIndex}.body`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Body (Key)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="BODY_KEY"
                                  className="h-8 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`strategies.${index}.notifications.${notifIndex}.offsetSeconds`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Offset (seconds)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-8 text-sm"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}


