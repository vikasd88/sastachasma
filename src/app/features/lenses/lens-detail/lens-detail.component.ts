import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Lens, LensService } from '../../../services/lens';
import { CartService } from '../../../services/cart';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ConfiguredProduct } from '../../../shared/models/configured-product';

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
      const configuredProduct: ConfiguredProduct = {
        id: `${this.lens.id}-single-lens-0`, // Unique ID for single lens product
        frame: { id: 0, name: 'No Frame', description: '', price: 0, imageUrl: '' }, // Placeholder for frame
        lens: this.lens,
        power: 0, // Default power for single lens
        quantity: this.quantity,
        totalPrice: this.lens.price * this.quantity,
      };
      this.cartService.addToCart(configuredProduct).then(() => {
        console.log(`Added ${this.lens?.type} to cart.`);
        // Optionally show a confirmation message or update cart icon
        this.cdr.detectChanges(); // Manually trigger change detection if cart icon/count is present
      });
    }
  }

  addOtherLensToCart(lens: Lens): void {
    const configuredProduct: ConfiguredProduct = {
      id: `${lens.id}-single-lens-0`, // Unique ID for single lens product
      frame: { id: 0, name: 'No Frame', description: '', price: 0, imageUrl: '' }, // Placeholder for frame
      lens: lens,
      power: 0, // Default power for single lens
      quantity: 1, // Default quantity for other lenses
      totalPrice: lens.price * 1,
    };
    this.cartService.addToCart(configuredProduct).then(() => {
      // Optionally show a confirmation message or update cart icon
      console.log(`Added ${lens.type} to cart.`);
      this.cdr.detectChanges(); // Update UI if cart icon/count is present
    });
  }

  viewOtherLensDetails(id: number): void {
    this.router.navigate(['/lenses', id]);
  }
}
