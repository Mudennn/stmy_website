'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';

const highlights = [
    {
        title: "Builder Support & Mentorship",
        description: "1:1 guidance, code reviews, and squad matching to ship your first Solana project.",
        image: "/images/hero_image.png",
        id: "01",
    },
    {
        title: "Events & Hackathons",
        description: "KL meetups, Startup Village, and regional hackathons with global judges.",
        image: "/images/hero_image.png",
        id: "02",
    },
    {
        title: "Grants & Funding Access",
        description: "Curated Solana Foundation grants and ecosystem funding for Malaysian projects.",
        image: "/images/hero_image.png",
        id: "03",
    },
    {
        title: "Jobs, Bounties & Opportunities",
        description: "Superteam Earn Malaysia: bounties paying global crypto rates to local talent.",
        image: "/images/hero_image.png",
        id: "04",
    },
    {
        title: "Education & Workshops",
        description: "From Rust basics to DeFi DLMM, weekly sessions building real skills.",
        image: "/images/hero_image.png",
        id: "05",
    },
    {
        title: "Ecosystem Connections",
        description: "Direct intros to Phantom, Solana Labs, and top APAC founders.",
        image: "/images/hero_image.png",
        id: "06",
    }
];

export function Highlights() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    });

    return (
        <section ref={container} className="relative h-[600vh]">
            <div className="sticky top-0 h-screen w-full py-24 lg:py-36 flex items-center lg:items-stretch overflow-hidden">
                <div className="w-full p-4 lg:px-17.5 mx-auto flex flex-col lg:flex-row lg:justify-between ">

                    {/* Left Column: Sticky Title */}
                    <div className="lg:w-2/5 h-fit lg:h-full flex flex-col mb-6 lg:mb-0">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col justify-start md:justify-between h-full"
                        >
                            <div className='mb-6 lg:mb-0'>
                                <span className="text-primary text-sm tracking-widest uppercase ">
                                    /// 01 - HIGHLIGHT
                                </span>
                            </div>

                            <div>
                                <h2 className="text-4xl font-bold max-w-xs tracking-tighter leading-[0.9] text-white mb-4">
                                    What Superteam
                                    Malaysia Delivers
                                </h2>

                                <p className="text-base text-white leading-relaxed max-w-md">
                                    We empower Malaysian Solana builders through hands-on support across 6 core pillars.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Stacking Cards Container */}
                    <div className="lg:w-3/5 relative flex justify-center items-end w-full">
                        <div className="relative w-full max-w-full lg:max-w-160 h-80 lg:h-113.75">
                            {highlights.map((card, index) => {
                                return (
                                    <StackingCardItem
                                        key={card.id}
                                        index={index}
                                        total={highlights.length}
                                        progress={scrollYProgress}
                                        {...card}
                                    />
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function StackingCardItem({ title, description, image, index, total, progress }: any) {
    // Timing variables:
    // Each card enters and dominates its fraction of the scroll
    const step = 1 / total;
    const startEntry = index * step;
    const endEntry = (index + 1) * step;

    // Animation values:

    // 1. Entry Y: slide up from bottom
    const y = useTransform(progress,
        [startEntry - 0.1, startEntry],
        [800, 0]
    );

    // 2. Opacity: fade in and stay
    const opacity = useTransform(progress,
        [startEntry - 0.05, startEntry],
        [0, 1]
    );

    // 3. Scale: Start at 1, shrink slightly as cards stack on top
    const scale = useTransform(progress,
        [endEntry, 1],
        [1, 1 - (total - index) * 0.035]
    );

    // 4. Brightness/Darken: Dim as it gets covered
    const brightness = useTransform(progress,
        [endEntry, endEntry + 0.1],
        [1, 0.4]
    );

    return (
        <motion.div
            style={{
                y,
                opacity,
                scale,
                filter: `brightness(${brightness})`,
                zIndex: index + 1,
                // Manual offset for stacked appearance
                paddingTop: `${index * 12}px`,
            }}
            className="absolute inset-0"
        >
            <div className='bg-background h-full'>
                <div className="w-full h-full bg-linear-to-t from-[#683FEA]/20 to-[#000000] border border-stroke p-4 lg:p-10 flex flex-col overflow-hidden">

                    {/* Card Header (Image) - Rounded inner box */}
                    <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-background">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                    </div>

                    {/* Card Footer (Content) */}
                    <div className="pt-8">
                        <h3 className="text-2xl font-bold text-white tracking-tight pb-2">
                            {title}
                        </h3>
                        <p className="text-muted text-sm lg:text-lg">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
