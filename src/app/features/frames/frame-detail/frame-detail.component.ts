import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Frame, FrameService } from '../../../services/frame';

@Component({
  selector: 'app-frame-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frame-detail.html',
  styleUrl: './frame-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameDetailComponent implements OnInit {
  frame: (Frame & { sanitizedImageUrl: SafeUrl }) | undefined;

  constructor(
    private route: ActivatedRoute,
    @Inject(FrameService) private frameService: FrameService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
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
          }
          this.cdr.detectChanges(); // Manually trigger change detection
        });
      }
    });
  }

  selectLenses(): void {
    this.router.navigate(['/lenses']);
  }
}
