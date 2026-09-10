import crypto from 'crypto';

export interface PaymentInitiationResult {
  success: boolean;
  provider: 'cod' | 'jazzcash' | 'easypaisa' | 'raast';
  transactionId?: string;
  redirectUrl?: string;
  paymentData?: Record<string, any>;
  message: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  transactionId: string;
  amount: number;
  provider: string;
  status: 'paid' | 'pending' | 'failed';
  rawResponse?: Record<string, any>;
  error?: string;
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requiredSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be configured before accepting payment callbacks.`);
  return value;
}

function jazzCashResponseHash(payload: Record<string, any>, salt: string): string {
  const data = Object.entries(payload)
    .filter(([key, value]) => key !== 'pp_SecureHash' && value !== undefined && value !== null)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, value]) => String(value))
    .join('');
  return crypto.createHash('sha256').update(`${salt}${data}`, 'utf8').digest('hex').toUpperCase();
}

function verifyJazzCashSignature(data: Record<string, any>): boolean {
  const provided = String(data.pp_SecureHash || '').trim().toUpperCase();
  if (!provided) return false;
  const expected = jazzCashResponseHash(data, requiredSecret('JAZZCASH_INTEGRITY_SALT'));
  return timingSafeEqualStrings(provided, expected);
}

function easypaisaCallbackSignature(payload: Record<string, any>, hashKey: string): string {
  const orderRef = String(payload.orderRefNumber ?? payload.orderRefNum ?? payload.orderId ?? '');
  const responseCode = String(payload.responseCode ?? '');
  const responseDesc = String(payload.responseDesc ?? payload.desc ?? '');
  const storeId = String(payload.storeId ?? process.env.EASYPAISA_STORE_ID ?? '');
  const canonical = `orderRefNumber=${orderRef}&responseCode=${responseCode}&responseDesc=${responseDesc}&storeId=${storeId}`;
  return crypto.createHmac('sha256', hashKey).update(canonical, 'utf8').digest('base64');
}

function verifyEasypaisaSignature(data: Record<string, any>): boolean {
  const provided = String(data.merchantHashedResp || '').trim();
  if (!provided) return false;
  const expected = easypaisaCallbackSignature(data, requiredSecret('EASYPAISA_HASH_KEY'));
  return timingSafeEqualStrings(provided, expected);
}

export class CODProvider {
  static initiate(orderNumber: string, amount: number, customerPhone: string): PaymentInitiationResult {
    const verificationCode = crypto.randomInt(100000, 1000000).toString();
    return {
      success: true, provider: 'cod', transactionId: `COD-${orderNumber}`,
      paymentData: { amount, currency: 'PKR', verificationCode, instructions: 'Please keep exact cash ready upon delivery. Courier rider will collect payment and issue printed receipt.' },
      message: 'Cash on Delivery registered. Order will be confirmed and processed for dispatch.',
    };
  }
}

export class JazzCashProvider {
  static initiate(orderNumber: string, amount: number, customerMobile: string): PaymentInitiationResult {
    const merchantId = requiredSecret('JAZZCASH_MERCHANT_ID');
    const txnDateTime = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const txnRefNo = `T${txnDateTime}${crypto.randomInt(100, 1000)}`;
    const expiryDateTime = new Date(Date.now() + 3600000).toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const fields: Record<string, any> = {
      pp_Amount: amount * 100, pp_BillReference: orderNumber, pp_CustomerMobile: customerMobile,
      pp_Description: `Sheikh Iqbal Boutique Order ${orderNumber}`, pp_MerchantID: merchantId,
      pp_Password: requiredSecret('JAZZCASH_PASSWORD'), pp_ReturnURL: requiredSecret('JAZZCASH_RETURN_URL'),
      pp_TxnDateTime: txnDateTime, pp_TxnExpiryDateTime: expiryDateTime, pp_TxnRefNo: txnRefNo, pp_TxnCurrency: 'PKR'
    };
    const pp_SecureHash = jazzCashResponseHash(fields, requiredSecret('JAZZCASH_INTEGRITY_SALT'));
    return { success: true, provider: 'jazzcash', transactionId: txnRefNo, paymentData: { ...fields, pp_SecureHash }, message: 'JazzCash payment intent generated.' };
  }

  static verify(data: Record<string, any>): PaymentVerificationResult {
    if (!verifyJazzCashSignature(data)) {
      return { verified: false, transactionId: String(data.pp_TxnRefNo || ''), amount: Number(data.pp_Amount || 0) / 100, provider: 'jazzcash', status: 'failed', rawResponse: data, error: 'Invalid JazzCash secure hash.' };
    }
    const paid = String(data.pp_ResponseCode || '') === '000';
    return { verified: paid, transactionId: String(data.pp_TxnRefNo || ''), amount: Number(data.pp_Amount || 0) / 100, provider: 'jazzcash', status: paid ? 'paid' : 'failed', rawResponse: data, error: paid ? undefined : String(data.pp_ResponseMessage || 'JazzCash transaction was not successful.') };
  }
}

export class EasypaisaProvider {
  static initiate(orderNumber: string, amount: number, customerMobile: string): PaymentInitiationResult {
    const storeId = requiredSecret('EASYPAISA_STORE_ID');
    return {
      success: true, provider: 'easypaisa', transactionId: `EP-${orderNumber}-${crypto.randomInt(100, 1000)}`,
      paymentData: { storeId, orderRefNum: orderNumber, transactionAmount: amount.toFixed(2), mobileNum: customerMobile, postBackURL: requiredSecret('EASYPAISA_RETURN_URL') },
      message: 'Easypaisa payment intent generated. Redirect to the configured Easypaisa checkout.'
    };
  }

  static verify(data: Record<string, any>): PaymentVerificationResult {
    if (!verifyEasypaisaSignature(data)) {
      return { verified: false, transactionId: String(data.transactionId || data.orderRefNum || data.orderId || ''), amount: Number(data.transactionAmount ?? data.amount ?? 0), provider: 'easypaisa', status: 'failed', rawResponse: data, error: 'Invalid or missing Easypaisa callback signature.' };
    }
    const responseCode = String(data.responseCode || '');
    const transactionStatus = String(data.transactionStatus || '').toUpperCase();
    const paid = responseCode === '0000' && (transactionStatus === '' || transactionStatus === 'PAID' || String(data.status || '').toUpperCase() === 'SUCCESS' || String(data.status || '').toUpperCase() === 'PAID');
    return { verified: paid, transactionId: String(data.transactionId || data.orderRefNum || data.orderId || ''), amount: Number(data.transactionAmount ?? data.amount ?? 0), provider: 'easypaisa', status: paid ? 'paid' : 'failed', rawResponse: data, error: paid ? undefined : String(data.responseDesc || data.desc || 'Easypaisa transaction was not successful.') };
  }
}

export class RaastProvider {
  static initiate(orderNumber: string, amount: number): PaymentInitiationResult {
    const iban = process.env.RAAST_IBAN || '';
    return { success: true, provider: 'raast', transactionId: `RAAST-${orderNumber}`, paymentData: { iban, amount, currency: 'PKR' }, message: 'Raast payment instructions generated. Order held for bank confirmation.' };
  }
}

export const paymentProviders = { CODProvider, JazzCashProvider, EasypaisaProvider, RaastProvider };
