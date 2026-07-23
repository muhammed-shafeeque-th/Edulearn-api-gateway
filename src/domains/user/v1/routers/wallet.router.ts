import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { WalletController } from '../controllers/wallet.controller';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { walletEndpoints } from './route.constants';

const router = Router();

const walletController = container.get<WalletController>(
  TYPES.WalletController
);

//  ============================================================================
//                               WALLET ROUTES
//  ============================================================================

router.get(
  walletEndpoints.me,
  asyncHandler(walletController.getUserWallet.bind(walletController))
);

router.get(
  walletEndpoints.myWalletTransactions,
  asyncHandler(walletController.getWalletTransactions.bind(walletController))
);

export { router as walletRouter };
