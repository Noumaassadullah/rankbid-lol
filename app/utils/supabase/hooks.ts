'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from './client';
import type { Database } from './types';

type ListingsRow = Database['public']['Tables']['listings']['Row'];
type ListingsInsert = Database['public']['Tables']['listings']['Insert'];
type ListingsUpdate = Database['public']['Tables']['listings']['Update'];
type UsersRow = Database['public']['Tables']['users']['Row'];
type UsersUpdate = Database['public']['Tables']['users']['Update'];

export function useListings(filters?: { category?: string; status?: string }) {
  const supabase = createClient();
  const [listings, setListings] = useState<ListingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        let query = supabase.from('listings').select('*');

        if (filters?.status) {
          query = query.eq('status', filters.status);
        } else {
          query = query.eq('status', 'active');
        }

        if (filters?.category) {
          query = query.eq('category', filters.category);
        }

        const { data, error: err } = await query.order('created_at', { ascending: false });

        if (err) throw err;
        setListings(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [filters?.category, filters?.status]);

  return { listings, loading, error };
}

export function useUser(userId?: string) {
  const supabase = createClient();
  const [user, setUser] = useState<UsersRow | null>(null);
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
          .eq('id', userId!)
          .single();

        if (err) throw err;
        setUser(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        setUser(null);
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
  const [listings, setListings] = useState<ListingsRow[]>([]);
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
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
        setListings([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserListings();
  }, [userId]);

  return { listings, loading, error };
}

export function useCreateListing() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = useCallback(
    async (data: ListingsInsert) => {
      setLoading(true);
      setError(null);
      try {
        // @ts-expect-error - Supabase type inference issue
        const { data: listing, error: err } = await supabase
          .from('listings')
          .insert([data])
          .select()
          .single();

        if (err) throw err;
        return listing;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create listing';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return { createListing, loading, error };
}

export function useUpdateListing() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateListing = useCallback(
    async (id: string, data: ListingsUpdate) => {
      setLoading(true);
      setError(null);
      try {
        // @ts-expect-error - Supabase type inference issue
        const { data: listing, error: err } = await supabase
          .from('listings')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (err) throw err;
        return listing;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update listing';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return { updateListing, loading, error };
}

export function useDeleteListing() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteListing = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const { error: err } = await supabase.from('listings').delete().eq('id', id);

        if (err) throw err;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete listing';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return { deleteListing, loading, error };
}

export function useUpdateUser() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(
    async (userId: string, data: UsersUpdate) => {
      setLoading(true);
      setError(null);
      try {
        const { data: user, error: err } = await supabase
          .from('users')
          .update(data)
          .eq('id', userId)
          .select()
          .single();

        if (err) throw err;
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return { updateUser, loading, error };
}
