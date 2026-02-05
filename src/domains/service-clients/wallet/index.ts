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
import { GetInstructorRevenueSummeryRequest, GetInstructorRevenueSummeryResponse } from '../user/proto/generated/user/types/stats_types';

export class WalletService {
  private readonly client: GrpcClient<WalletServiceClient>;
  private static instance: WalletService;

  private constructor() {
    const [host = 'localhost', port = '50052'] =
      config.grpc.services.userServiceClient.split(':');

    this.client = new GrpcClient({
      protoPath: path.join(
        process.cwd(),
        'proto',
        'user',
        'user_service.proto'
      ),
      packageName: 'user_service',
      serviceName: 'WalletService',
      host,
      port: parseInt(port),
      loaderOptions: {
        includeDirs: [path.join(process.cwd(), 'proto', 'user')],
      },
    });
  }

  // Singleton pattern
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
