'use client';

import { useEffect, useState } from 'react';
import { createClient } from './client';
import type { Database } from './types';

export function useListings(filters?: { category?: string; status?: string }) {
  const supabase = createClient();
  const [listings, setListings] = useState<Database['public']['Tables']['listings']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        let query = supabase.from('listings').select('*').eq('status', 'active');

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        const { data, error: err } = await query.order('created_at', { ascending: false });

        if (err) throw err;
        setListings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [filters?.category]);

  return { listings, loading, error };
}

export function useUser(userId?: string) {
  const supabase = createClient();
  const [user, setUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const { data, error: err } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (err) throw err;
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

export function useUserListings(userId: string) {
  const supabase = createClient();
  const [listings, setListings] = useState<Database['public']['Tables']['listings']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserListings() {
      try {
        const { data, error: err } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (err) throw err;
        setListings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    }

    fetchUserListings();
  }, [userId]);

  return { listings, loading, error };
}
