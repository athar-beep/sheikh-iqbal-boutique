import { CODProvider, JazzCashProvider, EasypaisaProvider, RaastProvider, paymentProviders } from './payments';

export interface PaymentInitiateRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'raast';
  returnUrl?: string;
}

export interface PaymentInitiateResponse {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  instructions?: string;
  paymentUrl?: string;
  data?: Record<string, any>;
  message: string;
}

export interface PaymentVerificationRequest {
  transactionId: string;
  orderId: string;
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'raast';
  rawPayload?: Record<string, any>;
}

export interface PaymentVerificationResponse {
  isVerified: boolean;
  status: 'paid' | 'failed' | 'pending';
  responseCode: string;
  transactionReference: string;
  message: string;
}

function adaptInitiation(result: ReturnType<typeof CODProvider.initiate>): PaymentInitiateResponse {
  return {
    success: result.success,
    transactionId: result.transactionId || '',
    paymentMethod: result.provider,
    status: result.provider === 'cod' || result.provider === 'raast' ? 'pending' : 'processing',
    data: result.paymentData,
    message: result.message,
    instructions: result.paymentData?.instructions
  };
}

export class PaymentService {
  public async initiate(req: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    switch (req.paymentMethod) {
      case 'cod':
        return adaptInitiation(CODProvider.initiate(req.orderNumber, req.amount, req.customerPhone));
      case 'jazzcash':
        return adaptInitiation(JazzCashProvider.initiate(req.orderNumber, req.amount, req.customerPhone));
      case 'easypaisa':
        return adaptInitiation(EasypaisaProvider.initiate(req.orderNumber, req.amount, req.customerPhone));
      case 'raast':
        return adaptInitiation(RaastProvider.initiate(req.orderNumber, req.amount));
    }
  }

  public async verify(req: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    if (!req.rawPayload) {
      return { isVerified: false, status: 'pending', responseCode: 'CALLBACK_REQUIRED', transactionReference: req.transactionId, message: 'Provider-signed callback payload is required.' };
    }

    if (req.paymentMethod === 'jazzcash') {
      const result = paymentProviders.JazzCashProvider.verify(req.rawPayload);
      return { isVerified: result.verified, status: result.status, responseCode: String(req.rawPayload.pp_ResponseCode || ''), transactionReference: result.transactionId, message: result.error || 'JazzCash callback verified.' };
    }
    if (req.paymentMethod === 'easypaisa') {
      const result = paymentProviders.EasypaisaProvider.verify(req.rawPayload);
      return { isVerified: result.verified, status: result.status, responseCode: String(req.rawPayload.responseCode || ''), transactionReference: result.transactionId, message: result.error || 'Easypaisa callback verified.' };
    }

    return { isVerified: false, status: 'pending', responseCode: 'MANUAL_REQUIRED', transactionReference: req.transactionId, message: 'This payment method requires an authorized finance confirmation.' };
  }
}

export const paymentService = new PaymentService();
