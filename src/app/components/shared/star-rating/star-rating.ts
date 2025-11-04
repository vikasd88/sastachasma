import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  imports: [CommonModule],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() readonly: boolean = true;
  @Input() showCount: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars: { filled: boolean; partialWidth: string }[] = [];

  ngOnInit() {
    this.calculateStars();
  }

  ngOnChanges() {
    this.calculateStars();
  }

  calculateStars() {
    this.stars = [];
    for (let i = 1; i <= this.maxRating; i++) {
      let partialWidth = '0%';
      let isFilled = false;

      if (i <= this.rating) {
        isFilled = true;
      } else if (i - 1 < this.rating && this.rating < i) {
        partialWidth = `${(this.rating - (i - 1)) * 100}%`;
      }

      this.stars.push({ filled: isFilled, partialWidth: partialWidth });
    }
  }

  rate(star: number) {
    if (!this.readonly) {
      this.rating = star;
      this.ratingChange.emit(this.rating);
      this.calculateStars();
    }
  }

}
