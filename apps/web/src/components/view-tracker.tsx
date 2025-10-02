'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  username: string;
}

export function ViewTracker({ username }: ViewTrackerProps) {
  useEffect(() => {
    // Track view (solo una vez por sesión)
    if (typeof window === 'undefined') return;

    const tracked = window.sessionStorage.getItem(`viewed_${username}`);

    if (!tracked) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/profiles/username/${username}/view`,
        {
          method: 'POST',
        }
      )
        .then(() => {
          window.sessionStorage.setItem(`viewed_${username}`, 'true');
        })
        .catch(() => {
          // Silently fail
        });
    }
  }, [username]);

  return null;
}
