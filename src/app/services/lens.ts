import { Injectable } from '@angular/core';

export interface Lens {
  id: number;
  type: string;
  material: string;
  price: number;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class LensService {
  private lenses: Lens[] = [
    {
      id: 1,
      type: 'Single Vision',
      material: 'Plastic',
      price: 50,
      description: 'Basic lenses for general use.',
      imageUrl: 'https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//l/i/lenskart-air-la-e15417-w-c1-eyeglasses_csvfile-1701688470121-img_7893.jpg',
    },
    {
      id: 2,
      type: 'Progressive',
      material: 'Polycarbonate',
      price: 150,
      description: 'Multi-focal lenses for clear vision at all distances.',
      imageUrl: 'https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//l/i/lenskart-studio-lk-e17250-c1-eyeglass__dsc9599.jpg',
    },
    {
      id: 3,
      type: 'Blue Light Filtering',
      material: 'High-Index',
      price: 100,
      description: 'Protects eyes from digital screen strain.',
      imageUrl: 'https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/628x301/9df78eab33525d08d6e5fb8d27136e95//l/i/grey-transparent-black-grey-full-rim-rectangle-lenskart-air-air-classic-la-e14572-c3-eyeglasses_g_4416_6_14_22.jpg',
    },
  ];

  getLenses(): Promise<Lens[]> {
    return Promise.resolve(this.lenses);
  }

  getLensById(id: number): Promise<Lens | undefined> {
    return Promise.resolve(this.lenses.find((lens) => lens.id === id));
  }
}
