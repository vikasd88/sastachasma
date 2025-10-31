import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Lens, LensService } from '../../../services/lens';

@Component({
  selector: 'app-lens-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lens-options.html',
  styleUrl: './lens-options.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LensOptionsComponent implements OnInit {
  lenses: (Lens & { sanitizedImageUrl: SafeUrl })[] = [];

  constructor(
    @Inject(LensService) private lensService: LensService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.lensService.getLenses().then((lenses: Lens[]) => {
      this.lenses = lenses.map(lens => ({
        ...lens,
        sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(lens.imageUrl)
      }));
      this.cdr.detectChanges(); // Manually trigger change detection
    });
  }

  selectLens(id: number): void {
    this.router.navigate(['/lenses', id]);
  }
}
