export type Category = 'Lifestyle' | 'Portraits' | 'Travel' | 'Behind the Lens' | 'Tips';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: Category;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  publishedAt: Date;
  altText?: string;
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title: string;
  category: Category;
  description?: string;
  altText?: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: 'Low Grade' | 'Middle Grade' | 'High Grade';
  datePreference: Date[];
  isGift: boolean;
  giftRecipientName?: string;
  giftRecipientEmail?: string;
  giftMessage?: string;
  message: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  createdAt: Date;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: Date;
}
