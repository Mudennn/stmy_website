import { Hero } from "@/components/home/hero";
import { Highlights } from "@/components/home/highlights";
import { Stats } from "@/components/home/stats";
import { Events } from "@/components/home/events";
import { MemberSpotlight } from "@/components/home/members";
import { Partners } from "@/components/home/partners";
import { Community } from "@/components/home/community";
import { FAQ } from "@/components/home/faq";
import { JoinCommunity } from "@/components/home/join";
import { Footer } from "@/components/home/footer";
import { AnnouncementButton } from "@/components/home/announcement-button";
import {
  getHomepageContent,
  getHomepageEvents,
  getHomepageMembers,
  getHomepagePartners,
  getHomepageAnnouncement,
  extractHeroProps,
  extractHighlightsProps,
  extractStatsProps,
  extractMembersSpotlightProps,
  extractPartnersProps,
  extractCommunityProps,
  extractFaqProps,
  extractJoinCtaProps,
} from "@/lib/data/homepage";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  // Fetch all homepage data in parallel
  const [contentMap, eventsData, membersData, partnersData, announcement] = await Promise.all([
    getHomepageContent(),
    getHomepageEvents(5),
    getHomepageMembers(9),
    getHomepagePartners(),
    getHomepageAnnouncement(),
  ]);

  // Extract typed props with fallback defaults
  const heroProps = extractHeroProps(contentMap.get("hero"));
  const highlightsProps = extractHighlightsProps(contentMap.get("mission"));
  const statsProps = extractStatsProps(contentMap.get("stats"));
  const membersSpotlightProps = extractMembersSpotlightProps();
  const partnersProps = extractPartnersProps();
  const communityProps = extractCommunityProps(contentMap.get("community_wall"));
  const faqProps = extractFaqProps(contentMap.get("faq"));
  const joinCtaProps = extractJoinCtaProps(contentMap.get("join_cta"));

  return (
    <main className="min-h-screen bg-hero">
      {announcement && (
        <AnnouncementButton message={announcement.message} />
      )}
      <Hero {...heroProps} />
      <Highlights {...highlightsProps} />
      <Stats {...statsProps} />
      <Events upcomingEvents={eventsData.upcoming} pastEvents={eventsData.past} />
      <MemberSpotlight {...membersSpotlightProps} members={membersData} />
      <Partners {...partnersProps} partners={partnersData} />
      <Community {...communityProps} />
      <FAQ {...faqProps} />
      <JoinCommunity {...joinCtaProps} />
      <Footer />
    </main>
  );
}
