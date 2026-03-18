import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowLeft, Share2, Clock, User, MessageCircle } from 'lucide-react';
import { formatDate } from '../utils';

import { storage } from '../services/storageService';

const BlogPost = () => {
  const { slug } = useParams();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const post = storage.getPublishedPosts().find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="pt-32 pb-20 px-6 text-center space-y-8">
        <h1 className="text-4xl font-display">Post not found</h1>
        <Link to="/blog" className="btn-primary inline-block">Back to Journal</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-ink dark:bg-cream origin-left z-[60]" 
        style={{ scaleX }}
      />

      <article className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="space-y-8 text-center">
          <Link to="/blog" className="inline-flex items-center space-x-2 text-xs font-medium uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>
          
          <div className="space-y-4">
            <span className="px-4 py-1 bg-sand/20 dark:bg-white/10 rounded-full text-[10px] uppercase tracking-widest">
              {post.category}
            </span>
            <h1 className="text-5xl md:text-7xl font-display leading-[0.9] tracking-tight">
              {post.title}
            </h1>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs opacity-50 uppercase tracking-widest">
            <div className="flex items-center space-x-2">
              <User className="w-3 h-3" />
              <span>Nana</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>5 min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none font-light leading-relaxed prose-headings:font-display prose-headings:font-normal prose-blockquote:italic prose-blockquote:font-display prose-blockquote:text-3xl prose-img:rounded-[2rem] prose-img:shadow-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer Actions */}
        <div className="pt-16 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-6 py-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-ink hover:text-cream transition-all text-xs uppercase tracking-widest">
              <Share2 className="w-3 h-3" />
              <span>Share</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-xs opacity-50 uppercase tracking-widest">
            <MessageCircle className="w-4 h-4" />
            <span>No comments yet</span>
          </div>
        </div>
      </article>

      {/* Related Posts Placeholder */}
      <section className="max-w-7xl mx-auto px-6 pt-32">
        <h3 className="text-3xl font-display mb-12">Continue Reading</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* We can reuse the featured posts logic here */}
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
