'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { ConfigActions } from '../shared/ConfigActions';
import {
  chapterRewardConfigSchema,
  type ChapterRewardConfig,
} from '@/lib/validations/chapterRewardConfig';

interface ChapterRewardConfigFormProps {
  initialData?: ChapterRewardConfig;
  onSubmit: (data: ChapterRewardConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function ChapterRewardConfigForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving = false,
}: ChapterRewardConfigFormProps) {
  const form = useForm<ChapterRewardConfig>({
    resolver: zodResolver(chapterRewardConfigSchema),
    defaultValues: initialData || {
      undo: 1,
      hint: 1,
      shuffle: 1,
    },
  });

  const hasChanges = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ConfigFormSection
          title="Chapter Completion Rewards"
          description="Configure rewards given when players complete a chapter"
          defaultOpen={true}
          collapsible={false}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="undo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Undo Boosters</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of Undo boosters to reward
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hint Boosters</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of Hint boosters to reward
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shuffle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shuffle Boosters</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of Shuffle boosters to reward
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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

