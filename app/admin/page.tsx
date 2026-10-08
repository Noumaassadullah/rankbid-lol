'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown, ArrowUp, ChevronDown, ChevronRight, ExternalLink, FileText, LogOut, Minus,
  RefreshCw, Search, Trash2, TrendingUp, Trophy, UserPlus, Users, Zap,
} from 'lucide-react';

// ---- Types (mirror lib/server/admin.ts) ----

interface AdminListing {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  platform: string;
  imageUrl: string | null;
  totalVotes: number;
  dayVotes: number;
  views: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: { email: string; name: string | null } | null;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  submissions: number;
  submissionVotes: number;
}

interface LiveSnapshot {
  generatedAt: string;
  stats: {
    totalUsers: number;
    totalListings: number;
    totalVotes: number;
    submissionsToday: number;
    votesToday: number;
    usersToday: number;
  };
  leaderboard: AdminListing[];
  todayLeaderboard: AdminListing[];
  recentSubmissions: AdminListing[];
}

interface Pagination { total: number; page: number; limit: number; pages: number }

type Tab = 'live' | 'submissions' | 'users';
type ConnState = 'connecting' | 'live' | 'reconnecting';
type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };

// ---- Helpers ----

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

const fmt = (n: number) => n.toLocaleString();

async function removeListings(ids: string[]): Promise<string[]> {
  const res = await fetch('/api/admin/listings', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingIds: ids }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to remove');
  return (await res.json()).removed as string[];
}

// ---- Live feed hook ----

/** Subscribes to /api/admin/live and tracks rank movement + newly arrived submissions. */
function useLiveFeed(enabled: boolean, onNewSubmissions: (listings: AdminListing[]) => void) {
  const [snapshot, setSnapshot] = useState<LiveSnapshot | null>(null);
  const [conn, setConn] = useState<ConnState>('connecting');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [rankDelta, setRankDelta] = useState<Record<string, number | 'new'>>({});
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const prev = useRef<LiveSnapshot | null>(null);
  const onNew = useRef(onNewSubmissions);
  useEffect(() => { onNew.current = onNewSubmissions; });

  useEffect(() => {
    if (!enabled) return;
    const es = new EventSource('/api/admin/live');

    es.addEventListener('open', () => setConn('live'));
    es.addEventListener('error', () => setConn('reconnecting'));
    es.addEventListener('ping', (e) => {
      setConn('live');
      setLastUpdate(JSON.parse((e as MessageEvent).data).generatedAt);
    });
    es.addEventListener('snapshot', (e) => {
      const next: LiveSnapshot = JSON.parse((e as MessageEvent).data);
      const before = prev.current;
      setConn('live');
      setLastUpdate(next.generatedAt);

      if (before) {
        // Rank movement on the all-time board: positive = moved up.
        const oldRank = new Map(before.leaderboard.map((l, i) => [l.id, i]));
        const deltas: Record<string, number | 'new'> = {};
        next.leaderboard.forEach((l, i) => {
          const was = oldRank.get(l.id);
          deltas[l.id] = was === undefined ? 'new' : was - i;
        });
        setRankDelta((d) => {
          // Keep the last real movement until the listing moves again.
          const merged = { ...d };
          for (const [id, v] of Object.entries(deltas)) if (v !== 0) merged[id] = v;
          return merged;
        });

        // New = not in the previous list and created around/after the previous check (an older
        // listing can slide into the list when a newer one is removed; that isn't a new submission).
        const seen = new Set(before.recentSubmissions.map((l) => l.id));
        const cutoff = new Date(before.generatedAt).getTime() - 60_000;
        const arrived = next.recentSubmissions.filter((l) => !seen.has(l.id) && new Date(l.createdAt).getTime() > cutoff);
        if (arrived.length > 0) {
          onNew.current(arrived);
          setFreshIds((s) => new Set([...s, ...arrived.map((l) => l.id)]));
          setTimeout(() => {
            setFreshIds((s) => {
              const copy = new Set(s);
              arrived.forEach((l) => copy.delete(l.id));
              return copy;
            });
          }, 15_000);
        }
      }
      prev.current = next;
      setSnapshot(next);
    });

    return () => es.close();
  }, [enabled]);

  /** Drop removed listings from the current view right away instead of waiting for the next push. */
  const dropListings = useCallback((ids: string[]) => {
    const gone = new Set(ids);
    setSnapshot((s) => {
      if (!s) return s;
      const next = {
        ...s,
        leaderboard: s.leaderboard.filter((l) => !gone.has(l.id)),
        todayLeaderboard: s.todayLeaderboard.filter((l) => !gone.has(l.id)),
        recentSubmissions: s.recentSubmissions.filter((l) => !gone.has(l.id)),
      };
      prev.current = next;
      return next;
    });
  }, []);

  return { snapshot, conn, lastUpdate, rankDelta, freshIds, dropListings };
}

