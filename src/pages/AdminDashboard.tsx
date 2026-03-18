import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Inbox, 
  Settings, 
  LogOut, 
  Plus,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BlogPostEditor from '../components/BlogPostEditor';
import { storage } from '../services/storageService';
import { formatDate, cn } from '../utils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'portfolio' | 'bookings'>('posts');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!storage.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  const posts = storage.getPosts();
  const portfolio = storage.getPortfolio();
  const bookings = storage.getBookings();

  const handleCreateNew = () => {
    if (activeTab === 'posts') {
      setEditingPost(null);
      setIsEditorOpen(true);
    }
  };

  const handleSavePost = (postData: any) => {
    const post = {
      id: editingPost?.id || crypto.randomUUID(),
      ...postData,
      slug: postData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      authorId: 'admin',
      createdAt: editingPost?.createdAt || new Date(),
      updatedAt: new Date(),
      published: postData.published ?? true,
      publishedAt: postData.publishedAt || new Date()
    };
    storage.savePost(post);
    setIsEditorOpen(false);
  };

  const handleLogout = () => {
    storage.logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Total Posts', value: posts.length.toString() },
    { label: 'Portfolio Items', value: portfolio.length.toString() },
    { label: 'New Bookings', value: bookings.filter(b => b.status === 'Pending').length.toString() },
    { label: 'Subscribers', value: '1,204' },
  ];

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
                    ? 'bg-ink text-cream shadow-lg' 
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
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm opacity-60 hover:opacity-100 transition-opacity">
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
            className="flex items-center space-x-2 px-6 py-2 bg-ink text-cream rounded-full text-sm font-medium hover:scale-105 transition-transform shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
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
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 font-medium">{post.title}</td>
                      <td className="px-8 py-6 opacity-60">{post.category}</td>
                      <td className="px-8 py-6 opacity-60">
                        {formatDate(post.publishedAt)}
                        {post.publishedAt > new Date() && (
                          <span className="block text-[9px] text-amber-500 font-medium italic">Scheduled</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] uppercase font-bold",
                          post.publishedAt <= new Date() && post.published ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {post.publishedAt > new Date() ? 'Scheduled' : (post.published ? 'Published' : 'Draft')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => { setEditingPost(post); setIsEditorOpen(true); }}
                          className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'bookings' && (
              <div className="p-8 space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-6 bg-white/50 dark:bg-ink/30 border border-black/5 dark:border-white/5 rounded-2xl flex justify-between items-center">
                    <div className="space-y-1">
                      <h4 className="font-display text-lg">{booking.clientName}</h4>
                      <p className="text-xs opacity-60">{booking.serviceType} Session • Preferred: {booking.datePreference}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] uppercase font-bold",
                        booking.status === 'Pending' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {booking.status}
                      </span>
                      <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
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
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                {portfolio.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img 
                      src={item.imageUrl} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="p-2 bg-white text-ink rounded-full shadow-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

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
