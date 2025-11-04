import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { ProductCardComponent } from '../../shared/product-card/product-card';

interface Testimonial {
  id: number;
  content: string;
  author: string;
  location: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  loading: boolean = true;
  testimonials: Testimonial[] = [
    {
      id: 1,
      content: 'Got my ₹499 glasses in just 2 days! The quality is amazing for the price. Will definitely buy again.',
      author: 'Rahul Mehta',
      location: 'Delhi',
      imageUrl: 'assets/images/testimonial-1.jpg'
    },
    {
      id: 2,
      content: 'The anti-glare coating is perfect for my work. Got exactly what I needed at half the price of other stores.',
      author: 'Priya Sharma',
      location: 'Bangalore',
      imageUrl: 'assets/images/testimonial-2.jpg'
    },
    {
      id: 3,
      content: 'Amazing service and quality! I\'m very satisfied with my purchase.',
      author: 'Amit Patel',
      location: 'Mumbai'
    }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(products => {
      this.featuredProducts = products.slice(0, 4);
      this.loading = false;
    });
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    return names[0].charAt(0).toUpperCase() + (names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '');
  }

  getInitialsStyle(name: string): any {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F', '#E6A157'];
    const charCode = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[charCode % colors.length];
    
    return {
      'background-color': color,
      'color': 'white',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'width': '40px',
      'height': '40px',
      'border-radius': '50%',
      'font-weight': 'bold',
      'font-size': '16px'
    };
  }

}
