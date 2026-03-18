import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

import { storage } from '../services/storageService';

const Home = () => {
  const featuredPosts = storage.getPublishedPosts().slice(0, 3).map(post => ({
    id: post.id,
    title: post.title,
    category: post.category,
    image: post.coverImage,
    date: post.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }));

  return (
    <div className="space-y-32 pb-20">
      {/* Hero Section */}
      <section className="pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[85vh] flex items-center justify-center overflow-hidden rounded-[2.5rem] shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=2000" 
              alt="Hero" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            <div className="relative text-center text-white space-y-8 px-4 max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-7xl md:text-9xl font-display font-light tracking-tighter leading-[0.85]"
              >
                Life in Every <br /> <span className="italic">Frame</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl font-sans font-light tracking-[0.3em] uppercase opacity-90"
              >
                Editorial Lifestyle Photography by Nana
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6"
              >
                <Link to="/portfolio" className="px-10 py-4 bg-white text-ink rounded-full font-medium hover:scale-105 transition-transform shadow-lg">
                  View Portfolio
                </Link>
                <Link to="/book" className="px-10 py-4 bg-transparent border border-white text-white rounded-full font-medium hover:bg-white hover:text-ink transition-all">
                  Book a Session
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">The Journal</span>
            <h2 className="text-5xl font-display">Latest Stories</h2>
          </div>
          <Link to="/blog" className="group flex items-center space-x-2 text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity">
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-6">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] text-white uppercase tracking-widest">
                  {post.category}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs opacity-50 uppercase tracking-widest">{post.date}</p>
                <h3 className="text-2xl font-display group-hover:underline decoration-1 underline-offset-4">{post.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-sand/20 dark:bg-ink/30 py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <Quote className="w-12 h-12 mx-auto opacity-20" />
          <h2 className="text-4xl md:text-5xl font-display leading-tight italic">
            "Nana has an incredible ability to capture the quiet, beautiful moments that usually go unnoticed. The photos from our session are treasures we will keep forever."
          </h2>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-[1px] bg-ink/20 dark:bg-cream/20" />
            <span className="text-sm font-medium uppercase tracking-widest">Sarah & James</span>
            <div className="w-12 h-[1px] bg-ink/20 dark:bg-cream/20" />
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-ink text-cream rounded-[3rem] p-12 md:p-24 overflow-hidden text-center space-y-8">
            <div className="absolute inset-0 opacity-20">
              <img 
                src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=2000" 
                alt="Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-5xl md:text-7xl font-display leading-none">Ready to capture your story?</h2>
              <p className="text-lg opacity-80 font-light leading-relaxed">
                Whether it's a quiet afternoon at home or a grand adventure abroad, let's create something beautiful together.
              </p>
              <div className="pt-8">
                <Link to="/book" className="inline-block px-12 py-5 bg-cream text-ink rounded-full font-medium hover:scale-105 transition-transform shadow-2xl">
                  Inquire Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
