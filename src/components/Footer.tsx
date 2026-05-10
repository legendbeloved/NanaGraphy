import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, Camera, Youtube, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { getSiteSettings } from '../services/supabaseAdmin';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return Instagram;
    case 'twitter': return Twitter;
    case 'youtube': return Youtube;
    case 'facebook': return Facebook;
    case 'linkedin': return Linkedin;
    case 'email': return Mail;
    case 'tiktok': return TikTokIcon;
    default: return LinkIcon;
  }
};

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<{platform: string; url: string}[]>([]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getSiteSettings();
        if (settings && settings.social_links) {
          setSocialLinks(settings.social_links);
        }
      } catch (err) {
        console.error('Failed to load site settings for footer', err);
      }
    }
    fetchSettings();
  }, []);

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
            <li><Link to="/book" className="hover:opacity-100 transition-opacity">Purchase an Aventa</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-6">Newsletter</h4>
          <p className="text-sm opacity-70 mb-4 leading-relaxed">
            Subscribe to get updates on my latest editorial sessions, travel dates, and exclusive print releases.
          </p>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              try {
                await fetch('/api/subscribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                alert('Thank you for subscribing!');
                form.reset();
              } catch (err) {
                alert('An error occurred. Please try again later.');
              }
            }}
            className="flex flex-col gap-3"
          >
            <input 
              type="email" 
              name="email"
              required
              placeholder="Your email address" 
              className="px-4 py-3 bg-white/50 dark:bg-ink/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-ink dark:focus:ring-cream text-sm transition-all"
            />
            <button 
              type="submit"
              className="px-4 py-3 bg-ink text-cream dark:bg-cream dark:text-ink rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div>
          <h4 className="font-display text-lg mb-6">Connect</h4>
          <div className="flex flex-wrap gap-4 mb-6">
            {socialLinks.length > 0 ? (
              socialLinks.map((link, i) => {
                const Icon = getPlatformIcon(link.platform);
                const href = link.platform.toLowerCase() === 'email' && !link.url.startsWith('mailto:') 
                  ? `mailto:${link.url}` 
                  : link.url;
                return (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-ink hover:text-cream dark:hover:bg-cream dark:hover:text-ink transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })
            ) : (
                <div className="text-sm opacity-50 italic">No social links</div>
            )}
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
