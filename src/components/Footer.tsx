import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, Camera } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-sand/30 dark:bg-ink/50 border-t border-black/5 dark:border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6" />
            <span className="text-2xl font-display font-semibold">NanaGraphy</span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Capturing the essence of life through an editorial lens. Based in the heart of the city, traveling worldwide.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg mb-6">Explore</h4>
          <ul className="space-y-3 text-sm opacity-70">
            <li><Link to="/portfolio" className="hover:opacity-100 transition-opacity">Portfolio</Link></li>
            <li><Link to="/blog" className="hover:opacity-100 transition-opacity">Blog</Link></li>
            <li><Link to="/about" className="hover:opacity-100 transition-opacity">About Nana</Link></li>
            <li><Link to="/book" className="hover:opacity-100 transition-opacity">Book a Session</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-6">Categories</h4>
          <ul className="space-y-3 text-sm opacity-70">
            <li><Link to="/blog?category=Lifestyle" className="hover:opacity-100 transition-opacity">Lifestyle</Link></li>
            <li><Link to="/blog?category=Portraits" className="hover:opacity-100 transition-opacity">Portraits</Link></li>
            <li><Link to="/blog?category=Travel" className="hover:opacity-100 transition-opacity">Travel</Link></li>
            <li><Link to="/blog?category=Behind the Lens" className="hover:opacity-100 transition-opacity">Behind the Lens</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-6">Connect</h4>
          <div className="flex space-x-4 mb-6">
            <a href="#" className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-ink hover:text-cream transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-ink hover:text-cream transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-ink hover:text-cream transition-all">
              <Mail className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs opacity-50">
            © {new Date().getFullYear()} NanaGraphy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
