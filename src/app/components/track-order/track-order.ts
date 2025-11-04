import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { finalize } from 'rxjs/operators';
import { OrderDetails, OrderStatus } from '../../models/order.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faSpinner, faCheckCircle, faTruck, faClock, faTimesCircle, faSearch, faHeadset, faPrint, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

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
  errorMessage: string | null = null;
  order: OrderDetails | null = null;
  currentStatus: OrderStatus | null = null;

  // Order status tracking
  readonly statuses = ['processing', 'shipped', 'delivered'] as const;

  // Inject services
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.trackForm = this.fb.group({
      orderId: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.checkRouteParams();
  }

  private checkRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      const email = params['email'];

      if (orderId) {
        this.trackForm.patchValue({ orderId });

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
    this.errorMessage = null;

    const { orderId, email } = this.trackForm.value;

    this.orderService.trackOrder(orderId, email)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (order) => {
          if (order) {
            this.order = order;
            this.currentStatus = this.getLatestStatus(order.statusHistory);
            this.updateUrl(orderId, email);
          } else {
            this.errorMessage = 'Order not found. Please check your details and try again.';
          }
        },
        error: (err) => {
          console.error('Error tracking order:', err);
          this.errorMessage = err?.message || 'Failed to track order. Please try again.';
        }
      });
  }

  private getLatestStatus(statusHistory: OrderStatus[] | undefined): OrderStatus | null {
    if (!statusHistory || statusHistory.length === 0) return null;

    // Make a copy before sorting to avoid mutating the original array
    const sorted = [...statusHistory].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return sorted[0] || null;
  }

  private updateUrl(orderId: string, email: string): void {
    const queryParams: { orderId: string; email?: string } = { orderId };
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

    const currentStatus = this.currentStatus.status.toLowerCase();
    const checkStatus = status.toLowerCase();

    // If status is the same as current status
    if (currentStatus === checkStatus) return true;

    // Check status order
    const currentIndex = this.statuses.indexOf(currentStatus as any);
    const checkIndex = this.statuses.indexOf(checkStatus as any);

    return currentIndex >= 0 && checkIndex >= 0 && currentIndex >= checkIndex;
  }

  isStatusCompleted(status: string | undefined): boolean {
    if (!status || !this.currentStatus?.status) return false;

    const currentStatus = this.currentStatus.status.toLowerCase();
    const checkStatus = status.toLowerCase();

    // If checking the current status, it's not completed yet
    if (currentStatus === checkStatus) return false;

    // Check status order
    const currentIndex = this.statuses.indexOf(currentStatus as any);
    const checkIndex = this.statuses.indexOf(checkStatus as any);

    return currentIndex > checkIndex && checkIndex >= 0;
  }

  getOrderSubtotal(): number {
    if (!this.order?.items?.length) return 0;
    return this.order.items.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      return sum + (price * quantity);
    }, 0);
  }

  getOrderTotal(): number {
    const subtotal = this.getOrderSubtotal();
    const shipping = this.order?.shippingMethod?.price || 0;
    const discount = this.order?.discount || 0;

    return subtotal + shipping - discount;
  }

  getStatusDate(status: string): Date | null {
    if (!this.order?.statusHistory?.length) return null;

    const statusEntry = this.order.statusHistory.find(
      s => s.status.toLowerCase() === status.toLowerCase()
    );

    return statusEntry?.date ? new Date(statusEntry.date) : null;
  }

  getStatusLocation(status: string): string {
    if (!this.order?.statusHistory?.length) return '';

    const statusEntry = this.order.statusHistory.find(
      s => s.status.toLowerCase() === status.toLowerCase()
    );

    return statusEntry?.location || '';
  }

  printOrder(): void {
    window.print();
  }

  contactSupport(): void {
    this.router.navigate(['/contact'], {
      queryParams: { subject: `Order Inquiry - ${this.order?.orderId || ''}` }
    });
  }
}