// ---- Page ----

export default function AdminPage() {
  const [authState, setAuthState] = useState<'checking' | 'signed-out' | 'admin'>('checking');
  const [tab, setTab] = useState<Tab>('live');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setAuthState(d.admin ? 'admin' : 'signed-out'))
      .catch(() => setAuthState('signed-out'));
  }, []);

  const live = useLiveFeed(authState === 'admin', (arrived) => {
    arrived.forEach((l) => toast(`New submission: ${l.title}`, 'info'));
  });

  const handleRemove = useCallback(async (ids: string[], label: string): Promise<boolean> => {
    if (!confirm(`Remove ${label}? This deletes the submission and all of its votes. It cannot be undone.`)) return false;
    try {
      const removed = await removeListings(ids);
      live.dropListings(removed);
      toast(removed.length === 1 ? 'Submission removed' : `${removed.length} submissions removed`, 'success');
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to remove', 'error');
      return false;
    }
  }, [live, toast]);

  const signOut = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setAuthState('signed-out');
  };

  if (authState === 'checking') {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">Checking access…</div>;
  }

  if (authState === 'signed-out') {
    return <AdminLogin onSuccess={() => setAuthState('admin')} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-[#1F2937]">
      <header className="bg-[#0F3460] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
            <ConnectionBadge conn={live.conn} lastUpdate={live.lastUpdate} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={signOut} className="px-3 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-1.5">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <nav className="flex gap-2 mb-6 overflow-x-auto">
          {([
            ['live', 'Live overview'],
            ['submissions', 'Submissions'],
            ['users', 'Users'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 font-bold rounded-lg transition-colors whitespace-nowrap ${
                tab === key ? 'bg-[#0F3460] text-white' : 'bg-white hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'live' && <LiveTab live={live} onRemove={handleRemove} />}
        {tab === 'submissions' && (
          <SubmissionsTab onRemove={handleRemove} liveVersion={live.snapshot?.generatedAt} toast={toast} />
        )}
        {tab === 'users' && <UsersTab onRemove={handleRemove} liveVersion={live.snapshot?.generatedAt} toast={toast} />}
      </main>

      <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg font-bold text-sm shadow-lg ${
              t.type === 'success' ? 'bg-green-100 text-green-800' : t.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Login ----

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) onSuccess();
    else setError('Wrong password.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F3460] to-[#1a5490] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-black text-[#1F2937] mb-2">Admin Access</h1>
        <p className="text-[#1F2937]/60 mb-6">
          Enter the admin password, or <Link href="/login" className="underline font-semibold">sign in</Link> with an admin account.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460] text-[#1F2937]"
            required
            autoFocus
          />
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-6 py-3 bg-[#0F3460] text-white font-bold rounded-lg hover:bg-[#0D2A50] transition-colors disabled:opacity-60"
          >
            {busy ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- Shared bits ----

function ConnectionBadge({ conn, lastUpdate }: { conn: ConnState; lastUpdate: string | null }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const label = conn === 'live' ? 'Live' : conn === 'connecting' ? 'Connecting' : 'Reconnecting';
  return (
    <span className="flex items-center gap-2 text-xs font-bold bg-white/10 rounded-full px-3 py-1">
      <span className="relative flex h-2.5 w-2.5">
        {conn === 'live' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${conn === 'live' ? 'bg-green-400' : 'bg-yellow-400'}`} />
      </span>
      {label}
      {lastUpdate && conn === 'live' && <span className="font-normal opacity-70">· checked {timeAgo(lastUpdate)}</span>}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: number | undefined; sub?: string; icon: typeof Users }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-black text-[#0F3460] tabular-nums">{value === undefined ? '—' : fmt(value)}</p>
        {sub && <p className="text-xs text-green-700 font-semibold mt-1">{sub}</p>}
      </div>
      <Icon className="w-10 h-10 text-[#0F3460]/20" />
    </div>
  );
}

function RankMove({ delta }: { delta: number | 'new' | undefined }) {
  if (delta === 'new') return <span className="text-[10px] font-black text-blue-600 bg-blue-50 rounded px-1">NEW</span>;
  if (!delta) return <Minus className="w-3.5 h-3.5 text-gray-300" />;
  return delta > 0 ? (
    <span className="flex items-center text-green-600 text-xs font-bold"><ArrowUp className="w-3.5 h-3.5" />{delta}</span>
  ) : (
    <span className="flex items-center text-red-500 text-xs font-bold"><ArrowDown className="w-3.5 h-3.5" />{-delta}</span>
  );
}

function RemoveButton({ onClick, label = 'Remove' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      title="Remove submission"
      className="px-2.5 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-bold flex items-center gap-1"
    >
      <Trash2 className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function ListingTitle({ listing }: { listing: AdminListing }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {listing.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={listing.imageUrl} alt="" className="w-7 h-7 rounded object-cover bg-gray-100 shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded bg-gray-100 shrink-0" />
      )}
      <div className="min-w-0">
        <Link href={`/product/${listing.id}`} target="_blank" className="font-semibold hover:underline line-clamp-1 break-all">
          {listing.title}
        </Link>
        <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline flex items-center gap-1 truncate">
          <span className="truncate">{listing.url}</span> <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      </div>
    </div>
  );
}

// ---- Live tab ----

function LiveTab({
  live,
  onRemove,
}: {
  live: ReturnType<typeof useLiveFeed>;
  onRemove: (ids: string[], label: string) => Promise<boolean>;
}) {
  const s = live.snapshot;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total users" value={s?.stats.totalUsers} sub={s ? `+${fmt(s.stats.usersToday)} today` : undefined} icon={Users} />
        <StatCard label="Total submissions" value={s?.stats.totalListings} sub={s ? `+${fmt(s.stats.submissionsToday)} today` : undefined} icon={FileText} />
        <StatCard label="Total votes" value={s?.stats.totalVotes} sub={s ? `+${fmt(s.stats.votesToday)} today` : undefined} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Live ranking · all time</h2>
          {!s ? (
            <p className="text-gray-500 py-6 text-center">Loading…</p>
          ) : s.leaderboard.length === 0 ? (
            <p className="text-gray-500 py-6 text-center">No submissions yet</p>
          ) : (
            <ol className="divide-y">
              {s.leaderboard.map((l, i) => (
                <li key={l.id} className="py-2.5 flex items-center gap-3">
                  <span className="w-6 text-right font-black text-[#0F3460] tabular-nums">{i + 1}</span>
                  <span className="w-8 flex justify-center"><RankMove delta={live.rankDelta[l.id]} /></span>
                  <div className="flex-1 min-w-0"><ListingTitle listing={l} /></div>
                  <span className="text-right tabular-nums">
                    <span className="font-black">{fmt(l.totalVotes)}</span>
                    <span className="block text-[11px] text-gray-500">+{fmt(l.dayVotes)} today</span>
                  </span>
                  <RemoveButton label="" onClick={() => onRemove([l.id], `"${l.title}"`)} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" /> Today&apos;s ranking</h2>
          {!s ? (
            <p className="text-gray-500 py-6 text-center">Loading…</p>
          ) : s.todayLeaderboard.length === 0 ? (
            <p className="text-gray-500 py-6 text-center">No votes yet today</p>
          ) : (
            <ol className="divide-y">
              {s.todayLeaderboard.map((l, i) => (
                <li key={l.id} className="py-2.5 flex items-center gap-3">
                  <span className="w-6 text-right font-black text-[#0F3460] tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0"><ListingTitle listing={l} /></div>
                  <span className="font-black tabular-nums">{fmt(l.dayVotes)}</span>
                  <RemoveButton label="" onClick={() => onRemove([l.id], `"${l.title}"`)} />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-bold mb-4">Latest submissions</h2>
        {!s ? (
          <p className="text-gray-500 py-6 text-center">Loading…</p>
        ) : s.recentSubmissions.length === 0 ? (
          <p className="text-gray-500 py-6 text-center">No submissions yet</p>
        ) : (
          <ul className="divide-y">
            {s.recentSubmissions.map((l) => (
              <li
                key={l.id}
                className={`py-2.5 px-2 -mx-2 rounded flex items-center gap-3 transition-colors duration-1000 ${
                  live.freshIds.has(l.id) ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex-1 min-w-0"><ListingTitle listing={l} /></div>
                {live.freshIds.has(l.id) && <span className="text-[10px] font-black text-green-700 bg-green-100 rounded px-1.5 py-0.5">NEW</span>}
                <span className="hidden sm:inline text-xs text-gray-500 capitalize">{l.platform}</span>
                <span className="text-xs text-gray-500 w-16 text-right">{timeAgo(l.createdAt)}</span>
                <span className="font-bold tabular-nums w-10 text-right">{fmt(l.totalVotes)}</span>
                <RemoveButton label="" onClick={() => onRemove([l.id], `"${l.title}"`)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---- Submissions tab ----

/** GETs `url` and refetches whenever it changes, a live push arrives, or reload() is called. */
function useAdminData<T>(url: string, liveVersion: string | undefined, onError: () => void) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const onErr = useRef(onError);
  useEffect(() => { onErr.current = onError; });

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: T) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) onErr.current(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // Every live push means something changed (new submission, vote, removal), so refetch on it too.
  }, [url, liveVersion, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { data, loading, reload };
}

function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function SubmissionsTab({
  onRemove,
  liveVersion,
  toast,
  userId,
  compact = false,
}: {
  onRemove: (ids: string[], label: string) => Promise<boolean>;
  liveVersion: string | undefined;
  toast: (m: string, t?: Toast['type']) => void;
  userId?: string;
  compact?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounced(search);

  const params = new URLSearchParams({ page: String(page), limit: compact ? '10' : '20', sort });
  if (debouncedSearch) params.set('search', debouncedSearch);
  if (platform) params.set('platform', platform);
  if (userId) params.set('userId', userId);
  const { data, loading, reload: load } = useAdminData<{ listings: AdminListing[]; pagination: Pagination }>(
    `/api/admin/listings?${params}`,
    liveVersion,
    () => toast('Failed to load submissions', 'error')
  );
  const listings = data?.listings ?? [];
  const pagination = data?.pagination ?? null;

  const toggle = (id: string) =>
    setSelected((s) => {
      const copy = new Set(s);
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  const allSelected = listings.length > 0 && listings.every((l) => selected.has(l.id));

  const remove = async (ids: string[], label: string) => {
    if (await onRemove(ids, label)) {
      setSelected((s) => new Set([...s].filter((id) => !ids.includes(id))));
      load();
    }
  };

  return (
    <div className={compact ? '' : 'bg-white rounded-lg shadow p-5'}>
      {!compact && (
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title, description or URL…"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460]"
            />
          </div>
          <select value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">All platforms</option>
            {['website', 'twitter', 'x', 'instagram', 'facebook', 'tiktok', 'linkedin', 'youtube'].map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="votes">Most votes</option>
            <option value="today">Most votes today</option>
          </select>
          <button onClick={load} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
          <span className="font-bold">{selected.size} selected</span>
          <RemoveButton label="Remove selected" onClick={() => remove([...selected], `${selected.size} submission(s)`)} />
          <button onClick={() => setSelected(new Set())} className="text-gray-600 hover:underline">Clear</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-200 text-left">
            <tr>
              <th className="px-3 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(listings.map((l) => l.id)))}
                  aria-label="Select all"
                />
              </th>
              <th className="px-3 py-2.5 font-bold">Submission</th>
              {!userId && <th className="px-3 py-2.5 font-bold">Submitted by</th>}
              <th className="px-3 py-2.5 font-bold">Platform</th>
              <th className="px-3 py-2.5 font-bold text-right">Votes</th>
              <th className="px-3 py-2.5 font-bold text-right">Today</th>
              <th className="px-3 py-2.5 font-bold">Submitted</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className={`border-b hover:bg-gray-50 ${selected.has(l.id) ? 'bg-red-50/50' : ''}`}>
                <td className="px-3 py-2.5">
                  <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} aria-label={`Select ${l.title}`} />
                </td>
                <td className="px-3 py-2.5 max-w-xs"><ListingTitle listing={l} /></td>
                {!userId && (
                  <td className="px-3 py-2.5 text-gray-600">
                    {l.owner ? (
                      <span title={l.owner.name || undefined}>{l.owner.email}</span>
                    ) : (
                      <span className="text-gray-400 italic">Guest</span>
                    )}
                  </td>
                )}
                <td className="px-3 py-2.5 capitalize text-gray-600">{l.platform}</td>
                <td className="px-3 py-2.5 text-right font-bold tabular-nums">{fmt(l.totalVotes)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fmt(l.dayVotes)}</td>
                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap" title={new Date(l.createdAt).toLocaleString()}>
                  {timeAgo(l.createdAt)}
                </td>
                <td className="px-3 py-2.5">
                  <RemoveButton onClick={() => remove([l.id], `"${l.title}"`)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && listings.length === 0 && <p className="text-center text-gray-500 py-8">No submissions found</p>}
      {loading && listings.length === 0 && <p className="text-center text-gray-500 py-8">Loading…</p>}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-600">{fmt(pagination.total)} submissions</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Prev</button>
            <span>Page {page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Users tab ----

function UsersTab({
  onRemove,
  liveVersion,
  toast,
}: {
  onRemove: (ids: string[], label: string) => Promise<boolean>;
  liveVersion: string | undefined;
  toast: (m: string, t?: Toast['type']) => void;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const debouncedSearch = useDebounced(search);

  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (debouncedSearch) params.set('search', debouncedSearch);
  const { data, loading, reload: load } = useAdminData<{ users: AdminUser[]; pagination: Pagination }>(
    `/api/admin/users?${params}`,
    liveVersion,
    () => toast('Failed to load users', 'error')
  );
  const users = data?.users ?? [];
  const pagination = data?.pagination ?? null;

  const deleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete the account ${user.email}? Their votes and sessions are deleted; their submissions stay. This cannot be undone.`)) return;
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) {
      toast('User deleted', 'success');
      load();
    } else {
      toast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by email or name…"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0F3460]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-200 text-left">
            <tr>
              <th className="px-3 py-2.5 w-8" />
              <th className="px-3 py-2.5 font-bold">Email</th>
              <th className="px-3 py-2.5 font-bold">Name</th>
              <th className="px-3 py-2.5 font-bold text-right">Submissions</th>
              <th className="px-3 py-2.5 font-bold text-right">Votes received</th>
              <th className="px-3 py-2.5 font-bold">Joined</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                open={expanded === u.id}
                onToggle={() => setExpanded(expanded === u.id ? null : u.id)}
                onDelete={() => deleteUser(u)}
              >
                <SubmissionsTab onRemove={onRemove} liveVersion={liveVersion} toast={toast} userId={u.id} compact />
              </UserRow>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && users.length === 0 && <p className="text-center text-gray-500 py-8">No users found</p>}
      {loading && users.length === 0 && <p className="text-center text-gray-500 py-8">Loading…</p>}

      {pagination && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-gray-600 flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> {fmt(pagination.total)} users</span>
          {pagination.pages > 1 && (
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Prev</button>
              <span>Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  open,
  onToggle,
  onDelete,
  children,
}: {
  user: AdminUser;
  open: boolean;
  onToggle: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <tr className={`border-b hover:bg-gray-50 ${open ? 'bg-gray-50' : ''}`}>
        <td className="px-3 py-2.5">
          <button onClick={onToggle} aria-label={open ? 'Hide submissions' : 'Show submissions'} disabled={user.submissions === 0} className="disabled:opacity-30">
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </td>
        <td className="px-3 py-2.5 font-semibold">{user.email}</td>
        <td className="px-3 py-2.5">{user.name || '—'}</td>
        <td className="px-3 py-2.5 text-right tabular-nums">
          {user.submissions > 0 ? (
            <button onClick={onToggle} className="font-bold text-[#0F3460] hover:underline">{fmt(user.submissions)}</button>
          ) : (
            <span className="text-gray-400">0</span>
          )}
        </td>
        <td className="px-3 py-2.5 text-right tabular-nums">{fmt(user.submissionVotes)}</td>
        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
        <td className="px-3 py-2.5">
          <button onClick={onDelete} title="Delete user" className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-b bg-gray-50">
          <td colSpan={7} className="px-3 pb-4 pt-1">
            <div className="bg-white rounded-lg border p-3">{children}</div>
          </td>
        </tr>
      )}
    </>
  );
}
