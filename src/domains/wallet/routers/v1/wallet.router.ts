import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { WalletController } from '../../controllers/v1/wallet.controller';
import { Router } from 'express';

const router = Router();

const walletController = new WalletController();

//  ============================================================================
//                               WALLET ROUTES
//  ============================================================================

router.get(
  '/me',
  asyncHandler(walletController.getUserWallet.bind(walletController))
);

router.get(
  '/:walletId',
  asyncHandler(walletController.getWalletTransactions.bind(walletController))
);

export { router as walletRoutesV1 };
