import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Heart, Globe, Award } from 'lucide-react';
import { getSiteSettings } from '../services/supabaseAdmin';

const About = () => {
  const [aboutContent, setAboutContent] = useState({
    hero_title: 'Meet Nana',
    paragraph_1: "I believe that every moment, no matter how small, holds a story worth telling. My journey with photography began with a simple film camera and a curiosity for the way light dances across a room.",
    paragraph_2: "Over the last decade, I've dedicated my life to capturing the authentic, unscripted beauty of human connection. My style is editorial yet intimate, focused on the raw emotions that make our lives extraordinary.",
    image_url: "/nana-about.jpg",
    stats: [
      { value: "2+", label: "Years Experience" },
      { value: "50+", label: "Sessions Captured" }
    ]
  });

  useEffect(() => {
    async function load() {
      try {
        const settings = await getSiteSettings();
        if (settings && settings.about_content) {
          setAboutContent({ ...aboutContent, ...settings.about_content });
        }
      } catch (err) {
        console.error('Failed to load about content', err);
      }
    }
    load();
  }, []);

  return (
    <div className="pt-32 pb-20 space-y-32">
      {/* Hero Section */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-50">The Story</span>
              <h1 className="text-6xl md:text-8xl font-display leading-[0.9]">{aboutContent.hero_title}</h1>
            </div>
            <p className="text-xl font-light leading-relaxed opacity-80 whitespace-pre-wrap">
              {aboutContent.paragraph_1}
            </p>
            <p className="text-lg font-light leading-relaxed opacity-70 whitespace-pre-wrap">
              {aboutContent.paragraph_2}
            </p>
            <div className="pt-4 grid grid-cols-2 gap-8">
              {aboutContent.stats?.map((stat, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-3xl font-display">{stat.value}</h4>
                  <p className="text-xs uppercase tracking-widest opacity-50">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <img 
              src={aboutContent.image_url} 
              alt="Nana" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-sand/20 dark:bg-ink/30 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-5xl font-display">My Philosophy</h2>
            <p className="text-lg font-light opacity-70">The principles that guide every frame I capture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Heart, title: 'Authenticity', desc: 'I prioritize real moments over posed perfection. Your story is beautiful exactly as it is.' },
              { icon: Camera, title: 'Artistry', desc: 'Every photo is treated as a piece of art, with careful attention to composition, light, and color.' },
              { icon: Globe, title: 'Connection', desc: 'Building a relationship with my subjects is the key to capturing their true essence.' }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-12 bg-white dark:bg-ink/50 rounded-[2rem] border border-black/5 dark:border-white/5 space-y-6 text-center"
              >
                <div className="w-16 h-16 bg-cream dark:bg-ink rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-display">{value.title}</h3>
                <p className="text-sm font-light leading-relaxed opacity-70">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-5xl font-display">Featured In</h2>
            <p className="text-lg font-light opacity-70">Recognized by industry leaders for editorial excellence.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-125">
            <span className="text-2xl font-display tracking-widest uppercase">Djameel Apparels</span>
            <span className="text-2xl font-display tracking-widest uppercase">Diyah’s Vouge</span>
            <span className="text-2xl font-display tracking-widest uppercase">B Aqcess</span>
            <span className="text-2xl font-display tracking-widest uppercase">Lush n Rush</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
