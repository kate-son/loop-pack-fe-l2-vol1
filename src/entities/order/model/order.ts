/**
 * 주문 도메인 타입.
 *
 * 세션 타입과 같은 이유로 app 레이어에서 내려왔다. 주문 응답에는 금액이 없고
 * 상품 id는 형식만 검증되므로(`p1`~`p30`), 화면에 금액을 보이려면 상품 데이터에서
 * 따로 계산해야 한다.
 */

export type OrderItem = {
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
};

export type OrderCreateRequest = {
  items: OrderItem[];
};

export type OrderCreateResponse = {
  order: Order;
};

export type OrderListResponse = {
  orders: Order[];
};
