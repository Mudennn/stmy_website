import { getAllMembers } from "@/lib/data/members";
import { MemberDirectory } from "@/components/members/members-directory";
import { Footer } from "@/components/home/footer";
import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members | Superteam Malaysia",
  description: "Meet the developers, designers, and creators powering the Malaysian Solana ecosystem.",
};

export default async function MembersPage() {
  const members = await getAllMembers();

  return (
    <main className="min-h-screen bg-hero">
      <header className="relative z-20 flex items-start justify-between">
        <div className="relative flex flex-col items-start gap-1">
          <Link href="/" className="pl-4 lg:pl-17.5 pt-6 lg:pt-11">
            <Image
              src="/images/stmy-logo 1.png"
              alt="STMY Logo"
              width={68}
              height={64}
              className="h-auto"
            />
          </Link>
        </div>
        <div className="relative flex items-center h-31.25 pr-4 lg:pr-17.5">
            <Navbar />
        </div>
      </header>

      <div className="pt-10 pb-20 px-4 lg:px-17.5 mx-auto">
        <MemberDirectory initialMembers={members} />
      </div>
      <Footer />
    </main>
  );
}
