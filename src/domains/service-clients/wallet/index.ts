import path from 'path';
import { GrpcClient } from '@/shared/utils/grpc/client';
import { GrpcClientOptions } from '@/shared/utils/grpc/types';
import { config } from '@/config';
import { WalletServiceClient } from '../user/proto/generated/user_service';
import {
  GetUserWalletRequest,
  GetUserWalletResponse,
  GetWalletTransactionsRequest,
  GetWalletTransactionsResponse,
} from '../user/proto/generated/user/types/user_wallet_types';
import {
  GetInstructorRevenueSummeryRequest,
  GetInstructorRevenueSummeryResponse,
} from '../user/proto/generated/user/types/stats_types';

import { injectable } from 'inversify';
import { getProtoPath, PROTO_ROOT_DIR } from '@edulearn/core';

@injectable()
export class WalletService {
  private readonly client: GrpcClient<WalletServiceClient>;
  private static instance: WalletService;

  public constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.userServiceClient.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(getProtoPath('user')),
      packageName: 'user_service',
      serviceName: 'WalletService',
      host,
      port: parseInt(port),
      loaderOptions: {
        includeDirs: [path.join(PROTO_ROOT_DIR, 'user')],
      },
    });
  }

  // Singleton pattern (Deprecated)
  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public static async shutdown(): Promise<void> {
    if (WalletService.instance) {
      try {
        WalletService.instance.close();
      } finally {
        // no-op
      }
    }
  }

  // User wallet methods
  async getUserWallet(
    request: GetUserWalletRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetUserWalletResponse> {
    const response = await this.client.unaryCall(
      'getUserWallet',
      request,
      options
    );
    return response as GetUserWalletResponse;
  }
  async getWalletTransactions(
    request: GetWalletTransactionsRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetWalletTransactionsResponse> {
    const response = await this.client.unaryCall(
      'getWalletTransactions',
      request,
      options
    );
    return response as GetWalletTransactionsResponse;
  }

  // Stats
  async getInstructorRevenueSummery(
    request: GetInstructorRevenueSummeryRequest,
    options: GrpcClientOptions = {}
  ): Promise<GetInstructorRevenueSummeryResponse> {
    const response = await this.client.unaryCall(
      'getInstructorRevenueSummery',
      request,
      options
    );
    return response as GetInstructorRevenueSummeryResponse;
  }

  close() {
    this.client.close();
  }
}
