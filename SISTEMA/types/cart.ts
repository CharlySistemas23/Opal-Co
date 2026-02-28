export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  quantity: number;
  price: string;
  image?: {
    url: string;
    altText: string | null;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  lines: CartItem[];
  totalQuantity: number;
}
