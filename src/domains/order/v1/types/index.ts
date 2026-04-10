import { CourseInfo } from "@/domains/course/v1/types";


export interface OrderItems {
  courseId: string;
  course?: CourseInfo;
  price: number;
}

export interface PaymentDetails {
  paymentId: string;
  provider: string;
  providerOrderId?: string | undefined;
  paymentStatus: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItems[];
  paymentDetails?: PaymentDetails | undefined;
  totalAmount: number;
  discount: number;
  subTotal: number;
  salesTax?: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
