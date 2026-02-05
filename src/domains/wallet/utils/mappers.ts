import { UserWalletData, WalletTransaction as WalletTransactionData } from '@/domains/service-clients/user/proto/generated/user/types/user_wallet_types';
import { UserWallet, WalletTransaction } from '../types';

export class WalletResponseMapper {
  
  public static toWallet = (
    dto: UserWalletData
  ): UserWallet | undefined => {
    if (!dto) return;
    return {
      balance: dto.balance,
      currency: dto.currency,
      transactions: dto.transactions.map(WalletResponseMapper.toWalletTransaction),
      updatedAt: dto.updatedAt,
      userId: dto.userId,
      createdAt: dto.createdAt,
    };
  };

  public static toWalletTransaction = (
    dto: WalletTransactionData
  ): WalletTransaction => {
    return {
      id: dto.id,
      amount: dto.amount,
      relatedOrder: dto.relatedOrder,
      status: dto.status,
      timestamp: dto.timestamp,
      type: dto.type,
      note: dto.note,
    };
  };
}
