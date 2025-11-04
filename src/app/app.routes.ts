import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home/home';
import { ProductListComponent } from './components/product-list/product-list/product-list';
import { ProductDetailComponent } from './components/product-detail/product-detail/product-detail';
import { CartComponent } from './components/cart/cart/cart';
import { CheckoutComponent } from './components/checkout/checkout/checkout';
import { LensCustomizationComponent } from './components/lens-customization/lens-customization/lens-customization';
import { OrderSummaryComponent } from './components/order-summary/order-summary';
import { TrackOrderComponent } from './components/track-order/track-order';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'customize/:id', component: LensCustomizationComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order-summary', component: OrderSummaryComponent },
  { path: 'track-order', component: TrackOrderComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' } // Wildcard route for a 404-like experience
];
