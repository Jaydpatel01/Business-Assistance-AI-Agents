/**
 * Branding Configuration for PDF Reports
 * Allows customization of colors, logos, and company information
 */

export interface BrandingConfig {
  // Company Information
  companyName?: string;
  companyLogo?: string; // URL or base64 data URI
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;

  // Color Scheme
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  successColor?: string;
  warningColor?: string;
  dangerColor?: string;

  // Typography
  fontFamily?: 'Helvetica' | 'Times-Roman' | 'Courier';
  fontSize?: number;
  
  // Layout
  pageMargin?: number;
  headerHeight?: number;
  footerHeight?: number;
  
  // Features
  showLogo?: boolean;
  showCompanyInfo?: boolean;
  showWatermark?: boolean;
  watermarkText?: string;
  
  // Report Settings
  includeTableOfContents?: boolean;
  includeExecutiveSummary?: boolean;
  includeCharts?: boolean;
  includeTranscript?: boolean;
}

/**
 * Default branding configuration
 */
export const defaultBranding: BrandingConfig = {
  companyName: 'Executive Boardroom AI',
  primaryColor: '#3b82f6', // Blue
  secondaryColor: '#6b7280', // Gray
  accentColor: '#8b5cf6', // Purple
  successColor: '#10b981', // Green
  warningColor: '#f59e0b', // Orange
  dangerColor: '#ef4444', // Red
  fontFamily: 'Helvetica',
  fontSize: 11,
  pageMargin: 40,
  headerHeight: 60,
  footerHeight: 40,
  showLogo: false,
  showCompanyInfo: true,
  showWatermark: false,
  includeTableOfContents: false,
  includeExecutiveSummary: true,
  includeCharts: true,
  includeTranscript: true,
};

/**
 * Preset branding themes
 */
export const brandingPresets: Record<string, BrandingConfig> = {
  professional: {
    ...defaultBranding,
    companyName: 'Executive Boardroom AI',
    primaryColor: '#1e40af', // Deep Blue
    secondaryColor: '#475569', // Slate
    accentColor: '#0891b2', // Cyan
    fontFamily: 'Times-Roman',
  },
  modern: {
    ...defaultBranding,
    companyName: 'Executive Boardroom AI',
    primaryColor: '#7c3aed', // Violet
    secondaryColor: '#64748b', // Cool Gray
    accentColor: '#06b6d4', // Bright Cyan
    fontFamily: 'Helvetica',
  },
  corporate: {
    ...defaultBranding,
    companyName: 'Executive Boardroom AI',
    primaryColor: '#1f2937', // Dark Gray
    secondaryColor: '#6b7280', // Medium Gray
    accentColor: '#3b82f6', // Blue
    fontFamily: 'Times-Roman',
    showWatermark: true,
    watermarkText: 'CONFIDENTIAL',
  },
  financial: {
    ...defaultBranding,
    companyName: 'Executive Boardroom AI',
    primaryColor: '#047857', // Forest Green
    secondaryColor: '#334155', // Slate
    accentColor: '#0891b2', // Cyan
    fontFamily: 'Times-Roman',
    includeTableOfContents: true,
  },
  tech: {
    ...defaultBranding,
    companyName: 'Executive Boardroom AI',
    primaryColor: '#6366f1', // Indigo
    secondaryColor: '#71717a', // Zinc
    accentColor: '#ec4899', // Pink
    fontFamily: 'Helvetica',
  },
};

/**
 * Merge user branding with defaults
 */
export function mergeBranding(
  userBranding?: Partial<BrandingConfig>
): BrandingConfig {
  return {
    ...defaultBranding,
    ...userBranding,
  };
}

/**
 * Get preset branding by name
 */
export function getPresetBranding(
  presetName: keyof typeof brandingPresets
): BrandingConfig {
  return brandingPresets[presetName] || defaultBranding;
}

/**
 * Validate branding configuration
 */
export function validateBranding(branding: BrandingConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate colors (must be hex format)
  const colorFields = [
    'primaryColor',
    'secondaryColor',
    'accentColor',
    'successColor',
    'warningColor',
    'dangerColor',
  ] as const;

  colorFields.forEach((field) => {
    const color = branding[field];
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      errors.push(`${field} must be a valid hex color (e.g., #3b82f6)`);
    }
  });

  // Validate font size
  if (branding.fontSize && (branding.fontSize < 8 || branding.fontSize > 16)) {
    errors.push('fontSize must be between 8 and 16');
  }

  // Validate margins
  if (branding.pageMargin && (branding.pageMargin < 20 || branding.pageMargin > 100)) {
    errors.push('pageMargin must be between 20 and 100');
  }

  // Validate logo URL if provided
  if (branding.companyLogo) {
    const isValidUrl = /^https?:\/\/.+/.test(branding.companyLogo);
    const isDataUri = /^data:image\/(png|jpeg|jpg|svg\+xml);base64,.+/.test(branding.companyLogo);
    
    if (!isValidUrl && !isDataUri) {
      errors.push('companyLogo must be a valid HTTP(S) URL or data URI');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export branding configuration as JSON
 */
export function exportBrandingConfig(branding: BrandingConfig): string {
  return JSON.stringify(branding, null, 2);
}

/**
 * Import branding configuration from JSON
 */
export function importBrandingConfig(json: string): BrandingConfig {
  try {
    const parsed = JSON.parse(json);
    const validation = validateBranding(parsed);
    
    if (!validation.valid) {
      throw new Error(`Invalid branding config: ${validation.errors.join(', ')}`);
    }
    
    return mergeBranding(parsed);
  } catch (error) {
    console.error('Error importing branding config:', error);
    return defaultBranding;
  }
}
