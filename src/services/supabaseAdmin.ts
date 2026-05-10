import { supabase } from '../lib/supabase';

export type PostStatus = 'draft' | 'published' | 'archived';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  cover_image: string | null;
  cover_image_alt: string | null;
  category_id: string | null;
  tags: string[];
  status: PostStatus;
  featured: boolean;
  read_time_minutes: number | null;
  published_at: string | null;
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PortfolioItemRow = {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  image_alts: string[];
  category: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type BookingRow = {
  id: string;
  client_name: string;
  email: string;
  phone: string | null;
  service_type: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  location_preference: string | null;
  vision_description: string | null;
  budget_range: string | null;
  style_tags: string[];
  additional_notes: string | null;
  status: BookingStatus;
  booking_reference: string;
  created_at: string;
  updated_at: string;
};

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
};

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function isAdminUser(user: any) {
  return user?.app_metadata?.role === 'admin';
}

export async function adminSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchAdminStats() {
  const [
    totalPosts,
    publishedPosts,
    totalPortfolioItems,
    pendingBookings,
    newsletterSubscribers,
  ] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .is('deleted_at', null),
    supabase.from('portfolio_items').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
  ]);

  for (const r of [totalPosts, publishedPosts, totalPortfolioItems, pendingBookings, newsletterSubscribers]) {
    if (r.error) throw r.error;
  }

  return {
    totalPosts: totalPosts.count || 0,
    publishedPosts: publishedPosts.count || 0,
    totalPortfolioItems: totalPortfolioItems.count || 0,
    pendingBookings: pendingBookings.count || 0,
    newsletterSubscribers: newsletterSubscribers.count || 0,
  };
}

export async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return (data || []) as CategoryRow[];
}

export async function listPosts(status?: PostStatus | 'all') {
  let q = supabase
    .from('posts')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (status && status !== 'all') {
    q = q.eq('status', status);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as PostRow[];
}

export async function getPostById(id: string) {
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
  if (error) throw error;
  return data as PostRow;
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data as PostRow;
}

export async function createPost(input: Omit<PostRow, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('posts').insert(input).select('*').single();
  if (error) throw error;
  return data as PostRow;
}

export async function updatePost(id: string, updates: Partial<PostRow>) {
  const { data, error } = await supabase.from('posts').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return data as PostRow;
}

export async function softDeletePost(id: string) {
  const { error } = await supabase.from('posts').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function setPostPublishState(id: string, nextStatus: PostStatus, publishedAt?: string | null) {
  const updates: Partial<PostRow> = { status: nextStatus };
  if (nextStatus === 'published') {
    updates.published_at = publishedAt || new Date().toISOString();
  }
  if (nextStatus !== 'published') {
    updates.published_at = publishedAt ?? null;
  }
  return updatePost(id, updates);
}

export async function uploadToStorage(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return pub.publicUrl;
}

export async function listPortfolioItems() {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as PortfolioItemRow[];
}

export async function createPortfolioItem(input: Omit<PortfolioItemRow, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('portfolio_items').insert(input).select('*').single();
  if (error) throw error;
  return data as PortfolioItemRow;
}

export async function updatePortfolioItem(id: string, updates: Partial<PortfolioItemRow>) {
  const { data, error } = await supabase
    .from('portfolio_items')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as PortfolioItemRow;
}

export async function softDeletePortfolioItem(id: string) {
  const { error } = await supabase
    .from('portfolio_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function reorderPortfolioItems(items: Array<{ id: string; sort_order: number }>) {
  await Promise.all(items.map((i) => supabase.from('portfolio_items').update({ sort_order: i.sort_order }).eq('id', i.id)));
}

export async function listBookings(status?: BookingStatus | 'all') {
  let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
  if (status && status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as BookingRow[];
}

export async function listRecentBookings(limit = 5) {
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as BookingRow[];
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select('*').single();
  if (error) throw error;
  return data as BookingRow;
}

export async function getBookingById(id: string) {
  const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single();
  if (error) throw error;
  return data as BookingRow;
}

export async function updateBookingDates(id: string, preferred_date: string) {
  const { data, error } = await supabase.from('bookings').update({ preferred_date }).eq('id', id).select('*').single();
  if (error) throw error;
  return data as BookingRow;
}

export async function listNewsletterSubscribers() {
  const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
  if (error) throw error;
  return (data || []) as NewsletterSubscriberRow[];
}

export type SiteSettingsRow = {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  contact_email: string;
  social_links?: { platform: string; url: string }[];
  about_content?: {
    hero_title: string;
    paragraph_1: string;
    paragraph_2: string;
    image_url: string;
    stats: { value: string; label: string }[];
    payment_link?: string;
  };
  updated_at: string;
};

export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error) {
    if (error.code === 'PGRST116') return null; 
    throw error;
  }
  return data as SiteSettingsRow;
}

export async function updateSiteSettings(updates: Partial<SiteSettingsRow>) {
  const payload = { id: 1, ...updates, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return data as SiteSettingsRow;
}

export async function updateAdminPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}
