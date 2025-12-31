import { adminRoutesV1 } from '@/domains/admin/routers/v1/users/admin.router';
import { authRoutesV1 } from '@/domains/auth/routers/v1/auth.router';
import { cartRoutesV1 } from '@/domains/cart/routers/v1/cart.router';
import { chatRoutesV1 } from '@/domains/chat/routers/v1/chat.router';
import { courseRoutesV1 } from '@/domains/course/routers/v1/course.router';
import { enrollmentRoutesV1 } from '@/domains/enrollment/routers/v1/enrollment.router';
import { mediaRoutesV1 } from '@/domains/media/routers/v1/media.router';
import { notificationRoutesV1 } from '@/domains/notification/routers/v1/notification.router';
import { orderRoutesV1 } from '@/domains/order/routers/v1/order.router';
import { paymentRoutesV1 } from '@/domains/payment/routers/v1/payment.router';
import { userRoutesV1 } from '@/domains/user/routers/v1/users.router';
import { walletRoutesV1 } from '@/domains/wallet/routers/v1/wallet.router';
import { wishlistRoutesV1 } from '@/domains/wishlist/routers/v1/wishlist.router';
import { authenticate } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { Router } from 'express';

const router = Router();
router.use('/users',  userRoutesV1);
router.use('/auth', authRoutesV1);
router.use('/media', authenticate, blocklistMiddleware, mediaRoutesV1);
router.use('/courses', courseRoutesV1);
router.use('/carts', authenticate, blocklistMiddleware, cartRoutesV1);
router.use('/chats', authenticate, blocklistMiddleware, chatRoutesV1);
router.use('/wishlists', authenticate, blocklistMiddleware, wishlistRoutesV1);
router.use('/orders', authenticate, blocklistMiddleware, orderRoutesV1);
router.use('/payments', authenticate, blocklistMiddleware, paymentRoutesV1);
router.use(
  '/enrollments',
  authenticate,
  blocklistMiddleware,
  enrollmentRoutesV1
);
router.use('/wallets', authenticate, blocklistMiddleware, walletRoutesV1);
router.use(
  '/notifications',
  authenticate,
  blocklistMiddleware,
  notificationRoutesV1
);
router.use('/admin', adminRoutesV1);

export { router as routerV1 };
