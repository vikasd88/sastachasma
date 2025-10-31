import { Injectable } from '@angular/core';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  date: Date;
  customerName: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders: Order[] = [];
  private lastOrder: Order | undefined;

  placeOrder(items: OrderItem[], total: number, customerName: string, deliveryAddress: { street: string; city: string; state: string; zip: string }): Promise<Order> {
    console.log('Placing order:', items, total, customerName, deliveryAddress);
    const newOrder: Order = {
      id: this.orders.length + 1,
      items,
      total,
      date: new Date(),
      customerName,
      deliveryAddress,
    };
    this.orders.push(newOrder);
    this.lastOrder = newOrder;
    return Promise.resolve(newOrder);
  }

  getOrderHistory(): Promise<Order[]> {
    return Promise.resolve(this.orders);
  }

  getOrderById(id: number): Promise<Order | undefined> {
    return Promise.resolve(this.orders.find((order) => order.id === id));
  }

  getLastOrder(): Promise<Order | undefined> {
    return Promise.resolve(this.lastOrder);
  }
}
