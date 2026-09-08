import crypto from 'crypto';

interface JazzCashPaymentRequest {
  pp_amount: string;
  pp_merchant_id: string;
  pp_order_ref: string;
  pp_bill_reference: string;
  pp_language: string;
  pp_return_url: string;
  pp_notify_url: string;
  pp_txn_datetime: string;
  pp_txn_expiry_time: string;
}

export function generateJazzCashCheckout(
  amount: number, // in cents
  orderId: string,
  returnUrl: string,
  notifyUrl: string
): { url: string; payload: Record<string, string> } {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID!;
  const password = process.env.JAZZCASH_PASSWORD!;
  const integrityCheck = process.env.JAZZCASH_INTEGRITY_CHECK_KEY!;

  // Convert cents to PKR (divide by 100)
  const amountInPKR = (amount / 100).toFixed(0);

  // Generate timestamps
  const now = new Date();
  const txnDateTime = formatJazzCashDateTime(now);
  const expiryTime = formatJazzCashDateTime(new Date(now.getTime() + 10 * 60000)); // 10 mins

  const payload: JazzCashPaymentRequest = {
    pp_amount: amountInPKR,
    pp_merchant_id: merchantId,
    pp_order_ref: orderId,
    pp_bill_reference: orderId,
    pp_language: 'en',
    pp_return_url: returnUrl,
    pp_notify_url: notifyUrl,
    pp_txn_datetime: txnDateTime,
    pp_txn_expiry_time: expiryTime,
  };

  // Generate PPSTK (Post Back Signature Token Key)
  const ppstk = generatePPSTK(payload, password, integrityCheck);

  const checkoutPayload = {
    ...payload,
    pp_secure_hash: ppstk,
  };

  // Build JazzCash checkout URL
  const baseUrl = 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Purchase/DoTransaction';
  const params = new URLSearchParams();
  Object.entries(checkoutPayload).forEach(([key, value]) => {
    params.append(key, value);
  });

  return {
    url: `${baseUrl}?${params.toString()}`,
    payload: checkoutPayload,
  };
}

export function verifyJazzCashResponse(
  responseData: Record<string, any>,
  password: string,
  integrityCheckKey: string
): boolean {
  try {
    // Recreate the hash from response data
    const responseHash = responseData.pp_secure_hash;

    const dataToHash = [
      responseData.pp_amount,
      responseData.pp_auth_code,
      responseData.pp_language,
      responseData.pp_merchant_id,
      responseData.pp_response_code,
      responseData.pp_txn_datetime,
      responseData.pp_txn_ref,
    ]
      .map(v => (v === null || v === undefined ? '' : String(v)))
      .join('|');

    const salt = password;
    const hashPayload = `${salt}${dataToHash}${integrityCheckKey}`;
    const calculatedHash = crypto
      .createHash('sha256')
      .update(hashPayload)
      .digest('hex');

    return calculatedHash === responseHash;
  } catch (error) {
    console.error('JazzCash verification error:', error);
    return false;
  }
}

function generatePPSTK(
  payload: JazzCashPaymentRequest,
  password: string,
  integrityCheckKey: string
): string {
  // Order: amount, merchant_id, order_ref, txn_datetime, return_url, txn_expiry_time, language, integrity_check_key
  const dataToHash = [
    payload.pp_amount,
    payload.pp_merchant_id,
    payload.pp_order_ref,
    payload.pp_txn_datetime,
    payload.pp_return_url,
    payload.pp_txn_expiry_time,
    payload.pp_language,
  ]
    .map(v => (v === null || v === undefined ? '' : String(v)))
    .join('|');

  const salt = password;
  const hashPayload = `${salt}${dataToHash}${integrityCheckKey}`;

  return crypto
    .createHash('sha256')
    .update(hashPayload)
    .digest('hex');
}

function formatJazzCashDateTime(date: Date): string {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}
