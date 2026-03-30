export interface WalletTransaction {
  id: string;
  amount: number;
  /** deposit, withdrawal, purchase, refund, etc. */
  type: string;
  /** pending, complete, failed, etc. */
  status: string;
  /** orderId, if applicable */
  relatedOrder: string;
  timestamp: string;
  note?: string | undefined;
}

export interface UserWallet {
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  updatedAt?: string | undefined;
  createdAt?: string | undefined;
}
