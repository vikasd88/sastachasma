import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { finalize } from 'rxjs/operators';
import { Order, OrderStatus, OrderStatusType } from '../../models/order.model'; // Updated imports
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faSpinner, faCheckCircle, faTruck, faClock, faTimesCircle, faSearch, faHeadset, faPrint, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { CartItem } from '../../models/product.model'; // Corrected import
import { OrderItem } from '../../models/order.model'; // Added import for OrderItem

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    TitleCasePipe
  ],
  templateUrl: './track-order.html',
  styleUrls: ['./track-order.css']
})
export class TrackOrderComponent implements OnInit {
  // Font Awesome icons
  faSpinner: IconDefinition = faSpinner;
  faCheckCircle: IconDefinition = faCheckCircle;
  faTruck: IconDefinition = faTruck;
  faClock: IconDefinition = faClock;
  faTimesCircle: IconDefinition = faTimesCircle;
  faSearch: IconDefinition = faSearch;
  faHeadset: IconDefinition = faHeadset;
  faPrint: IconDefinition = faPrint;
  faMapMarkerAlt: IconDefinition = faMapMarkerAlt;

  // Component state
  trackForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  order: Order | null = null; // Changed to Order type
  currentStatus: OrderStatus | null = null;

  // Order status tracking
  readonly statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const; // Changed to uppercase

  // Inject services
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.trackForm = this.fb.group({
      orderNumber: ['', [Validators.required, Validators.minLength(3)]], // Changed orderId to orderNumber
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.checkRouteParams();
  }

  private checkRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      const orderNumber = params['orderNumber']; // Changed orderId to orderNumber
      const email = params['email'];

      if (orderNumber) {
        this.trackForm.patchValue({ orderNumber }); // Changed orderId to orderNumber

        if (email) {
          this.trackForm.patchValue({ email });
          this.onTrackOrder();
        }
      }
    });
  }

  onTrackOrder(): void {
    if (this.trackForm.invalid) {
      this.trackForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { orderNumber, email } = this.trackForm.value; // Changed orderId to orderNumber

    this.orderService.getOrderDetails(orderNumber) // Changed orderId to orderNumber
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (order: Order) => { // Changed order:any to order:Order
          if (order) {
            this.order = order;
            this.currentStatus = this.getLatestStatus(order.statusHistory);
            this.updateUrl(order.orderNumber, email); // Changed orderId to order.orderNumber
          } else {
            this.error = 'Order not found. Please check your details and try again.';
          }
        },
        error: (err: any) => {
          console.error('Error tracking order:', err);
          this.error = err?.message || 'Failed to track order. Please try again.';
        }
      });
  }

  private getLatestStatus(statusHistory: OrderStatus[] | undefined): OrderStatus | null {
    if (!statusHistory || statusHistory.length === 0) return null;

    // Make a copy before sorting to avoid mutating the original array
    const sorted = [...statusHistory].sort((a, b) => {
      const dateA = new Date(a.statusDate).getTime(); // Changed a.date to a.statusDate
      const dateB = new Date(b.statusDate).getTime(); // Changed b.date to b.statusDate
      return dateB - dateA;
    });

    return sorted[0] || null;
  }

  private updateUrl(orderNumber: string, email: string): void { // Changed orderId to orderNumber
    const queryParams: { orderNumber: string; email?: string } = { orderNumber }; // Changed orderId to orderNumber
    if (email) {
      queryParams.email = email;
    }

    this.router.navigate([], {
      relativeTo: this.router.routerState.root,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-pending';

    const statusLower = status.toLowerCase();

    if (statusLower.includes('delivered')) return 'status-delivered';
    if (statusLower.includes('shipped')) return 'status-shipped';
    if (statusLower.includes('process')) return 'status-processing';
    if (statusLower.includes('cancel')) return 'status-cancelled';

    return 'status-pending';
  }

  getStatusIcon(status: string | undefined): string {
    if (!status) return 'clock';

    const statusLower = status.toLowerCase();

    if (statusLower.includes('delivered')) return 'check-circle';
    if (statusLower.includes('shipped')) return 'truck';
    if (statusLower.includes('process')) return 'spinner';
    if (statusLower.includes('cancel')) return 'times-circle';

    return 'clock';
  }

  // Helper to get the actual icon component
  getStatusFaIcon(status: string | undefined): IconDefinition {
    if (!status) return faClock;
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return faCheckCircle;
    if (statusLower.includes('shipped')) return faTruck;
    if (statusLower.includes('process')) return faSpinner;
    if (statusLower.includes('cancel')) return faTimesCircle;
    return faClock;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';

      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }

  isStatusActive(status: string | undefined): boolean {
    if (!status || !this.currentStatus?.status) return false;

    const currentStatus = this.currentStatus.status.toUpperCase(); // Changed toUpperCase
    const checkStatus = status.toUpperCase(); // Changed toUpperCase

    // If status is the same as current status
    if (currentStatus === checkStatus) return true;

    // Check status order
    const currentIndex = this.statuses.indexOf(currentStatus as any);
    const checkIndex = this.statuses.indexOf(checkStatus as any);

    return currentIndex >= 0 && checkIndex >= 0 && currentIndex >= checkIndex;
  }

  isStatusCompleted(status: string | undefined): boolean {
    if (!status || !this.currentStatus?.status) return false;

    const currentStatus = this.currentStatus.status.toUpperCase(); // Changed toUpperCase
    const checkStatus = status.toUpperCase(); // Changed toUpperCase

    // If checking the current status, it's not completed yet
    if (currentStatus === checkStatus) return false;

    // Check status order
    const currentIndex = this.statuses.indexOf(currentStatus as any);
    const checkIndex = this.statuses.indexOf(checkStatus as any);

    return currentIndex > checkIndex && checkIndex >= 0;
  }

  getOrderSubtotal(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce((acc, item) => acc + ((item.unitPrice || 0) * (item.quantity || 1)) + (item.lensPrice || 0), 0); // Updated to unitPrice and lensPrice
  }

  getOrderTotal(): number {
    if (!this.order) return 0;
    return this.order.totalAmount || 0; // Use totalAmount directly
  }

  // Removed getStatusLocation
  // getStatusLocation(status: string): string {
  //   if (!this.order?.statusHistory?.length) return '';
  //   const statusEntry = this.order.statusHistory.find(
  //     (s: OrderStatus) => s.status.toLowerCase() === status.toLowerCase()
  //   );
  //   return statusEntry?.location || '';
  // }

  printOrder(): void {
    window.print();
  }

  contactSupport(): void {
    this.router.navigate(['/contact'], {
      queryParams: { subject: `Order Inquiry - ${this.order?.orderNumber || ''}` } // Changed orderId to orderNumber
    });
  }

  getProductImage(item: OrderItem): string {
    return item.imageUrl || '/assets/images/placeholder.jpg'; // Provide a placeholder image
  }

  calculateItemSubtotal(item: OrderItem): number {
    return ((item.unitPrice || 0) * (item.quantity || 1)) + (item.lensPrice || 0);
  }

  getPaymentMethod(): string {
    if (!this.order?.paymentStatus) return 'N/A';
    // Assuming paymentStatus can be mapped to a human-readable method
    // For now, return the status directly. In a real app, you might have a dedicated paymentMethod field.
    return this.order.paymentStatus;
  }
}
