'use client';

import { useState, useSyncExternalStore } from 'react';

const VOTED_KEY = 'rankbid_voted_listings';

function readVoted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

// Same-tab change notifications (the browser 'storage' event only fires for other tabs).
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getVoterId(): string {
  let id = localStorage.getItem('rankbid_voter_id');
  if (!id) {
    id = 'voter_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('rankbid_voter_id', id);
  }
  return id;
}

function getUser(): { id: string } | null {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

/**
 * Vote state for one listing, shared by ranking rows and the product page.
 * Logged-out visitors are sent to /login and brought back afterwards.
 */
export function useVote(listingId: string) {
  const voted = useSyncExternalStore(subscribe, () => readVoted().has(listingId), () => false);
  const [busy, setBusy] = useState(false);
  const [extraVotes, setExtraVotes] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const flash = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  };

  const rememberVoted = () => {
    const set = readVoted();
    set.add(listingId);
    localStorage.setItem(VOTED_KEY, JSON.stringify([...set]));
    listeners.forEach(l => l());
  };

  const vote = async () => {
    const user = getUser();
    if (!user) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    if (voted || busy) return;

    setBusy(true);
    setExtraVotes(1);
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, voterId: getVoterId(), userId: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        rememberVoted();
        flash('Vote recorded!');
      } else if (data.error === 'Already voted') {
        setExtraVotes(0);
        rememberVoted();
        flash('You already voted');
      } else {
        setExtraVotes(0);
        flash('Vote failed, try again');
      }
    } catch {
      setExtraVotes(0);
      flash('Vote failed, try again');
    } finally {
      setBusy(false);
    }
  };

  return { voted, busy, extraVotes, message, vote };
}
