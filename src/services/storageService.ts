import { BlogPost, PortfolioItem, Booking, Subscriber } from '../types';

const STORAGE_KEYS = {
  POSTS: 'nanagraphy_posts',
  PORTFOLIO: 'nanagraphy_portfolio',
  BOOKINGS: 'nanagraphy_bookings',
  SUBSCRIBERS: 'nanagraphy_subscribers',
  AUTH: 'nanagraphy_auth'
};

// Initial Mock Data
const INITIAL_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of Natural Light',
    slug: 'art-of-natural-light',
    category: 'Tips',
    excerpt: 'Discover how to harness the power of the sun to create stunning, ethereal photographs without expensive gear.',
    content: '<p>Light is the fundamental building block of photography...</p>',
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
    authorId: 'admin',
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-12'),
    published: true,
    publishedAt: new Date('2024-03-12'),
    altText: 'A serene landscape with golden sunlight'
  }
];

const INITIAL_PORTFOLIO: PortfolioItem[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1000', category: 'Lifestyle', title: 'Sun-drenched Mornings', createdAt: new Date() },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000', category: 'Portraits', title: 'The Look', createdAt: new Date() },
];

class StorageService {
  private get<T>(key: string, initial: T): T {
    const data = localStorage.getItem(key);
    if (!data) return initial;
    try {
      return JSON.parse(data, (key, value) => {
        if (['createdAt', 'updatedAt', 'publishedAt'].includes(key)) {
          return new Date(value);
        }
        if (key === 'datePreference') {
          if (Array.isArray(value)) {
            return value.map((v: any) => new Date(v));
          } else if (typeof value === 'string') {
            return [new Date(value)]; // backward compatibility for string dates
          }
          return [];
        }
        return value;
      });
    } catch {
      return initial;
    }
  }

  private set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Posts
  getPosts(): BlogPost[] {
    return this.get(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  }

  getPublishedPosts(): BlogPost[] {
    const now = new Date();
    return this.getPosts().filter(post => 
      post.published && post.publishedAt <= now
    );
  }

  savePost(post: BlogPost) {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index > -1) {
      posts[index] = post;
    } else {
      posts.push(post);
    }
    this.set(STORAGE_KEYS.POSTS, posts);
  }

  deletePost(postId: string) {
    const posts = this.getPosts().filter(p => p.id !== postId);
    this.set(STORAGE_KEYS.POSTS, posts);
  }

  setPostPublished(postId: string, published: boolean) {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index === -1) return;
    posts[index] = { ...posts[index], published, updatedAt: new Date() };
    this.set(STORAGE_KEYS.POSTS, posts);
  }

  // Portfolio
  getPortfolio(): PortfolioItem[] {
    return this.get(STORAGE_KEYS.PORTFOLIO, INITIAL_PORTFOLIO);
  }

  savePortfolioItem(item: PortfolioItem) {
    const items = this.getPortfolio();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) {
      items[index] = item;
    } else {
      items.push(item);
    }
    this.set(STORAGE_KEYS.PORTFOLIO, items);
  }

  deletePortfolioItem(itemId: string) {
    const items = this.getPortfolio().filter(i => i.id !== itemId);
    this.set(STORAGE_KEYS.PORTFOLIO, items);
  }

  // Bookings
  getBookings(): Booking[] {
    return this.get(STORAGE_KEYS.BOOKINGS, []);
  }

  saveBooking(booking: Booking) {
    const bookings = this.getBookings();
    bookings.push(booking);
    this.set(STORAGE_KEYS.BOOKINGS, bookings);
  }

  updateBooking(bookingId: string, updates: Partial<Booking>) {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) return;
    bookings[index] = { ...bookings[index], ...updates };
    this.set(STORAGE_KEYS.BOOKINGS, bookings);
  }

  setBookingStatus(bookingId: string, status: Booking['status']) {
    this.updateBooking(bookingId, { status });
  }

  // Auth
  isLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  }

  login() {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}

export const storage = new StorageService();
