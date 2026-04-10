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
  'Premium'
] as const;

export const AVENTA_PACKAGES = [
  { id: 'Basic', label: 'Basic', basePrice: '₦20,000' },
  { id: 'Standard', label: 'Standard', basePrice: '₦35,000' },
  { id: 'Premium', label: 'Premium', basePrice: '₦55k - ₦60k' }
] as const;

export const SITE_NAME = 'NanaGraphy';
export const SITE_TAGLINE = 'Life in Every Frame';
