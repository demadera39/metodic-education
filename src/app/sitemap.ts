import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://www.metodic.education";

// Revalidate sitemap every hour (ISR)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // Static pages
  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/methods", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/challenges", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/playbooks", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/frameworks", priority: 0.9, changeFrequency: "weekly" as const },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // Methods (education_methods + curated_methods)
  const { data: educationMethods } = await supabase
    .from("education_methods")
    .select("slug, updated_at")
    .eq("is_published", true);

  const { data: curatedMethods } = await supabase
    .from("curated_methods")
    .select("slug, updated_at")
    .eq("is_active", true);

  const methodSlugs = new Set<string>();

  for (const m of educationMethods || []) {
    if (m.slug && !methodSlugs.has(m.slug)) {
      methodSlugs.add(m.slug);
      entries.push({
        url: `${BASE_URL}/methods/${m.slug}`,
        lastModified: m.updated_at ? new Date(m.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  for (const m of curatedMethods || []) {
    if (m.slug && !methodSlugs.has(m.slug)) {
      methodSlugs.add(m.slug);
      entries.push({
        url: `${BASE_URL}/methods/${m.slug}`,
        lastModified: m.updated_at ? new Date(m.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7, // Curated methods slightly lower than editorial
      });
    }
  }

  // Challenges
  const { data: challenges } = await supabase
    .from("education_challenges")
    .select("slug, updated_at")
    .eq("is_published", true);

  for (const c of challenges || []) {
    entries.push({
      url: `${BASE_URL}/challenges/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Playbooks
  const { data: playbooks } = await supabase
    .from("education_playbooks")
    .select("slug, updated_at")
    .eq("is_published", true);

  for (const p of playbooks || []) {
    entries.push({
      url: `${BASE_URL}/playbooks/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Frameworks (active only)
  const { data: frameworks } = await supabase
    .from("learning_frameworks")
    .select("slug, updated_at")
    .eq("is_active", true);

  for (const f of frameworks || []) {
    entries.push({
      url: `${BASE_URL}/frameworks/${f.slug}`,
      lastModified: f.updated_at ? new Date(f.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
