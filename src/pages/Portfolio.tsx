import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Filter } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import { cn } from '../utils';

import { listPortfolioItems, PortfolioItemRow } from '../services/supabaseAdmin';

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const items = await listPortfolioItems();
        setPortfolioItems(items.map((item: PortfolioItemRow) => ({
          id: item.id,
          url: item.images?.[0] || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1000',
          category: item.category || 'General',
          title: item.title
        })));
      } catch (err) {
        console.error('Failed to load portfolio items', err);
      }
    }
    loadPortfolio();
  }, []);

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="space-y-4">
          <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">Portfolio</span>
          <h1 className="text-6xl font-display">Captured Moments</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium transition-all border',
              selectedCategory === 'All' ? 'bg-ink text-cream dark:bg-cream dark:text-ink border-ink' : 'border-black/10 hover:border-ink'
            )}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all border',
                selectedCategory === category ? 'bg-ink text-cream dark:bg-cream dark:text-ink border-ink' : 'border-black/10 hover:border-ink'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl cursor-pointer"
              onClick={() => setSelectedImage(item.url)}
            >
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-2">{item.category}</p>
                <h3 className="text-2xl font-display">{item.title}</h3>
                <div className="mt-4 p-2 bg-white/20 backdrop-blur-md rounded-full w-fit">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
