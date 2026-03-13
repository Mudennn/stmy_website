"use client";

import Image from "next/image";
import Link from "next/link";

const Socials = [
  { name: "MEMBER DIRECTORY", href: "/member" },
  { name: "TWITTER", href: "https://x.com/SuperteamMY" },
  { name: "TELEGRAM", href: "https://t.me/SuperteamMY#" },
  { name: "LUMA", href: "https://luma.com/mysuperteam" },
  { name: "EARN", href: "https://superteam.fun/earn/s/superteammalaysia" },
];

export function Footer() {
  return (
    <footer className="bg-hero px-4 lg:px-17.5 text-white py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Image
            src="/images/stmy-logo 1.png"
            alt="Superteam Malaysia"
            width={80}
            height={80}
            className="object-cover"
          />

          {/* Social Links */}
          <div className="flex flex-wrap lg:flex-nowrap justify-center gap-6 lg:gap-8 text-sm text-muted-text tracking-wide">
            {Socials.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="hover:text-white transition-colors"
              >
                {social.name}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <span className="text-xs lg:text-sm">
            © {new Date().getFullYear()} Superteam Malaysia
          </span>
        </div>
      </div>
    </footer>
  );
}
