import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

export interface PaymentRecord {
  id?: string;
  transaction_id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'rapid-gateway' | 'jazzcash' | 'easypaisa' | 'stripe';
  user_id?: string;
  listing_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export async function createPaymentRecord(
  payment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          transaction_id: payment.transaction_id,
          reference: payment.reference,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          payment_method: payment.payment_method,
          user_id: payment.user_id,
          listing_id: payment.listing_id,
          metadata: payment.metadata,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating payment record:', error);
    return { success: false, error };
  }
}

export async function updatePaymentStatus(
  transactionId: string,
  status: 'completed' | 'failed' | 'refunded',
  metadata?: Record<string, any>
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        metadata: metadata ? { ...metadata } : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, error };
  }
}

export async function getPaymentByReference(reference: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching payment:', error);
    return { success: false, error };
  }
}

export async function getPaymentByTransactionId(transactionId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching payment:', error);
    return { success: false, error };
  }
}
