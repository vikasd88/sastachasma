import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core'; // Import ChangeDetectorRef
import { Router, RouterLink } from '@angular/router'; // Import RouterLink for routerLink directive
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // Import CommonModule for async pipe or ngIf
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(private router: Router, @Inject(CartService) private cartService: CartService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cartService.cartChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cartItems: any) => {
        console.log('Navbar received cartItems:', cartItems);
        this.cartItemCount = cartItems.reduce((sum: any, item: any) => sum + item.quantity, 0);
        console.log('Calculated cartItemCount:', this.cartItemCount);
        this.cdr.detectChanges(); // Force UI update
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
