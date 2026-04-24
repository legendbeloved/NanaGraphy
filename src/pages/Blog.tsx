import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import { cn, formatDate } from '../utils';
import { Link } from 'react-router-dom';

import { listPosts, PostRow } from '../services/supabaseAdmin';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await listPosts('published');
        setPosts(data.map((post: PostRow) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          coverImage: post.cover_image || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
          category: post.category_id || 'Editorial',
          createdAt: new Date(post.created_at)
        })));
      } catch (err) {
        console.error('Failed to load posts', err);
      }
    }
    loadPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="space-y-4">
          <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">The Journal</span>
          <h1 className="text-6xl font-display">Editorial Stories</h1>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-ink/50 border border-black/10 dark:border-white/10 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('All')}
          className={cn(
            'px-6 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap',
            selectedCategory === 'All' ? 'bg-ink text-cream dark:bg-cream dark:text-ink border-ink' : 'border-black/10 hover:border-ink'
          )}
        >
          All Stories
        </button>
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap',
              selectedCategory === category ? 'bg-ink text-cream dark:bg-cream dark:text-ink border-ink' : 'border-black/10 hover:border-ink'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {filteredPosts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
          >
            <Link to={`/blog/${post.slug}`} className="space-y-6 block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] text-white uppercase tracking-widest">
                  {post.category}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-xs opacity-50 uppercase tracking-widest">
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="w-1 h-1 bg-ink/20 dark:bg-cream/20 rounded-full" />
                  <span>By Nana</span>
                </div>
                <h2 className="text-4xl font-display group-hover:underline decoration-1 underline-offset-8 leading-tight">
                  {post.title}
                </h2>
                <p className="text-lg opacity-70 leading-relaxed line-clamp-2 font-light">
                  {post.excerpt}
                </p>
                <div className="flex items-center space-x-2 text-sm font-medium uppercase tracking-widest pt-2 group-hover:opacity-60 transition-opacity">
                  <span>Read Story</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <p className="text-xl font-display italic opacity-50">No stories found matching your search.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
            className="text-sm uppercase tracking-widest underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Blog;
