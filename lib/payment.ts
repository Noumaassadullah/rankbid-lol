import crypto from 'crypto';

// JazzCash Payment Integration
export function generateJazzCashSignature(
  merchantId: string,
  password: string,
  ppAmount: string,
  ppBillReference: string,
  ppLanguage: string,
  ppMerchantURLs: string,
  ppNotificationURL: string,
  ppReturnURL: string,
  ppSubMerchantId: string,
  ppTxnCurrency: string,
  ppTxnDateTime: string,
  ppTxnExpiryDateTime: string,
  ppUserID: string
): string {
  const hashString = `${merchantId}${password}${ppAmount}${ppBillReference}${ppLanguage}${ppMerchantURLs}${ppNotificationURL}${ppReturnURL}${ppSubMerchantId}${ppTxnCurrency}${ppTxnDateTime}${ppTxnExpiryDateTime}${ppUserID}`;
  return crypto.createHash('sha256').update(hashString).digest('hex');
}

export function generateJazzCashCheckoutURL(
  merchantId: string,
  password: string,
  amount: number,
  reference: string,
  returnURL: string,
  notificationURL: string
): string {
  const now = new Date();
  const txnDateTime = now.toISOString().replace(/[:-]/g, '').substring(0, 14);
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const txnExpiryDateTime = expiry.toISOString().replace(/[:-]/g, '').substring(0, 14);

  const signature = generateJazzCashSignature(
    merchantId,
    password,
    amount.toString(),
    reference,
    'en',
    'https://rankbid.local',
    notificationURL,
    returnURL,
    '0',
    'PKR',
    txnDateTime,
    txnExpiryDateTime,
    reference
  );

  const params = new URLSearchParams({
    pp_MerchantID: merchantId,
    pp_Amount: amount.toString(),
    pp_BillReference: reference,
    pp_Language: 'en',
    pp_MerchantURLs: 'https://rankbid.local',
    pp_NotificationURL: notificationURL,
    pp_ReturnURL: returnURL,
    pp_SubMerchantID: '0',
    pp_TxnCurrency: 'PKR',
    pp_TxnDateTime: txnDateTime,
    pp_TxnExpiryDateTime: txnExpiryDateTime,
    pp_UserID: reference,
    pp_SecureHash: signature,
  });

  return `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/CheckOut?${params.toString()}`;
}

export function verifyJazzCashSignature(
  merchantId: string,
  password: string,
  ppAmount: string,
  ppBillReference: string,
  ppLanguage: string,
  ppMerchantURLs: string,
  ppNotificationURL: string,
  ppReturnURL: string,
  ppSubMerchantId: string,
  ppTxnCurrency: string,
  ppTxnDateTime: string,
  ppTxnExpiryDateTime: string,
  ppUserID: string,
  ppSecureHash: string
): boolean {
  const expectedHash = generateJazzCashSignature(
    merchantId,
    password,
    ppAmount,
    ppBillReference,
    ppLanguage,
    ppMerchantURLs,
    ppNotificationURL,
    ppReturnURL,
    ppSubMerchantId,
    ppTxnCurrency,
    ppTxnDateTime,
    ppTxnExpiryDateTime,
    ppUserID
  );
  return ppSecureHash === expectedHash;
}

// EasyPaisa Payment Integration
export function generateEasypaisaSignature(
  merchantId: string,
  apiKey: string,
  amount: string,
  reference: string,
  returnURL: string
): string {
  const hashString = `${merchantId}${amount}${reference}${returnURL}${apiKey}`;
  return crypto.createHash('sha256').update(hashString).digest('hex');
}

export function generateEasypaisaCheckoutURL(
  merchantId: string,
  apiKey: string,
  amount: number,
  reference: string,
  returnURL: string
): string {
  const signature = generateEasypaisaSignature(
    merchantId,
    apiKey,
    amount.toString(),
    reference,
    returnURL
  );

  const params = new URLSearchParams({
    merchantId,
    amount: amount.toString(),
    reference,
    returnURL,
    signature,
  });

  return `https://sandbox.easypaisa.com.pk/pay?${params.toString()}`;
}

export function verifyEasypaisaSignature(
  merchantId: string,
  apiKey: string,
  amount: string,
  reference: string,
  returnURL: string,
  signature: string
): boolean {
  const expectedSignature = generateEasypaisaSignature(merchantId, apiKey, amount, reference, returnURL);
  return signature === expectedSignature;
}

// Amount formatting
export function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function parseAmount(amount: string): number {
  return Math.round(parseFloat(amount) * 100);
}
