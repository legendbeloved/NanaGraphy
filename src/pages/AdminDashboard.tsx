import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Image as ImageIcon, 
  Inbox, 
  Settings, 
  LogOut, 
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  X,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BlogPostEditor from '../components/BlogPostEditor';
import { 
  listPosts, 
  listPortfolioItems, 
  listBookings, 
  createPost, 
  updatePost, 
  softDeletePost as deletePost, 
  setPostPublishState,
  createPortfolioItem, 
  softDeletePortfolioItem as deletePortfolioItem,
  updateBookingStatus,
  adminSignOut,
  getSiteSettings,
  updateSiteSettings,
  updateAdminPassword,
  uploadToStorage,
  fetchAdminStats
} from '../services/supabaseAdmin';
import { formatDate, cn } from '../utils';
import { CATEGORIES } from '../constants';
import type { BlogPost, Booking, Category, PortfolioItem } from '../types';

const defaultAboutContent = {
  hero_title: 'Meet Nana',
  paragraph_1: "I believe that every moment, no matter how small, holds a story worth telling. My journey with photography began with a simple film camera and a curiosity for the way light dances across a room.",
  paragraph_2: "Over the last decade, I've dedicated my life to capturing the authentic, unscripted beauty of human connection. My style is editorial yet intimate, focused on the raw emotions that make our lives extraordinary.",
  image_url: "/nana-about.jpg",
  stats: [
    { value: "10+", label: "Years Experience" },
    { value: "500+", label: "Sessions Captured" }
  ]
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'portfolio' | 'bookings' | 'settings'>('posts');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);

  // Theme toggle state
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState<Category>('Lifestyle');
  const [portfolioImageUrl, setPortfolioImageUrl] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [siteSettings, setSiteSettings] = useState({ 
    hero_title: '', 
    hero_subtitle: '', 
    contact_email: '',
    social_links: [] as { platform: string; url: string }[],
    about_content: defaultAboutContent
  });
  const [newPassword, setNewPassword] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingAboutImage, setIsUploadingAboutImage] = useState(false);
  const [isUploadingPortfolioImage, setIsUploadingPortfolioImage] = useState(false);

  const refreshData = async () => {
    try {
      const [p, port, b, settings, statsAdmin] = await Promise.all([
        listPosts('all'),
        listPortfolioItems(),
        listBookings('all'),
        getSiteSettings(),
        fetchAdminStats()
      ]);
      setPosts(p.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category_id || 'Editorial',
        createdAt: new Date(post.created_at),
        updatedAt: new Date(post.updated_at),
        publishedAt: post.published_at ? new Date(post.published_at) : new Date(),
        published: post.status === 'published',
        coverImage: post.cover_image,
        content: post.body,
      })));
      setPortfolio(port.map(item => ({
        id: item.id,
        url: item.images?.[0] || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1000',
        category: item.category || 'Editorial',
        title: item.title,
      })));
      setBookings(b.map(booking => ({
        id: booking.id,
        clientName: booking.client_name,
        clientEmail: booking.email,
        serviceType: booking.service_type,
        datePreference: booking.preferred_date ? [new Date(booking.preferred_date)] : [],
        isGift: booking.additional_notes?.includes('GIFT for:'),
        message: booking.vision_description,
        status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
        createdAt: new Date(booking.created_at),
      })));
      
      if (settings) {
        setSiteSettings({
          hero_title: settings.hero_title || '',
          hero_subtitle: settings.hero_subtitle || '',
          contact_email: settings.contact_email || '',
          social_links: settings.social_links || [],
          about_content: settings.about_content || defaultAboutContent
        });
      }
      setAdminStats(statsAdmin);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSaveSiteSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSiteSettings(siteSettings);
      alert('Site settings updated successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to update site settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddSocialLink = () => {
    setSiteSettings(prev => ({
      ...prev,
      social_links: [...prev.social_links, { platform: 'Instagram', url: '' }]
    }));
  };

  const handleUpdateSocialLink = (index: number, key: 'platform' | 'url', value: string) => {
    setSiteSettings(prev => ({
      ...prev,
      social_links: prev.social_links.map((link, i) => i === index ? { ...link, [key]: value } : link)
    }));
  };

  const handleRemoveSocialLink = (index: number) => {
    setSiteSettings(prev => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index)
    }));
  };

  const handleAddAboutStat = () => {
    setSiteSettings(prev => ({
      ...prev,
      about_content: { ...prev.about_content, stats: [...(prev.about_content.stats || []), { value: '', label: '' }] }
    }));
  };

  const handleUpdateAboutStat = (index: number, key: 'value' | 'label', val: string) => {
    setSiteSettings(prev => ({
      ...prev,
      about_content: {
        ...prev.about_content,
        stats: prev.about_content.stats.map((st, i) => i === index ? { ...st, [key]: val } : st)
      }
    }));
  };

  const handleRemoveAboutStat = (index: number) => {
    setSiteSettings(prev => ({
      ...prev,
      about_content: { ...prev.about_content, stats: prev.about_content.stats.filter((_, i) => i !== index) }
    }));
  };

  const handleUploadAboutImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAboutImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `about-${Date.now()}.${fileExt}`;
      const publicUrl = await uploadToStorage('portfolio', filePath, file);
      setSiteSettings(p => ({
        ...p,
        about_content: { ...p.about_content, image_url: publicUrl }
      }));
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setIsUploadingAboutImage(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setIsSavingSettings(true);
    try {
      await updateAdminPassword(newPassword);
      alert('Password updated successfully. You will stay signed in.');
      setNewPassword('');
    } catch (e: any) {
      console.error(e);
      alert('Failed to update password: ' + e.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateNew = () => {
    if (activeTab === 'posts') {
      setEditingPost(null);
      setIsEditorOpen(true);
      return;
    }
    if (activeTab === 'portfolio') {
      setPortfolioTitle('');
      setPortfolioCategory('Lifestyle');
      setPortfolioImageUrl('');
      setIsPortfolioModalOpen(true);
    }
  };

  const handleSavePost = async (postData: any) => {
    try {
      const slug = postData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const backendData = {
        title: postData.title,
        slug: slug,
        body: postData.content,
        excerpt: postData.excerpt,
        cover_image: postData.coverImage,
        status: postData.published ? 'published' : 'draft',
      };
      
      if (editingPost?.id) {
        await updatePost(editingPost.id, backendData as any);
      } else {
        await createPost(backendData as any);
      }
      setIsEditorOpen(false);
      setEditingPost(null);
      refreshData();
    } catch (e) {
      console.error(e);
      alert('Failed to save post');
    }
  };

  const handleLogout = async () => {
    await adminSignOut();
    navigate('/login');
  };

  const handleDeletePost = async (post: any) => {
    const ok = window.confirm(`Delete "${post.title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deletePost(post.id);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePostPublished = async (post: any) => {
    try {
      await setPostPublishState(post.id, post.published ? 'draft' : 'published');
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadPortfolioImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPortfolioImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `portfolio-${Date.now()}.${fileExt}`;
      const publicUrl = await uploadToStorage('portfolio', filePath, file);
      setPortfolioImageUrl(publicUrl);
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setIsUploadingPortfolioImage(false);
    }
  };

  const handleCreatePortfolioItem = async () => {
    if (!portfolioTitle.trim() || !portfolioImageUrl.trim()) {
      alert('Please provide a title and upload an image.');
      return;
    }
    try {
      await createPortfolioItem({
        title: portfolioTitle.trim(),
        category: portfolioCategory,
        images: [portfolioImageUrl.trim()],
        image_alts: [],
        featured: false,
        sort_order: portfolio.length,
        description: null,
        deleted_at: null,
      });
      setIsPortfolioModalOpen(false);
      refreshData();
    } catch (e) {
      console.error(e);
      alert('Failed to create item');
    }
  };

  const handleDeletePortfolioItem = async (item: any) => {
    const ok = window.confirm(`Remove "${item.title}" from portfolio?`);
    if (!ok) return;
    try {
      await deletePortfolioItem(item.id);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetBookingStatus = async (bookingId: string, status: any) => {
    try {
      await updateBookingStatus(bookingId, status.toLowerCase() as any);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const stats = [
    { label: 'Total Posts', value: posts.length.toString() },
    { label: 'Portfolio Items', value: portfolio.length.toString() },
    { label: 'New Bookings', value: bookings.filter(b => b.status === 'Pending').length.toString() },
    { label: 'Subscribers', value: adminStats?.newsletterSubscribers?.toString() || '0' },
  ];

  const now = new Date();
  const sortedPosts = [...posts].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const sortedBookings = [...bookings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const createButtonLabel =
    activeTab === 'posts' ? 'Create Post' : activeTab === 'portfolio' ? 'Add Photo' : 'Create New';
  const createButtonDisabled = activeTab === 'bookings' || activeTab === 'settings';

  const statusPillClass = (status: Booking['status']) => {
    if (status === 'Pending') return 'bg-amber-500/10 text-amber-500';
    if (status === 'Cancelled') return 'bg-red-500/10 text-red-500';
    return 'bg-emerald-500/10 text-emerald-500';
  };

  return (
    <div className="pt-24 min-h-screen bg-sand/10 dark:bg-ink/90 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 dark:border-white/5 p-6 hidden md:flex flex-col">
        <div className="space-y-8 flex-grow">
          <div className="px-4">
            <h2 className="text-xl font-display font-semibold">NanaGraphy Admin</h2>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'posts', icon: FileText, label: 'Blog Posts' },
              { id: 'portfolio', icon: ImageIcon, label: 'Portfolio' },
              { id: 'bookings', icon: Inbox, label: 'Bookings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === item.id 
                    ? 'bg-ink text-cream dark:bg-cream dark:text-ink shadow-lg' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-2 pt-8 border-t border-black/5 dark:border-white/5">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeTab === 'settings' 
                ? 'bg-ink text-cream dark:bg-cream dark:text-ink shadow-lg' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-red-500 opacity-60 hover:opacity-100 transition-opacity"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 space-y-12 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-display">Dashboard</h1>
          <button 
            onClick={handleCreateNew}
            disabled={createButtonDisabled}
            className={cn(
              "flex items-center space-x-2 px-6 py-2 rounded-full text-sm font-medium transition-transform shadow-lg",
              createButtonDisabled
                ? "bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40 cursor-not-allowed"
                : "bg-ink text-cream dark:bg-cream dark:text-ink hover:scale-105"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>{createButtonLabel}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="glass dark:glass-dark p-6 rounded-2xl space-y-2">
              <p className="text-[10px] uppercase tracking-widest opacity-50">{stat.label}</p>
              <p className="text-3xl font-display">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass dark:glass-dark rounded-[2rem] overflow-hidden shadow-xl">
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-display uppercase tracking-widest opacity-70">
              Recent {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h3>
            <button className="text-xs opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest">
              View All
            </button>
          </div>

          <div className="p-0">
            {activeTab === 'posts' && (
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase tracking-widest opacity-40 border-b border-black/5 dark:border-white/5">
                  <tr>
                    <th className="px-8 py-4 font-medium">Title</th>
                    <th className="px-8 py-4 font-medium">Category</th>
                    <th className="px-8 py-4 font-medium">Date</th>
                    <th className="px-8 py-4 font-medium">Status</th>
                    <th className="px-8 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sortedPosts.map((post) => (
                    <tr key={post.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-medium">{post.title}</td>
                      <td className="px-8 py-6 opacity-60">{post.category}</td>
                      <td className="px-8 py-6 opacity-60">
                        {formatDate(post.publishedAt)}
                        {post.publishedAt > now && post.published && (
                          <span className="block text-[9px] text-amber-500 font-medium italic">Scheduled</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] uppercase font-bold",
                          !post.published
                            ? "bg-amber-500/10 text-amber-500"
                            : (post.publishedAt <= now ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")
                        )}>
                          {!post.published ? 'Draft' : (post.publishedAt > now ? 'Scheduled' : 'Published')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            title="View post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => { setEditingPost(post); setIsEditorOpen(true); }}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            title="Edit post"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePostPublished(post)}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            title={post.published ? 'Unpublish' : 'Publish'}
                          >
                            {post.published ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeletePost(post)}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-red-500"
                            title="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedPosts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center opacity-50 italic">No posts yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'bookings' && (
              <div className="p-8 space-y-4">
                {sortedBookings.map((booking) => (
                  <div key={booking.id} className="p-6 bg-white/50 dark:bg-ink/30 border border-black/5 dark:border-white/5 rounded-2xl flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-lg">{booking.clientName}</h4>
                        {booking.isGift && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] uppercase font-bold tracking-widest">Gift</span>}
                      </div>
                      <p className="text-xs opacity-60 truncate">
                        {booking.serviceType} Aventa • {booking.datePreference?.length || 0} dates selected
                      </p>
                      <p className="text-xs opacity-50 truncate max-w-[50ch]">{booking.clientEmail}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={booking.status}
                        onChange={(e) => handleSetBookingStatus(booking.id, e.target.value as Booking['status'])}
                        className={cn(
                          "px-3 py-2 rounded-full text-[10px] uppercase font-bold border border-black/10 dark:border-white/10 bg-transparent",
                          statusPillClass(booking.status)
                        )}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <a
                        href={`mailto:${booking.clientEmail}`}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                        title="Email client"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <p className="text-center py-12 opacity-50 italic">No bookings yet.</p>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="p-8">
                {portfolio.length === 0 ? (
                  <p className="text-center py-12 opacity-50 italic">No portfolio items yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {portfolio.map((item) => (
                      <div key={item.id} className="space-y-3">
                        <div className="relative aspect-square rounded-xl overflow-hidden group border border-black/5 dark:border-white/10">
                          <img
                            src={item.imageUrl}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            alt={item.altText || item.title}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleDeletePortfolioItem(item)}
                              className="p-2 bg-white text-red-500 rounded-full shadow-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="px-1">
                          <p className="text-[10px] uppercase tracking-widest opacity-50">{item.category}</p>
                          <p className="text-sm font-medium truncate">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-8 space-y-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-display">Site Configuration</h3>
                    <p className="text-sm opacity-60">Manage your global homepage hero text and contact email.</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Homepage Hero Title (use \n for line breaks)</label>
                      <input
                        value={siteSettings.hero_title}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Homepage Subtitle</label>
                      <input
                        value={siteSettings.hero_subtitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })}
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Contact Email</label>
                      <input
                        type="email"
                        value={siteSettings.contact_email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Payment Link</label>
                      <input
                        type="url"
                        value={siteSettings.about_content?.payment_link || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, about_content: { ...siteSettings.about_content, payment_link: e.target.value } as any })}
                        placeholder="https://paystack.com/... or https://paypal.me/..."
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                      />
                    </div>

                    <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Social Connections</label>
                        <button onClick={handleAddSocialLink} className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100">
                          <Plus className="w-3 h-3" /> Add Link
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {siteSettings.social_links.map((link, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <select 
                              value={link.platform}
                              onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                              className="w-1/3 px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream appearance-none text-sm"
                            >
                              <option value="Instagram">Instagram</option>
                              <option value="TikTok">TikTok</option>
                              <option value="Twitter">Twitter</option>
                              <option value="YouTube">YouTube</option>
                              <option value="Facebook">Facebook</option>
                              <option value="LinkedIn">LinkedIn</option>
                              <option value="Email">Email</option>
                              <option value="Other">Other</option>
                            </select>
                            <input 
                              value={link.url}
                              onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                              placeholder="https://..."
                              className="w-full px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream text-sm"
                            />
                            <button 
                              onClick={() => handleRemoveSocialLink(index)}
                              className="p-3 text-red-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {(!siteSettings.social_links || siteSettings.social_links.length === 0) && (
                          <p className="text-xs opacity-50 italic py-2 ml-4">No social links configured.</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={handleSaveSiteSettings}
                        disabled={isSavingSettings}
                        className="px-8 py-3 rounded-full bg-ink text-cream dark:bg-cream dark:text-ink text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                      >
                        {isSavingSettings ? 'Saving...' : 'Save Site Settings'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-12 border-t border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="text-2xl font-display">About Page Content</h3>
                    <p className="text-sm opacity-60">Manage the hero section text, photo, and dynamic stats on the about page.</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Hero Title</label>
                      <input
                        value={siteSettings.about_content.hero_title}
                        onChange={(e) => setSiteSettings(p => ({...p, about_content: {...p.about_content, hero_title: e.target.value}}))}
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Paragraph 1</label>
                      <textarea
                        rows={4}
                        value={siteSettings.about_content.paragraph_1}
                        onChange={(e) => setSiteSettings(p => ({...p, about_content: {...p.about_content, paragraph_1: e.target.value}}))}
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Paragraph 2</label>
                      <textarea
                        rows={4}
                        value={siteSettings.about_content.paragraph_2}
                        onChange={(e) => setSiteSettings(p => ({...p, about_content: {...p.about_content, paragraph_2: e.target.value}}))}
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Portrait Image</label>
                      <div className="flex gap-4 items-center">
                        {siteSettings.about_content.image_url && (
                          <img src={siteSettings.about_content.image_url} alt="Portrait Preview" className="w-16 h-16 object-cover rounded-xl shadow-md shrink-0" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAboutImage}
                          className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-cream dark:file:bg-cream dark:file:text-ink hover:file:opacity-80"
                        />
                      </div>
                      {isUploadingAboutImage && <p className="text-xs ml-4 animate-pulse opacity-70">Uploading image...</p>}
                    </div>

                    <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Experience Stats</label>
                        <button onClick={handleAddAboutStat} className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100">
                          <Plus className="w-3 h-3" /> Add Stat
                        </button>
                      </div>
                      <div className="space-y-3">
                        {siteSettings.about_content.stats?.map((stat, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <input 
                              value={stat.value}
                              onChange={(e) => handleUpdateAboutStat(idx, 'value', e.target.value)}
                              placeholder="e.g. 10+"
                              className="w-1/3 px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream text-sm"
                            />
                            <input 
                              value={stat.label}
                              onChange={(e) => handleUpdateAboutStat(idx, 'label', e.target.value)}
                              placeholder="e.g. Years Experience"
                              className="w-full px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream text-sm"
                            />
                            <button 
                              onClick={() => handleRemoveAboutStat(idx)}
                              className="p-3 text-red-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={handleSaveSiteSettings}
                        disabled={isSavingSettings}
                        className="px-8 py-3 rounded-full bg-ink text-cream dark:bg-cream dark:text-ink text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                      >
                        {isSavingSettings ? 'Saving...' : 'Save About Settings'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-12 border-t border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="text-2xl font-display">Account Security</h3>
                    <p className="text-sm opacity-60">Update your administrator password.</p>
                  </div>
                  
                  <div className="grid gap-6">
                    <div className="space-y-2 max-w-md">
                      <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={handleUpdatePassword}
                        disabled={isSavingSettings || !newPassword}
                        className="px-8 py-3 rounded-full bg-red-500 text-white text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                      >
                        {isSavingSettings ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isPortfolioModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-6"
            onClick={() => setIsPortfolioModalOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="w-full max-w-xl glass dark:glass-dark rounded-[2rem] shadow-2xl p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display">Add Portfolio Item</h3>
                <button
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Title</label>
                <input
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
                  placeholder="e.g. Golden Hour Portrait"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Category</label>
                  <select
                    value={portfolioCategory}
                    onChange={(e) => setPortfolioCategory(e.target.value as Category)}
                    className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none appearance-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPortfolioImage}
                    className="w-full px-6 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-cream dark:file:bg-cream dark:file:text-ink hover:file:opacity-80"
                  />
                  {isUploadingPortfolioImage && <p className="text-xs ml-4 animate-pulse opacity-70">Uploading image...</p>}
                </div>
              </div>

              {portfolioImageUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/10">
                  <img src={portfolioImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsPortfolioModalOpen(false)}
                  className="px-6 py-3 rounded-full border border-black/10 dark:border-white/10 text-xs uppercase tracking-widest hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePortfolioItem}
                  className="px-8 py-3 rounded-full bg-ink text-cream dark:bg-cream dark:text-ink text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-6"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="w-full max-w-2xl glass dark:glass-dark rounded-[2rem] shadow-2xl p-8 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-display">{selectedBooking.clientName}</h3>
                  <p className="text-xs opacity-60">{selectedBooking.clientEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Service</p>
                  <p className="text-sm font-medium">{selectedBooking.serviceType}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Preferred Dates</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedBooking.datePreference?.map((d, i) => (
                      <span key={i} className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-xs font-medium">
                        {new Date(d).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Status</p>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => {
                      const next = e.target.value as Booking['status'];
                      handleSetBookingStatus(selectedBooking.id, next);
                      setSelectedBooking({ ...selectedBooking, status: next });
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] uppercase font-bold border border-black/10 dark:border-white/10 bg-transparent w-fit",
                      statusPillClass(selectedBooking.status)
                    )}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-50">Received</p>
                  <p className="text-sm font-medium">{formatDate(selectedBooking.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest opacity-50">Message</p>
                <div className="bg-white/50 dark:bg-ink/30 border border-black/5 dark:border-white/10 rounded-2xl p-6 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedBooking.message}
                </div>
              </div>

              {selectedBooking.isGift && (
                <div className="space-y-2 pt-4 border-t border-black/5 dark:border-white/5 mt-4">
                  <p className="text-[10px] uppercase tracking-widest opacity-50 text-amber-500 font-bold flex items-center gap-2">
                    Gift Details
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50">Recipient Name</p>
                      <p className="text-sm font-medium">{selectedBooking.giftRecipientName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-50">Recipient Email</p>
                      <p className="text-sm font-medium">{selectedBooking.giftRecipientEmail || 'N/A'}</p>
                    </div>
                    {selectedBooking.giftMessage && (
                      <div className="col-span-1 md:col-span-2 pt-2">
                        <p className="text-[10px] uppercase tracking-widest opacity-50">Gift Message</p>
                        <p className="text-sm italic opacity-80 pt-1">"{selectedBooking.giftMessage}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <a
                  href={`mailto:${selectedBooking.clientEmail}`}
                  className="px-6 py-3 rounded-full border border-black/10 dark:border-white/10 text-xs uppercase tracking-widest hover:bg-black/5 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-8 py-3 rounded-full bg-ink text-cream dark:bg-cream dark:text-ink text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isEditorOpen && (
        <BlogPostEditor 
          onClose={() => setIsEditorOpen(false)} 
          onSave={handleSavePost}
          initialData={editingPost}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
