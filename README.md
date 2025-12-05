# L'Riyu Luxury Steps

**"Steps that suit you."**

L'Riyu Luxury Steps is a premium e-commerce platform dedicated to handcrafted luxury footwear. Inspired by the legendary Italian shoemaking traditions, we offer a curated collection of shoes that blend timeless artistry with modern comfort and durability.

Built with a cutting-edge tech stack including **React**, **TypeScript**, **Vite**, and **Supabase**, this project demonstrates a robust, secure, and responsive e-commerce application. It features a seamless shopping experience, from browsing our exclusive "Featured Collection" to a secure checkout process, all managed via a comprehensive Admin Dashboard.

## Features

- **User Authentication**: Secure sign-up and sign-in functionality using Supabase Auth.
- **Product Catalog**: Browse a curated collection of luxury shoes with filtering and detailed views.
- **Shopping Cart**: Add items to cart, manage quantities, and review totals.
- **Checkout Process**: Streamlined checkout with delivery details and order summary.
- **Admin Dashboard**: Comprehensive admin panel to manage products (CRUD) and view/update order statuses.
- **Responsive Design**: Fully responsive interface optimized for desktop, tablet, and mobile devices.
- **Secure Backend**: Row Level Security (RLS) policies ensure data privacy and integrity.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: React Context API
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lriyu-luxury-steps
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Set up Environment Variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Application pages (Home, Shop, Admin, etc.)
- `src/contexts`: React Context providers (AuthContext, etc.)
- `src/hooks`: Custom React hooks
- `src/integrations/supabase`: Supabase client and types
- `supabase/migrations`: Database schema and RLS policies

## Security

This project uses Supabase Row Level Security (RLS) to protect data.
- User profiles are only editable by the user.
- Orders are only visible to the user who placed them (and admins).
- Product management is restricted to users with the 'admin' role.
