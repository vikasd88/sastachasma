import { Routes } from '@angular/router';

export const routes: Routes = [
  // 🏠 Home (Frame Catalogue)
  {
    path: '',
    loadComponent: () =>
      import('./features/frames/frame-list/frame-list.component')
        .then(m => m.FrameListComponent),
    data: { title: 'Sasta Chasma - Eyeglasses & Lenses', description: 'Discover affordable and stylish eyeglasses, frames, and lenses at Sasta Chasma. Find your perfect pair today!' }
  },

  // 👓 Frame details
  {
    path: 'frames/:id',
    loadComponent: () =>
      import('./features/frames/frame-detail/frame-detail.component')
        .then(m => m.FrameDetailComponent),
    data: { title: 'Frame Details - Sasta Chasma', description: 'View detailed information about our premium eyeglasses frames. Choose from a wide range of styles and materials.' } // This can be made dynamic later
  },

  // 🔍 Lens selection
  {
    path: 'lenses',
    loadComponent: () =>
      import('./features/lenses/lens-options/lens-options.component')
        .then(m => m.LensOptionsComponent),
    data: { title: 'Select Lenses - Sasta Chasma', description: 'Explore our selection of high-quality lenses for all your vision needs. Find single vision, bifocal, and progressive lenses.' }
  },
  {
    path: 'lenses/:id',
    loadComponent: () =>
      import('./features/lenses/lens-detail/lens-detail.component')
        .then(m => m.LensDetailComponent),
    data: { title: 'Lens Details - Sasta Chasma', description: 'Get detailed specifications and pricing for our various lens options. Customize your lenses with coatings and treatments.' } // This can be made dynamic later
  },

  // 🛒 Cart & Checkout
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart/cart.component')
        .then(m => m.CartComponent),
    data: { title: 'Your Shopping Cart - Sasta Chasma', description: 'Review your selected eyeglasses, frames, and lenses in your shopping cart. Proceed to checkout for a seamless purchase.' }
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/cart/checkout/checkout.component')
        .then(m => m.CheckoutComponent),
    data: { title: 'Checkout - Sasta Chasma', description: 'Complete your purchase by providing customer and delivery details. Fast and secure checkout process for your order.' }
  },

  // 📦 Orders
  {
    path: 'order-summary',
    loadComponent: () =>
      import('./features/orders/order-summary/order-summary.component')
        .then(m => m.OrderSummaryComponent),
    data: { title: 'Order Summary - Sasta Chasma', description: 'View the summary of your recent order from Sasta Chasma. Confirm your items, customer details, and delivery address.' }
  },
  {
    path: 'order-history',
    loadComponent: () =>
      import('./features/orders/order-history/order-history.component')
        .then(m => m.OrderHistoryComponent),
    data: { title: 'Order History - Sasta Chasma', description: 'Track all your past orders with Sasta Chasma. Easily reorder your favorite eyeglasses and lenses.' }
  },

  // 🔐 Authentication
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent),
    data: { title: 'Login - Sasta Chasma', description: 'Log in to your Sasta Chasma account to manage your orders, wish list, and personal information.' }
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent),
    data: { title: 'Register - Sasta Chasma', description: 'Create a new account with Sasta Chasma to enjoy personalized shopping experience and exclusive offers.' }
  },

  // ❌ 404 Page
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
    data: { title: 'Page Not Found - Sasta Chasma', description: 'The page you are looking for on Sasta Chasma could not be found. Please check the URL or navigate back to the homepage.' }
  }
];
