/**
 * Simple diff utility for comparing JSON objects
 */

export type DiffType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffItem {
  path: string;
  type: DiffType;
  oldValue?: any;
  newValue?: any;
}

/**
 * Deep comparison of two objects and return diff items
 */
export function compareObjects(oldObj: any, newObj: any, path = ''): DiffItem[] {
  const diffs: DiffItem[] = [];

  // Handle null/undefined cases
  if (oldObj === null || oldObj === undefined) {
    if (newObj !== null && newObj !== undefined) {
      diffs.push({
        path: path || 'root',
        type: 'added',
        newValue: newObj,
      });
    }
    return diffs;
  }

  if (newObj === null || newObj === undefined) {
    diffs.push({
      path: path || 'root',
      type: 'removed',
      oldValue: oldObj,
    });
    return diffs;
  }

  // Compare primitives
  if (typeof oldObj !== 'object' || typeof newObj !== 'object') {
    if (oldObj !== newObj) {
      diffs.push({
        path: path || 'root',
        type: 'modified',
        oldValue: oldObj,
        newValue: newObj,
      });
    }
    return diffs;
  }

  // Compare arrays
  if (Array.isArray(oldObj) || Array.isArray(newObj)) {
    if (!Array.isArray(oldObj) || !Array.isArray(newObj)) {
      diffs.push({
        path: path || 'root',
        type: 'modified',
        oldValue: oldObj,
        newValue: newObj,
      });
      return diffs;
    }

    const maxLength = Math.max(oldObj.length, newObj.length);
    for (let i = 0; i < maxLength; i++) {
      const itemPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= oldObj.length) {
        diffs.push({
          path: itemPath,
          type: 'added',
          newValue: newObj[i],
        });
      } else if (i >= newObj.length) {
        diffs.push({
          path: itemPath,
          type: 'removed',
          oldValue: oldObj[i],
        });
      } else {
        diffs.push(...compareObjects(oldObj[i], newObj[i], itemPath));
      }
    }
    return diffs;
  }

  // Compare objects
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const itemPath = path ? `${path}.${key}` : key;
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    if (!(key in oldObj)) {
      diffs.push({
        path: itemPath,
        type: 'added',
        newValue: newValue,
      });
    } else if (!(key in newObj)) {
      diffs.push({
        path: itemPath,
        type: 'removed',
        oldValue: oldValue,
      });
    } else {
      diffs.push(...compareObjects(oldValue, newValue, itemPath));
    }
  }

  return diffs;
}

/**
 * Format a value for display
 */
export function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/**
 * Get a simplified diff summary
 */
export function getDiffSummary(diffs: DiffItem[]): {
  added: number;
  removed: number;
  modified: number;
} {
  return {
    added: diffs.filter((d) => d.type === 'added').length,
    removed: diffs.filter((d) => d.type === 'removed').length,
    modified: diffs.filter((d) => d.type === 'modified').length,
  };
}

