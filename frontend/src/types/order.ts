import type { CartItem } from "../context/cart-context";

export type PaymentMethod = "card" | "cod" | "jazzcash" | "easypaisa";

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type ShippingAddress = {
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

export type OrderRequest = {
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: Array<{ productId: string; quantity: number }>;
  discountCode?: string;
};

export type OrderConfirmation = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  estimatedDelivery: string;
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type OrderRecord = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    category: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  discountCode: string;
};
