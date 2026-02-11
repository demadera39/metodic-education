import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables we'll use
export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  symptoms: string[];
  causes: string[];
  panic_script: string;
  related_methods: string[];
  related_recipes: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

export interface Method {
  id: string;
  slug: string;
  name: string;
  description: string;
  when_to_use: string;
  how_it_works: string;
  duration_range: string;
  group_size_range: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  related_problems: string[];
  created_at: string;
}

export interface Framework {
  id: string;
  slug: string;
  name: string;
  description: string;
  phases: { name: string; description: string }[];
  when_to_use: string;
  source?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  problem: string;
  outcome: string;
  duration_minutes: number;
  why_it_works: string;
  methods_used: string[];
}
