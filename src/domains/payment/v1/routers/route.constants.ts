export const paymentEndpoints = {
  create: '/create',
  providerSession: '/:paymentId/session',
  resolve: '/:provider/resolve',
  cancel: '/:provider/cancel',
  payment: '/:paymentId',
} as const;
