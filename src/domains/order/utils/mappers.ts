import { OrderData } from '@/domains/service-clients/order/proto/generated/order_service';
import { Order } from '../types';

export class OrderResponseMapper {
  // Mapping Functions
  public static toOrder = (dto?: OrderData): Order | undefined => {
    if (!dto) return undefined;
    return {
      id: dto.id,
      currency: dto.amount!.currency,
      discount: dto.amount!.discount,
      subTotal: dto.amount!.subTotal,
      status: dto.status,
      totalAmount: dto.amount!.total,
      salesTax: dto.amount!.salesTax,
      items: dto.items.map(item => ({
        courseId: item.courseId,
        price: item.price,
      })),
      updatedAt: dto.updatedAt,
      paymentDetails: dto.paymentDetails
        ? {
            paymentId: dto.paymentDetails?.paymentId,
            paymentStatus: dto.paymentDetails?.paymentStatus,
            provider: dto.paymentDetails?.provider,
            updatedAt: dto.paymentDetails?.updatedAt,
            providerOrderId: dto.paymentDetails?.providerOrderId,
          }
        : undefined,
      userId: dto.userId,
      createdAt: dto.createdAt,
    };
  };
}
