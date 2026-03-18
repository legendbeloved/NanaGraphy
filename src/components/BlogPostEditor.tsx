import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, X, Image as ImageIcon, Sparkles, Eye, ArrowLeft } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';
import { cn } from '../utils';
import { generateAltText } from '../services/geminiService';

interface BlogPostEditorProps {
  onClose: () => void;
  onSave: (post: any) => void;
  initialData?: any;
}

const BlogPostEditor = ({ onClose, onSave, initialData }: BlogPostEditorProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Lifestyle');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [altText, setAltText] = useState(initialData?.altText || '');
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt 
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16) 
      : new Date().toISOString().slice(0, 16)
  );
  const [isGeneratingAlt, setIsGeneratingAlt] = useState(false);

  const handleGenerateAlt = async () => {
    if (!coverImage) return;
    setIsGeneratingAlt(true);
    try {
      const generated = await generateAltText(coverImage);
      setAltText(generated);
    } catch (error) {
      console.error('Failed to generate alt text:', error);
    } finally {
      setIsGeneratingAlt(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-cream dark:bg-ink overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 bg-cream/80 dark:bg-ink/80 backdrop-blur-md py-4 z-10">
          <button onClick={onClose} className="flex items-center space-x-2 text-xs font-medium uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-6 py-2 border border-black/10 dark:border-white/10 rounded-full text-xs uppercase tracking-widest hover:bg-black/5 transition-all">
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button 
              onClick={() => onSave({ 
                title, 
                category, 
                excerpt, 
                content, 
                coverImage, 
                altText,
                publishedAt: new Date(publishedAt)
              })}
              className="flex items-center space-x-2 px-8 py-2 bg-ink text-cream rounded-full text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
            >
              <Save className="w-3 h-3" />
              <span>Save Post</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Post Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a captivating title..."
                className="w-full px-8 py-6 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-[2rem] text-4xl font-display focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="A brief summary for the listing page..."
                className="w-full px-8 py-4 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-2xl text-lg font-light focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50 ml-4">Content (HTML/Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                placeholder="Write your story here..."
                className="w-full px-8 py-6 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-[2rem] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream transition-all resize-none"
              />
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-8">
            <div className="glass dark:glass-dark p-8 rounded-[2rem] space-y-6">
              <h4 className="text-sm font-medium uppercase tracking-widest opacity-70 border-b border-black/5 pb-4">Settings</h4>
              
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50">Publish Date</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl text-xs focus:outline-none"
                />
                <p className="text-[9px] opacity-40 italic">Set a future date to schedule this post.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50">Cover Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                {coverImage && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-black/5">
                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-black/5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-50">AI Alt Text</label>
                  <button 
                    onClick={handleGenerateAlt}
                    disabled={!coverImage || isGeneratingAlt}
                    className="flex items-center space-x-1 text-[10px] uppercase tracking-widest text-emerald-600 hover:opacity-70 disabled:opacity-30 transition-opacity"
                  >
                    <Sparkles className={cn("w-3 h-3", isGeneratingAlt && "animate-pulse")} />
                    <span>{isGeneratingAlt ? 'Generating...' : 'Auto-Generate'}</span>
                  </button>
                </div>
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  rows={4}
                  placeholder="Describe the image for accessibility..."
                  className="w-full px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl text-xs font-light focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPostEditor;
