export const orderEndpoints = {
  base: '/',
  order: '/:orderId',
  orderReset: '/:orderId/reset',
  status: '/:orderId/status',
} as const;
