import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Order, OrderItem, OrderService } from '../../../services/order';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummaryComponent implements OnInit {
  public order: Order | undefined;

  constructor(
    @Inject(OrderService) private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.orderService.getLastOrder().then((lastOrder: Order | undefined) => {
      this.order = lastOrder;
      this.cdr.detectChanges();
    });
  }

  public goToHome(): void {
    this.router.navigate(['/']);
  }
}
