import { Injectable } from '@angular/core';

export interface Frame {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class FrameService {
  private frames: Frame[] = [
    {
      id: 1,
      name: 'Classic Aviator',
      description: 'Timeless design with a modern touch.',
      price: 120,
      imageUrl: 'https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/628x301/9df78eab33525d08d6e5fb8d27136e95//l/i/grey-transparent-black-grey-full-rim-rectangle-lenskart-air-air-classic-la-e14572-c3-eyeglasses_g_4416_6_14_22.jpg',
    },
    {
      id: 2,
      name: 'Stylish Wayfarer',
      description: 'Bold and iconic, perfect for any occasion.',
      price: 110,
      imageUrl: 'https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//l/i/lenskart-studio-lk-e17250-c1-eyeglass__dsc9599.jpg',
    },
    {
      id: 3,
      name: 'Modern Round',
      description: 'Chic and sophisticated, a contemporary classic.',
      price: 130,
      imageUrl: 'https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//l/i/lenskart-air-la-e15417-w-c1-eyeglasses_csvfile-1701688470121-img_7893.jpg',
    },
  ];

  getFrames(): Promise<Frame[]> {
    return Promise.resolve(this.frames);
  }

  getFrameById(id: number): Promise<Frame | undefined> {
    return Promise.resolve(this.frames.find((frame) => frame.id === id));
  }
}
