import { HttpStatus } from '@/shared/constants/http-status';

export const WALLET_MESSAGES = {
  FETCH_USER_WALLET: {
    message: 'User wallet fetched successfully',
    statusCode: HttpStatus.OK,
  },
  FETCH_WALLET_TRANSACTIONS: {
    message: 'Wallet transactions fetched successfully',
    statusCode: HttpStatus.OK,
  },
  ADD_FUNDS: {
    message: 'Funds added to wallet successfully',
    statusCode: HttpStatus.CREATED,
  },
  WITHDRAW_FUNDS: {
    message: 'Funds withdrawn from wallet successfully',
    statusCode: HttpStatus.OK,
  },
  WALLET_EMPTY: {
    message: 'User wallet is empty',
    statusCode: HttpStatus.OK,
  },
  INSUFFICIENT_FUNDS: {
    message: 'Insufficient funds in wallet',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  WALLET_OPERATION_FAILED: {
    message: 'Wallet operation failed',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
