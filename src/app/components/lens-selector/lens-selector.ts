import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Lens } from '../../models/lens.model';
import { LensService } from '../../services/lens.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lens-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './lens-selector.html',
  styleUrl: './lens-selector.css',
})
export class LensSelector implements OnInit {
  @Input() selectedLensId: number | null = null;
  @Output() lensSelected = new EventEmitter<Lens>();
  
  lenses: Lens[] = [];
  loading = true;
  error: string | null = null;

  constructor(private lensService: LensService) {}

  public get selectedLensDescription(): string {
    const selectedLens = this.lenses.find(l => l.id === this.selectedLensId);
    return selectedLens ? selectedLens.description : '';
  }

  ngOnInit(): void {
    this.loadLenses();
  }

  public loadLenses(): void {
    this.loading = true;
    this.error = null;
    
    this.lensService.getLenses().subscribe({
      next: (lenses) => {
        this.lenses = lenses;
        // If a lens is already selected but not in the loaded lenses, try to load it
        if (this.selectedLensId) {
          const selectedLens = this.lenses.find(l => l.id === this.selectedLensId);
          if (selectedLens) {
            this.lensSelected.emit(selectedLens);
          } else {
            this.lensService.getLensById(this.selectedLensId).subscribe(lens => {
              if (lens) {
                this.lenses.push(lens);
                this.lensSelected.emit(lens);
              }
            });
          }
        }
      },
      error: (err) => {
        console.error('Failed to load lenses', err);
        this.error = 'Failed to load lens options. Please try again later.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onLensSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const lensId = Number(select.value);
    const selectedLens = this.lenses.find(lens => lens.id === lensId);
    
    if (selectedLens) {
      this.lensSelected.emit(selectedLens);
    }
  }
}
