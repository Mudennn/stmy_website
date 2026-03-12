'use client';

import React from 'react';
import Image from 'next/image';
import { motion, motionValue, useMotionTemplate } from 'motion/react';

const testimonials = [
    {
        id: 1,
        content: "Just won my first global bounty on @SuperteamEarn! Huge shoutout to @SuperteamMY for the code reviews and late-night debugging sessions. Earning in USDC while sitting in KL feels unreal",
        author: "@SolanaDevMY",
        avatar: "/images/hero_image.png"
    },
    {
        id: 2,
        content: "The energy at the @SuperteamMY Startup Village was insane. Met 50+ builders, shipped a DeFi MVP on Solana in 48 hours, and had the best nasi lemak of my life. The Malaysian Web3 scene is so back.",
        author: "@CryptoKakis",
        avatar: "/images/hero_image.png"
    },
    {
        id: 3,
        content: "3 months ago I didn't know what a PDA or an SPL token was. Today I just deployed my first Solana smart contract. Thank you @SuperteamMY for the free workshops and endless patience! 🦀💧",
        author: "@RustStudentKL",
        avatar: "/images/hero_image.png"
    },
    {
        id: 4,
        content: "Malaysia is quietly becoming one of the strongest builder hubs on Solana. The sheer talent, hustle, and high-quality code coming out of @SuperteamMY right now is incredible. Keep shipping! 🌐🇲🇾",
        author: "@SolanaEcosystemLeader",
        avatar: "/images/hero_image.png"
    },
    {
        id: 5,
        content: "Got my first freelance gig in Web3 designing a dApp UI, all thanks to the @SuperteamMY network. Paid in crypto, zero friction. If you're a creative in Malaysia, you need to be in this Discord.",
        author: "@DesignByMY",
        avatar: "/images/hero_image.png"
    },
    {
        id: 6,
        content: "We just secured our first ecosystem grant! 🥳 None of this would be possible without the @SuperteamMY crew connecting us with the right mentors and helping us refine our pitch. LFG!",
        author: "@Web3FounderMY",
        avatar: "/images/hero_image.png"
    },
    {
        id: 7,
        content: "Who said you need to code to be in Web3? Just won the Content Track for the Superteam Malaysia Bountython! Writing threads and getting paid in $SOL. Grateful for this community. ✍️",
        author: "@Web3Writer",
        avatar: "/images/hero_image.png"
    },
    {
        id: 8,
        content: "Transitioning from Web2 to Web3 was intimidating, but having the @SuperteamMY squad backing me up and pointing me to real, vetted opportunities made all the difference. Full-time on Solana now. ⚒️",
        author: "@FullStackKL",
        avatar: "/images/hero_image.png"
    },
    {
        id: 9,
        content: "Nothing beats talking about high-throughput blockchains, Metaplex standards, and liquidity pools over a 2am teh tarik. @SuperteamMY IRL meetups hit different. ☕📈",
        author: "@DeFi_Dan",
        avatar: "/images/hero_image.png"
    }
];

export function Community() {
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
                        /// 06 - COMMUNITY
                    </span>
                    <h2 className="text-4xl font-bold tracking-tighter text-white mb-6">
                        Wall of Love
                    </h2>
                    <p className="text-xl text-white leading-relaxed">
                        In just a short time, Superteam Malaysia has grown from a small Telegram chat into 
                        a nationwide Solana builder hub. Connecting thousands of members, dozens of 
                        events, and real projects earning in crypto across Malaysia.
                    </p>
                </motion.div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                    <TestimonialCard key={t.id} t={t} i={i} />
                ))}
            </div>
        </section>
    );
}

function TestimonialCard({ t, i }: { t: any; i: number }) {
    const mouseX = motionValue(0);
    const mouseY = motionValue(0);

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            onMouseMove={onMouseMove}
            className="group relative border border-stroke py-12 px-6 rounded-xl flex flex-col justify-between overflow-hidden bg-background"
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
                <p className="text-white/90 text-lg leading-relaxed mb-12">
                    "{t.content}"
                </p>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 overflow-hidden">
                        <Image
                            src={t.avatar}
                            alt={t.author}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-white font-medium group-hover:text-white transition-colors">
                        {t.author}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
