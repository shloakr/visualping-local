import { createClient } from '@supabase/supabase-js';

// Types for our database
export interface TrackedUrl {
  id: string;
  email: string;
  resend_api_key: string;
  ucla_url: string;
  class_name: string | null;
  term_code: string | null;
  subject_area: string | null;
  catalog_number: string | null;
  selector: string;
  check_interval: 'hourly' | '6hours' | 'daily';
  expires_at: string | null;
  baseline_hash: string | null;
  baseline_content: string | null;
  last_checked_at: string | null;
  last_change_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailToken {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

// Client-side Supabase client (limited access)
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client (full access with service role)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Parse UCLA class URL to extract course info
export function parseUclaUrl(url: string): {
  termCode: string;
  subjectArea: string;
  catalogNumber: string;
  classId: string;
} | null {
  try {
    const urlObj = new URL(url);
    
    // Must be UCLA SOC domain
    if (!urlObj.hostname.includes('sa.ucla.edu')) {
      return null;
    }

    const params = urlObj.searchParams;
    const termCode = params.get('term_cd');
    const subjectArea = params.get('subj_area_cd')?.trim();
    const catalogNumber = params.get('crs_catlg_no')?.trim();
    const classId = params.get('class_id');

    if (!termCode || !subjectArea || !catalogNumber || !classId) {
      return null;
    }

    return {
      termCode,
      subjectArea,
      catalogNumber,
      classId,
    };
  } catch {
    return null;
  }
}

// Format term code to human readable
export function formatTermCode(termCode: string): string {
  // UCLA term codes: YYQ where YY is year and Q is quarter
  // e.g., 26W = Winter 2026, 26S = Spring 2026, 261 = Summer 2026, 26F = Fall 2026
  const year = '20' + termCode.substring(0, 2);
  const quarter = termCode.charAt(2);
  
  const quarterMap: Record<string, string> = {
    'F': 'Fall',
    'W': 'Winter',
    'S': 'Spring',
    '1': 'Summer',
  };

  return `${quarterMap[quarter] || quarter} ${year}`;
}

// Generate a friendly class name from parsed URL data
export function generateClassName(parsed: ReturnType<typeof parseUclaUrl>): string {
  if (!parsed) return 'Unknown Class';
  
  const subject = parsed.subjectArea.replace(/\s+/g, ' ').trim();
  const catalog = parsed.catalogNumber.replace(/\s+/g, '').trim();
  
  return `${subject} ${catalog}`;
}
