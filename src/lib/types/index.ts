export type UserRole = 'customer' | 'vendor' | 'admin' | 'delivery_partner';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate: number;
  total_sales: number;
  total_revenue: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  children?: Category[];
  product_count?: number;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  weight: number | null;
  rating: number;
  rating_count: number;
  total_sold: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  category?: Category;
  vendor?: VendorProfile;
  variants?: ProductVariant[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  sort_order: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  user_id: string;
  vendor_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total: number;
  commission_amount: number;
  shipping_address: Record<string, string>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  vendor?: VendorProfile;
  customer?: UserProfile;
  status_history?: OrderStatusHistory[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  price: number;
  quantity: number;
  total: number;
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  product?: Product;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Payout {
  id: string;
  vendor_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string | null;
  reference: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  vendor_id: string | null;
  category_id: string | null;
  rate: number;
  is_default: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'vendor' | 'review' | 'payout';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVendors: number;
  pendingProducts: number;
  recentOrders: Order[];
}
