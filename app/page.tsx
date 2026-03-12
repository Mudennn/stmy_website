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

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Highlights />
      <Stats />
      <Events />
      <MemberSpotlight />
      <Partners />
      <Community />
      <FAQ />
      <JoinCommunity />
      <Footer />
    </main>
  );
}
