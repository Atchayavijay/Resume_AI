/**
 * Template Design Spec
 * Centralizes color palettes, layout presets, typography, and per-template overrides.
 * Use this to add or adjust templates in a structured way.
 */

import type { ResumeDesign } from './types';

/** Recursive partial for nested overrides */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// --- Color Palettes ---

export interface ColorPalette {
  accent: string;
  text: string;
  background: string;
}

export const COLOR_PALETTES: Record<string, ColorPalette> = {
  classicBlue: {
    accent: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff',
  },
  modernTeal: {
    accent: '#14b8a6',
    text: '#1f2937',
    background: '#ffffff',
  },
  minimalSlate: {
    accent: '#64748b',
    text: '#334155',
    background: '#ffffff',
  },
  corporateNavy: {
    accent: '#1e3a5f',
    text: '#1f2937',
    background: '#ffffff',
  },
  creativeOrange: {
    accent: '#ea580c',
    text: '#1f2937',
    background: '#ffffff',
  },
  elegantGray: {
    accent: '#374151',
    text: '#111827',
    background: '#ffffff',
  },
};

// --- Layout Presets ---

export interface LayoutPreset {
  columns: ResumeDesign['layout']['columns'];
  headerPosition: ResumeDesign['layout']['headerPosition'];
  columnWidths: { left: number; right: number };
}

export const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  oneColumnTop: {
    columns: 'one',
    headerPosition: 'top',
    columnWidths: { left: 44, right: 56 },
  },
  twoColumnLeft: {
    columns: 'two',
    headerPosition: 'left',
    columnWidths: { left: 35, right: 65 },
  },
  twoColumnRight: {
    columns: 'two',
    headerPosition: 'right',
    columnWidths: { left: 65, right: 35 },
  },
  mixLeft: {
    columns: 'mix',
    headerPosition: 'left',
    columnWidths: { left: 40, right: 60 },
  },
};

// --- Typography Presets ---

export interface TypographyPreset {
  fontFamily: string;
  headings: {
    style: string;
    capitalization: ResumeDesign['typography']['headings']['capitalization'];
    size: ResumeDesign['typography']['headings']['size'];
    icons: ResumeDesign['typography']['headings']['icons'];
  };
}

export const TYPOGRAPHY_PRESETS: Record<string, TypographyPreset> = {
  interUppercase: {
    fontFamily: 'Inter',
    headings: { style: 'classic', capitalization: 'uppercase', size: 'm', icons: 'none' },
  },
  poppinsCapitalize: {
    fontFamily: 'Poppins',
    headings: { style: 'classic', capitalization: 'capitalize', size: 'm', icons: 'outline' },
  },
  latoNone: {
    fontFamily: 'Lato',
    headings: { style: 'classic', capitalization: 'none', size: 'm', icons: 'none' },
  },
  robotoUppercase: {
    fontFamily: 'Roboto',
    headings: { style: 'classic', capitalization: 'uppercase', size: 'm', icons: 'outline' },
  },
  ralewayCapitalizeL: {
    fontFamily: 'Raleway',
    headings: { style: 'classic', capitalization: 'capitalize', size: 'l', icons: 'filled' },
  },
  ebGaramondCapitalizeL: {
    fontFamily: 'EB Garamond',
    headings: { style: 'classic', capitalization: 'capitalize', size: 'l', icons: 'none' },
  },
};

// --- Per-Template Spec ---

export type Persona = 'corporate' | 'modern' | 'creative';

export interface TemplateSpec {
  id: string;
  name: string;
  description: string;
  persona: Persona;
  layoutPreset: keyof typeof LAYOUT_PRESETS;
  colorPalette: keyof typeof COLOR_PALETTES;
  typographyPreset: keyof typeof TYPOGRAPHY_PRESETS;
  /** Partial overrides applied last (personalDetails, entryLayout, sectionSettings, etc.) */
  overrides?: DeepPartial<ResumeDesign>;
}

export const TEMPLATE_SPECS: TemplateSpec[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'One column, top header, timeless and professional',
    persona: 'corporate',
    layoutPreset: 'oneColumnTop',
    colorPalette: 'classicBlue',
    typographyPreset: 'interUppercase',
    overrides: {
      personalDetails: {
        align: 'left',
        arrangement: 'icon',
      },
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two columns, sidebar layout, clean and contemporary',
    persona: 'modern',
    layoutPreset: 'twoColumnLeft',
    colorPalette: 'modernTeal',
    typographyPreset: 'poppinsCapitalize',
    overrides: {
      personalDetails: {
        align: 'left',
        arrangement: 'icon',
        iconStyle: 'circle-filled',
      },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, centered design with subtle accents',
    persona: 'modern',
    layoutPreset: 'oneColumnTop',
    colorPalette: 'minimalSlate',
    typographyPreset: 'latoNone',
    overrides: {
      personalDetails: {
        align: 'center',
        arrangement: 'bullet',
        iconStyle: 'none',
      },
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Two columns, right sidebar, corporate-ready',
    persona: 'corporate',
    layoutPreset: 'twoColumnRight',
    colorPalette: 'corporateNavy',
    typographyPreset: 'robotoUppercase',
    overrides: {
      personalDetails: {
        align: 'left',
        arrangement: 'bar',
        iconStyle: 'square-filled',
      },
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Mixed layout with bold styling for standout applications',
    persona: 'creative',
    layoutPreset: 'mixLeft',
    colorPalette: 'creativeOrange',
    typographyPreset: 'ralewayCapitalizeL',
    overrides: {
      personalDetails: {
        align: 'left',
        arrangement: 'icon',
        iconStyle: 'rounded-filled',
      },
      sectionSettings: {
        skills: 'bubble',
        languages: 'grid',
        interests: 'grid',
        certificates: 'grid',
        education: { order: 'degree-school' },
        workExperience: { order: 'title-employer', groupPromotions: true },
      },
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Serif typography, refined and sophisticated',
    persona: 'creative',
    layoutPreset: 'oneColumnTop',
    colorPalette: 'elegantGray',
    typographyPreset: 'ebGaramondCapitalizeL',
    overrides: {
      personalDetails: {
        align: 'center',
        arrangement: 'pipe',
        iconStyle: 'circle-outline',
        nameSize: 'xl',
      },
      entryLayout: {
        titleSize: 'm',
        subtitleStyle: 'bold',
        subtitlePlacement: 'next-line',
        indentBody: false,
        listStyle: 'hyphen',
      },
    },
  },
];
