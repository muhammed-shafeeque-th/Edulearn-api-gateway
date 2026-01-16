import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { CourseService } from '@/domains/service-clients/course';
import { Observe } from '@/services/observability/decorators';
import { getUserWalletSchema } from '../../schemas/get-user-wallet.schema';
import {
  UserWalletData,
  WalletTransaction as WalletTransactionData,
} from '@/domains/service-clients/user/proto/generated/user/types/user_wallet_types';
import { attachMetadata } from '../../utils/attach-metadata';
import { WALLET_MESSAGES } from '../../utils/response-message';
import { getWalletTransactionsSchema } from '../../schemas/get-wallet-transaction.schema';
import { UserWallet, WalletTransaction } from '../../types';
import { mapPaginationResponse } from '@/shared/utils/map-pagination';
import { WalletResponseMapper } from '../../utils/mappers';

@Observe({ logLevel: 'debug' })
export class WalletController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;
  private courseServiceClient: CourseService;

  constructor() {
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
  }

  async getWalletTransactions(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        pagination: req.query,
        ...req.params,
        ...req.user,
      },
      getWalletTransactionsSchema
    )!;

    const { success } = await this.userServiceClient.getWalletTransactions(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );
    const paginationResponse = mapPaginationResponse(
      validPayload.pagination,
      success?.total
    );

    return new ResponseWrapper(res)
      .status(WALLET_MESSAGES.FETCH_WALLET_TRANSACTIONS.statusCode)
      .success(
        success?.transactions.map(WalletResponseMapper.toWalletTransaction),
        WALLET_MESSAGES.FETCH_WALLET_TRANSACTIONS.message,
        paginationResponse
      );
  }

  async getUserWallet(req: Request, res: Response) {
    const validPayload = validateSchema(
      {
        pagination: req.query,
        ...req.params,
        ...req.user,
      },
      getUserWalletSchema
    )!;

    const { success } = await this.userServiceClient.getUserWallet(
      validPayload,
      {
        metadata: attachMetadata(req),
      }
    );

    const paginationResponse = mapPaginationResponse(
      validPayload.pagination,
      success?.total
    );

    return new ResponseWrapper(res)
      .status(WALLET_MESSAGES.FETCH_USER_WALLET.statusCode)
      .success(
        WalletResponseMapper.toWallet(success!.wallet!),
        WALLET_MESSAGES.FETCH_USER_WALLET.message,
        paginationResponse
      );
  }
}
