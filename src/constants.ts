import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Lifestyle',
  'Portraits',
  'Travel',
  'Behind the Lens',
  'Tips'
];

export const SERVICE_TYPES = [
  'Low Grade',
  'Middle Grade',
  'High Grade'
] as const;

export const AVENTA_PACKAGES = [
  { id: 'Low Grade', label: 'Low Grade', basePrice: 'from ₦100k' },
  { id: 'Middle Grade', label: 'Middle Grade', basePrice: 'from ₦250k' },
  { id: 'High Grade', label: 'High Grade', basePrice: 'Custom Pricing' }
] as const;

export const SITE_NAME = 'NanaGraphy';
export const SITE_TAGLINE = 'Life in Every Frame';
