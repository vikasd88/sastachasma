# Spectacles Store - Angular E-commerce Project User Guide

This guide provides instructions on how to run and interact with the Spectacles Store e-commerce application built with Angular.

## Project Overview

The Spectacles Store is a responsive e-commerce website for selling affordable spectacles, inspired by SastaChasma.com. It features a clean, modern UI (white, blue, and gray theme) and a complete shopping flow using dummy API services for product data.

**Key Features:**

- **Homepage:** Displays featured products and value propositions.
- **Product List:** Allows browsing and filtering of spectacles.
- **Product Detail:** Shows detailed information about a selected spectacle.
- **Lens Customization:** A dedicated page to select lens type before adding to cart.
- **Cart:** Manages selected items, allowing quantity updates and removal.
- **Checkout:** A dummy checkout flow for shipping information and order placement.

## Getting Started

The application is currently running in a development server and is publicly accessible via the following URL:

**Live Preview URL:** [https://43707-igiod9z5bkf4t8ew1x9y0-97bd73a2.manus-asia.computer](https://43707-igiod9z5bkf4t8ew1x9y0-97bd73a2.manus-asia.computer)

### Local Setup (If you wish to run it locally)

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) (version 18+) and [Angular CLI](https://angular.io/cli) installed globally.
2.  **Clone the repository:** (Not applicable in this sandbox, but for a real-world scenario)
3.  **Install dependencies:**
    ```bash
    cd /home/ubuntu/spectacles-store
    npm install
    ```
4.  **Run the development server:**
    ```bash
    ng serve --open
    ```
    The application will automatically open in your browser at `http://localhost:4200/` (or a different port if 4200 is in use).

## How to Use the Application

1.  **Browse Products:**
    - Click on the **"Shop Now"** button on the homepage or the **"Products"** link in the header.
    - Use the sidebar filters (Brand, Shape, Color) to narrow down the product list.
2.  **View Details & Customize:**
    - Click on any product card or the **"View Details"** button to go to the Product Detail page.
    - Click **"Select Lenses & Buy"** to proceed to the Lens Customization page.
3.  **Customize Lenses:**
    - Select a lens type (e.g., Single Vision, Bifocal, Progressive). The price will update automatically.
    - Adjust the quantity.
    - Click **"Add to Cart"**.
4.  **Manage Cart:**
    - Click the **Cart icon** in the header to view your shopping cart.
    - Update the quantity of any item or remove items from the cart.
    - Click **"Proceed to Checkout"**.
5.  **Checkout:**
    - Fill in the dummy shipping information.
    - Select the payment method (only Cash on Delivery is active for this dummy project).
    - Click **"Place Order"**. A success message will appear, and the cart will be cleared.

## Project Structure Highlights

The project follows standard Angular conventions:

- `src/app/models/product.model.ts`: TypeScript interfaces for `Product`, `Lens`, and `CartItem`.
- `src/app/services/product.service.ts`: Dummy API service to fetch product and lens data from `products.json`.
- `src/app/services/cart.service.ts`: State management for the shopping cart using RxJS `BehaviorSubject`.
- `src/app/components/`: Contains all feature and shared components.
  - `home/`, `product-list/`, `product-detail/`, `lens-customization/`, `cart/`, `checkout/`: Feature components.
  - `shared/`: Reusable components like `Header`, `Footer`, `ProductCard`, and `StarRating`.
- `src/styles.css`: Global styles defining the white, blue, and gray theme, along with utility classes for responsiveness.
- `src/assets/data/products.json`: The source of all dummy product and lens data.

This concludes the user guide. Enjoy exploring the Spectacles Store!
