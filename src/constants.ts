import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Lifestyle',
  'Portraits',
  'Travel',
  'Behind the Lens',
  'Tips'
];

export const SERVICE_TYPES = [
  'Basic',
  'Standard',
  'Premium',
  'Lifestyle Content',
  'Brand Content'
] as const;

export const AVENTA_PACKAGES = [
  { 
    id: 'Basic', 
    label: 'Basic', 
    basePrice: '₦19,999',
    description: 'For a simple, effortless shoot',
    features: ['7 edited photos', 'Photoshoot session', 'Transport included'],
    extraNote: 'Client covers personal spend at location',
    paymentLink: '' // Add your specific payment link here
  },
  { 
    id: 'Standard', 
    label: 'Standard', 
    basePrice: '₦34,999',
    description: 'A balanced experience (perfect for gifting)',
    features: ['7 edited photos', 'Photoshoot session', '₦10,000 covered from your bill'],
    paymentLink: '' // Add your specific payment link here
  },
  { 
    id: 'Premium', 
    label: 'Premium', 
    basePrice: '₦54,999 – ₦59,999',
    description: 'The full Aventa experience',
    features: ['7 edited photos', '1 video reel', 'Photoshoot session', '₦20,000 covered from your bill'],
    paymentLink: '' // Add your specific payment link here
  },
  { 
    id: 'Lifestyle Content', 
    label: 'Lifestyle Content', 
    basePrice: '₦29,999',
    description: 'For creators who want both photos & motion',
    features: ['7 edited photos', '1 video reel'],
    extraNote: 'Additional reels available at extra cost',
    paymentLink: '' // Add your specific payment link here
  },
  { 
    id: 'Brand Content', 
    label: 'Brand Content', 
    basePrice: 'from ₦34,999',
    description: 'Tailored for brands and businesses',
    features: ['Custom photo & video content', 'Pricing based on scope'],
    paymentLink: '' // Add your specific payment link here
  }
] as const;

export const SITE_NAME = 'NanaGraphy';
export const SITE_TAGLINE = 'Life in Every Frame';
