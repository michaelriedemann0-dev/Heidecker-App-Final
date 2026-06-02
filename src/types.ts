/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Color {
  name: string;
  hex: string;
  description: string;
  group: string;
  isDark?: boolean;
}

export interface WallMaterial {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  visualizerBriefing?: string;
  previewUrl?: string;
}

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  visualizerBriefing?: string;
  previewUrl?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  style: string;
}

export interface QuoteRequest {
  name: string;
  email: string;
  projectType: 'interior' | 'exterior' | 'consultation';
  message: string;
}

export interface ConsultationPreferences {
  style: string;
  colors: string[];
  budget: 'low' | 'medium' | 'high' | 'luxury';
  roomType: string;
}

export interface StyleSuggestion {
  recommendation: string;
  furniture: { name: string; type: string; reason: string }[];
  colors: string[];
  atmosphere: string;
}
