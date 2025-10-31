import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Lens, LensService } from '../../../services/lens';
import { CartItem, CartService } from '../../../services/cart';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lens-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lens-detail.html',
  styleUrl: './lens-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LensDetailComponent implements OnInit, OnDestroy {
  lens: (Lens & { sanitizedImageUrl: SafeUrl }) | undefined;
  quantity: number = 1;
  otherLenses: (Lens & { sanitizedImageUrl: SafeUrl })[] = []; // New property for other lenses
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    @Inject(LensService) private lensService: LensService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    @Inject(CartService) private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.lensService.getLensById(id).then((lens: Lens | undefined) => {
          if (lens) {
            this.lens = {
              ...lens,
              sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(lens.imageUrl)
            };

            // Fetch all lenses and filter out the current one
            this.lensService.getLenses().then((allLenses: Lens[]) => {
              this.otherLenses = allLenses
                .filter(otherLens => otherLens.id !== id)
                .map(otherLens => ({
                  ...otherLens,
                  sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(otherLens.imageUrl)
                }));
              this.cdr.detectChanges(); // Manually trigger change detection
            });

          } else {
            this.otherLenses = []; // Clear other lenses if main lens not found
          }
          this.cdr.detectChanges(); // Manually trigger change detection for main lens
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToCart(): void {
    if (this.lens) {
      const cartItem: CartItem = {
        id: this.lens.id,
        name: this.lens.type,
        price: this.lens.price,
        quantity: this.quantity,
        imageUrl: this.lens.imageUrl
      };
      this.cartService.addToCart(cartItem).then(() => {
        console.log(`Added ${this.lens?.type} to cart.`);
        // Optionally show a confirmation message or update cart icon
        this.cdr.detectChanges(); // Manually trigger change detection if cart icon/count is present
      });
    }
  }

  addOtherLensToCart(lens: Lens): void {
    const cartItem: CartItem = {
      id: lens.id,
      name: lens.type,
      price: lens.price,
      quantity: 1, // Default quantity for other lenses
      imageUrl: lens.imageUrl
    };
    this.cartService.addToCart(cartItem).then(() => {
      // Optionally show a confirmation message or update cart icon
      console.log(`Added ${lens.type} to cart.`);
      this.cdr.detectChanges(); // Update UI if cart icon/count is present
    });
  }

  viewOtherLensDetails(id: number): void {
    this.router.navigate(['/lenses', id]);
  }
}
