import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { WalletController } from '../controllers/wallet.controller';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const walletController = container.get<WalletController>(TYPES.WalletController);


//  ============================================================================
//                               WALLET ROUTES
//  ============================================================================

router.get(
  '/me/wallets',
  asyncHandler(walletController.getUserWallet.bind(walletController))
);

router.get(
  '/me/wallets/transactions',
  asyncHandler(walletController.getWalletTransactions.bind(walletController))
);



export { router as walletRouter };
