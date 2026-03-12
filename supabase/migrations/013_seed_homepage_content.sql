-- Migration 013: Seed homepage content into cms_content table
-- Only store metadata that extraction functions actually use.
-- Section headers/descriptions are hardcoded in components.

-- Drop constraint if it exists (for idempotency)
ALTER TABLE public.cms_content
DROP CONSTRAINT IF EXISTS cms_content_section_unique;

-- Add unique constraint on section (1:1 mapping, prevents duplicates)
ALTER TABLE public.cms_content
ADD CONSTRAINT cms_content_section_unique UNIQUE (section);

-- Seed only the CMS-editable metadata for each section
INSERT INTO public.cms_content (section, metadata, sort_order, is_published, created_at, updated_at)
VALUES
  -- 1. Hero - CMS editable: ctaPrimary, ctaSecondary
  (
    'hero',
    '{"ctaPrimary": {"label": "Join the Community", "href": "#"}, "ctaSecondary": {"label": "Explore Opportunities", "href": "#"}}'::jsonb,
    1,
    true,
    now(),
    now()
  ),
  -- 2. Highlights - CMS editable: items array
  (
    'mission',
    '{
      "items": [
        {"id": "1", "title": "Builder Support & Mentorship", "description": "", "image": "/images/hero_image.png"},
        {"id": "2", "title": "Events & Hackathons", "description": "", "image": "/images/hero_image.png"},
        {"id": "3", "title": "Grants & Funding Access", "description": "", "image": "/images/hero_image.png"},
        {"id": "4", "title": "Jobs, Bounties & Opportunities", "description": "", "image": "/images/hero_image.png"},
        {"id": "5", "title": "Education & Workshops", "description": "", "image": "/images/hero_image.png"},
        {"id": "6", "title": "Ecosystem Connections", "description": "", "image": "/images/hero_image.png"}
      ]
    }'::jsonb,
    2,
    true,
    now(),
    now()
  ),
  -- 3. Stats - CMS editable: counterValues array
  (
    'stats',
    '{"counterValues": [3000, 40, 50, 40]}'::jsonb,
    3,
    true,
    now(),
    now()
  ),
  -- 4. Community Wall - CMS editable: testimonials array (with optional tweet embed)
  (
    'community_wall',
    '{
      "testimonials": [
        {"id": 1, "content": "Superteam Malaysia changed my life. I went from learning Web3 basics to building my own project and earning crypto income.", "author": "@SolanaDevMY", "avatar": "/images/hero_image.png", "tweetUrl": ""},
        {"id": 2, "content": "The community here is incredible. Everyone is supportive and willing to help you grow as a builder.", "author": "@CryptoKakis", "avatar": "/images/hero_image.png", "tweetUrl": ""},
        {"id": 3, "content": "Found amazing opportunities and met great people through STMY. Highly recommend!", "author": "@RustStudentKL", "avatar": "/images/hero_image.png", "tweetUrl": ""}
      ]
    }'::jsonb,
    4,
    true,
    now(),
    now()
  ),
  -- 5. FAQ - CMS editable: items array
  (
    'faq',
    '{
      "items": [
        {"question": "What is Superteam Malaysia?", "answer": "We are the official Malaysian community for the Solana ecosystem. We operate as a talent network and incubator, helping local developers, designers, and creators learn Web3 skills, launch projects, and earn global crypto income right from home."},
        {"question": "How do I join?", "answer": "You can join our community by joining our Discord and following us on Twitter. We host regular onboarding calls and IRL events where you can meet the team and other builders."},
        {"question": "What opportunities are available?", "answer": "We offer bounties, grants, and job opportunities within the Solana ecosystem. Whether you are a developer, designer, or content creator, there is always something to build or contribute to."}
      ]
    }'::jsonb,
    5,
    true,
    now(),
    now()
  ),
  -- 6. Join CTA - CMS editable: socials array
  (
    'join_cta',
    '{"socials": [{"platform": "twitter", "href": "#", "icon": "Twitter"}, {"platform": "telegram", "href": "#", "icon": "Send"}, {"platform": "discord", "href": "#", "icon": "Disc"}]}'::jsonb,
    6,
    true,
    now(),
    now()
  )
ON CONFLICT (section) DO NOTHING;
