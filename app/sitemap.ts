import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/config"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch latest member modification date
  const { data: latestMember } = await supabase
    .from("members")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)

  const memberLastModified = latestMember?.[0]?.updated_at
    ? new Date(latestMember[0].updated_at)
    : new Date("2025-01-01") // Fallback to a static date

  return [
    {
      url: SITE_URL,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/members`,
      lastModified: memberLastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]
}
