import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Frame, FrameService } from '../../../services/frame';

@Component({
  selector: 'app-frame-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frame-list.html',
  styleUrl: './frame-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameListComponent implements OnInit {
  frames: (Frame & { sanitizedImageUrl: SafeUrl })[] = [];

  constructor(
    private router: Router,
    @Inject(FrameService) private frameService: FrameService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.frameService.getFrames().then((frames: Frame[]) => {
      this.frames = frames.map(frame => ({
        ...frame,
        sanitizedImageUrl: this.sanitizer.bypassSecurityTrustUrl(frame.imageUrl)
      }));
      this.cdr.detectChanges(); // Manually trigger change detection
    });
  }

  selectFrame(id: number): void {
    this.router.navigate(['/frames', id]);
  }
}
