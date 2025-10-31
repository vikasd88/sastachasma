import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Frame, FrameService } from '../../../services/frame';
import { Lens, LensService } from '../../../services/lens'; // Import LensService and Lens
import { CartService } from '../../../services/cart'; // Import CartService
import { ConfiguredProduct } from '../../../shared/models/configured-product'; // Corrected import path
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-frame-detail',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule for ngModel
  templateUrl: './frame-detail.html',
  styleUrl: './frame-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameDetailComponent implements OnInit {
  frame: (Frame & { sanitizedImageUrl: SafeUrl }) | undefined;
  allLenses: Lens[] = [];
  selectedLens: Lens | undefined;
  power: number = 0;
  quantity: number = 1;
  otherFrames: (Frame & { sanitizedImageUrl: SafeUrl })[] = []; // New property for other frames

  constructor(
    private route: ActivatedRoute,
    @Inject(FrameService) private frameService: FrameService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    @Inject(LensService) private lensService: LensService, // Inject LensService
    @Inject(CartService) private cartService: CartService // Inject CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.frameService.getFrameById(id).then((frame: Frame | undefined) => {
          if (frame) {
            this.frame = {
              ...frame,
              sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(frame.imageUrl)
            };
            // Fetch all lenses and set the first one as selected by default
            this.lensService.getLenses().then((lenses: Lens[]) => {
              this.allLenses = lenses;
              if (this.allLenses.length > 0) {
                this.selectedLens = this.allLenses[0];
              }
              this.cdr.detectChanges();
            });

            // Fetch all frames and filter out the current one
            this.frameService.getFrames().then((allFrames: Frame[]) => {
              this.otherFrames = allFrames
                .filter(otherFrame => otherFrame.id !== id)
                .map(otherFrame => ({
                  ...otherFrame,
                  sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(otherFrame.imageUrl)
                }));
              this.cdr.detectChanges();
            });
          }
          this.cdr.detectChanges(); // Manually trigger change detection
        });
      }
    });
  }

  onLensSelect(event: Event): void {
    const selectedId = Number((event.target as HTMLSelectElement).value);
    this.selectedLens = this.allLenses.find(lens => lens.id === selectedId);
    this.cdr.detectChanges();
  }

  onPowerChange(event: Event): void {
    this.power = Number((event.target as HTMLInputElement).value);
    this.cdr.detectChanges();
  }

  addToCart(): void {
    if (this.frame && this.selectedLens && this.quantity > 0) {
      const configuredProduct: ConfiguredProduct = {
        id: `${this.frame.id}-${this.selectedLens.id}-${this.power}`,
        frame: this.frame,
        lens: this.selectedLens,
        power: this.power,
        quantity: this.quantity,
        totalPrice: (this.frame.price + this.selectedLens.price) * this.quantity,
      };
      this.cartService.addToCart(configuredProduct).then(() => {
        console.log('Added configured product to cart:', configuredProduct);
        // Optionally navigate to cart or show a confirmation
        // this.router.navigate(['/cart']);
      });
    }
  }

  addOtherFrameToCart(frame: Frame): void {
    // When adding another frame, use a default lens (the first one available) and default power
    if (this.allLenses.length > 0) {
      const defaultLens = this.allLenses[0];
      const configuredProduct: ConfiguredProduct = {
        id: `${frame.id}-${defaultLens.id}-0`, // Default power 0
        frame: frame,
        lens: defaultLens,
        power: 0, // Default power for other frames
        quantity: 1, // Default quantity
        totalPrice: (frame.price + defaultLens.price) * 1,
      };
      this.cartService.addToCart(configuredProduct).then(() => {
        console.log(`Added other frame ${frame.name} to cart.`);
        // Optionally show a confirmation message or update cart icon
        this.cdr.detectChanges();
      });
    }
  }

  viewOtherFrameDetails(id: number): void {
    this.router.navigate(['/frames', id]);
  }

  // selectLenses() is removed as lens selection is integrated
}
