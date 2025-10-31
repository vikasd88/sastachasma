import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Order, OrderService } from '../../../services/order';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    @Inject(OrderService) private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.orderService.getOrderHistory().then((orders: Order[]) => {
      this.orders = orders;
      this.cdr.detectChanges();
    });
  }

  viewOrder(id: number): void {
    // For now, navigating to order-summary, but ideally this would be a specific order-detail page
    this.router.navigate(['/order-summary']);
  }
}
