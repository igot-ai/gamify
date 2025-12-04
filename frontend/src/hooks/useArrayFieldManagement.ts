'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFieldArray, FieldValues, Path, UseFormReturn, ArrayPath, FieldArray } from 'react-hook-form';

interface UseArrayFieldManagementOptions<
  TFormValues extends FieldValues,
  TFieldName extends ArrayPath<TFormValues>,
  TItem extends FieldArray<TFormValues, TFieldName>
> {
  form: UseFormReturn<TFormValues>;
  fieldName: TFieldName;
  createDefaultItem: (fieldsLength: number) => TItem;
  onSave?: (data: TItem[]) => void;
}

interface UseArrayFieldManagementReturn<
  TFormValues extends FieldValues,
  TFieldName extends ArrayPath<TFormValues>,
  TItem extends FieldArray<TFormValues, TFieldName>
> {
  fields: ReturnType<typeof useFieldArray<TFormValues, TFieldName>>['fields'];
  expandedIndex: number | null;
  originalData: TItem[];
  currentData: TItem[];
  handleAdd: () => void;
  handleClearAll: () => void;
  handleRemove: (index: number) => void;
  toggleExpanded: (index: number) => void;
  handleSave: () => void;
  handleJsonChange: (data: TItem[]) => void;
}

/**
 * Custom hook to manage array field operations with common patterns:
 * - Expansion state management (accordion-like behavior)
 * - Original data tracking for diff comparison
 * - CRUD operations (add, remove, clear all)
 * - JSON editor integration
 * - Save functionality with original data update
 */
export function useArrayFieldManagement<
  TFormValues extends FieldValues,
  TFieldName extends ArrayPath<TFormValues>,
  TItem extends FieldArray<TFormValues, TFieldName>
>({
  form,
  fieldName,
  createDefaultItem,
  onSave,
}: UseArrayFieldManagementOptions<TFormValues, TFieldName, TItem>): UseArrayFieldManagementReturn<TFormValues, TFieldName, TItem> {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<TItem[]>([]);
  const initializedRef = useRef(false);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: fieldName,
  });

  // Watch current data
  const currentData = form.watch(fieldName as unknown as Path<TFormValues>) as TItem[] | undefined;

  // Store original data on initial load for diff comparison
  useEffect(() => {
    if (!initializedRef.current && currentData && Array.isArray(currentData)) {
      setOriginalData(JSON.parse(JSON.stringify(currentData)) as TItem[]);
      initializedRef.current = true;
    }
  }, [currentData]);

  const handleAdd = useCallback(() => {
    const newItem = createDefaultItem(fields.length);
    append(newItem as FieldArray<TFormValues, TFieldName>);
    setExpandedIndex(fields.length);
  }, [fields.length, createDefaultItem, append]);

  const handleClearAll = useCallback(() => {
    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }
    setExpandedIndex(null);
  }, [fields.length, remove]);

  const handleRemove = useCallback((index: number) => {
    remove(index);
    setExpandedIndex((prev) => {
      if (prev === index) return null;
      if (prev !== null && prev > index) return prev - 1;
      return prev;
    });
  }, [remove]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      const dataToSave = (currentData || []) as TItem[];
      onSave(dataToSave);
      // Update original data after save
      setOriginalData(JSON.parse(JSON.stringify(dataToSave)) as TItem[]);
    }
  }, [onSave, currentData]);

  const handleJsonChange = useCallback((data: TItem[]) => {
    if (Array.isArray(data)) {
      replace(data as FieldArray<TFormValues, TFieldName>[]);
    }
  }, [replace]);

  return {
    fields,
    expandedIndex,
    originalData,
    currentData: (currentData || []) as TItem[],
    handleAdd,
    handleClearAll,
    handleRemove,
    toggleExpanded,
    handleSave,
    handleJsonChange,
  };
}

