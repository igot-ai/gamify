'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Map URL path to section type path
const sectionTypePaths: Record<string, string> = {
  'economy': 'economy',
  'ads': 'ads',
  'notification': 'notification',
  'shop': 'shop',
  'booster': 'booster',
  'chapter-reward': 'chapter-reward',
  'game-core': 'game-core',
  'analytics': 'analytics',
  'ux': 'ux',
};

/**
 * This page redirects to the main section editor.
 * The section editor now handles version selection internally.
 */
export default function SectionConfigViewPage() {
  const params = useParams();
  const router = useRouter();
  
  const sectionTypePath = params?.sectionType as string;

  useEffect(() => {
    // Redirect to the main section page
    if (sectionTypePath && sectionTypePaths[sectionTypePath]) {
      router.replace(`/sections/${sectionTypePath}`);
    }
  }, [sectionTypePath, router]);

  return (
    <div className="p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
