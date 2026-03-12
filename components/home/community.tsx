"use client";

import React from "react";
import Image from "next/image";
import { motion, motionValue, useMotionTemplate } from "motion/react";
import { Tweet } from "react-tweet";

interface Testimonial {
  id?: number | string;
  content: string;
  author: string;
  avatar: string;
  tweetUrl?: string;
}

interface CommunityProps {
  testimonials: Testimonial[];
}

export function Community({ testimonials }: CommunityProps) {
  return (
    <section className="pt-24 lg:pt-36 px-4 lg:px-17.5">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primary text-sm uppercase tracking-widest block mb-8">
            {"/// 06 - COMMUNITY"}
          </span>
          <h2 className="text-4xl font-bold tracking-tighter text-white mb-6">
            Wall of Love
          </h2>
          <p className="text-xl text-white leading-relaxed">
            In just a short time, Superteam Malaysia has grown from a small
            Telegram chat into a nationwide Solana builder hub. Connecting
            thousands of members, dozens of events, and real projects earning in
            crypto across Malaysia.
          </p>
        </motion.div>
      </div>

      {/* Testimonials Masonry */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={t.id} className="break-inside-avoid mb-6">
            <TestimonialCard t={t} i={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

function extractTweetId(url: string): string {
  // Clean URL - remove query params and trailing characters
  const cleanUrl = url.split("?")[0].trim();
  const match = cleanUrl.match(/\/status\/(\d+)/);
  return match ? match[1] : "";
}

function TestimonialCard({ t, i }: { t: Testimonial; i: number }) {
  const mouseX = motionValue(0);
  const mouseY = motionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // If tweet URL exists, show tweet without card styling
  if (t.tweetUrl && t.tweetUrl.trim()) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.05 }}
        className=""
      >
        <Tweet id={extractTweetId(t.tweetUrl)} />
      </motion.div>
    );
  }

  // Otherwise show text testimonial in card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      onMouseMove={onMouseMove}
      className="group relative border border-stroke py-12 px-6 rounded-xl flex flex-col justify-between overflow-hidden bg-hero"
    >
      {/* Spotlight Gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`
                        radial-gradient(
                            300px circle at ${mouseX}px ${mouseY}px,
                            rgba(104, 63, 234, 0.15),
                            transparent 100%
                        )
                    `,
        }}
      />

      <div className="relative z-10">
        {t.content && (
          <p className="text-white/90 text-lg leading-relaxed mb-12">
            &ldquo;{t.content}&rdquo;
          </p>
        )}

        <div className="flex items-center gap-3">
          {t.avatar && (
            <div className="relative w-10 h-10 overflow-hidden rounded-full flex items-center justify-center">
              <Image
                src={t.avatar}
                alt={t.author}
                fill
                className="object-cover"
              />
            </div>
          )}
          <span className="text-white font-medium group-hover:text-white transition-colors">
            {t.author}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
