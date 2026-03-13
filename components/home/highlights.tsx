'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

interface HighlightItem {
    id: string;
    title: string;
    description: string;
    image: string;
}

interface HighlightsProps {
    items?: HighlightItem[];
}

export function Highlights({ items }: HighlightsProps) {
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
                                    {"/// 01 - HIGHLIGHT"}
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
                    {items && items.length > 0 && (
                      <div className="lg:w-3/5 relative flex justify-center items-end w-full">
                        <div className="relative w-full max-w-full lg:max-w-160 h-100 lg:h-140">
                            {items.map((card, index) => {
                                return (
                                    <StackingCardItem
                                        key={card.id}
                                        index={index}
                                        total={items.length}
                                        progress={scrollYProgress}
                                        {...card}
                                    />
                                );
                            })}
                        </div>
                      </div>
                    )}

                </div>
            </div>
        </section>
    );
}

interface StackingCardItemProps {
    title: string;
    description: string;
    image: string;
    index: number;
    total: number;
    progress: MotionValue<number>;
}

function StackingCardItem({ title, description, image, index, total, progress }: StackingCardItemProps) {
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
            <div className='bg-hero h-full relative group overflow-hidden'>
                <div className="w-full h-full bg-linear-to-t from-[#683FEA]/20 to-[#000000] border border-stroke p-4 lg:p-10 flex flex-col overflow-hidden relative z-10">
                    
                    {/* Card Header (Image) - Rounded inner box */}
                    <div className="relative flex-1 w-full rounded-xl overflow-hidden bg-hero mt-10">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority={index === 0}
                        />
                    </div>

                    {/* Card Footer (Content) */}
                    <div className="pt-8">
                        <h3 className="text-2xl font-bold text-white tracking-tight pb-2">
                            {title}
                        </h3>
                        <p className="text-muted-text text-sm lg:text-lg">
                            {description}
                        </p>
                    </div>
                </div>

                {/* SVG Bevel Overlay - Folder Tab Mask */}
                <div className="absolute top-0 left-0 w-full pointer-events-none z-20">
                    {/* Folder Label */}
                    <div className="absolute top-2 lg:top-5 left-4 lg:left-7 transition-opacity duration-300">
                        <span className="text-white text-[12px] lg:text-sm tracking-[0.2em] uppercase whitespace-nowrap">
                            {index + 1 < 10 ? `0${index + 1}` : index + 1} — STMY
                        </span>
                    </div>

                    {/* Desktop: Tab moves from left to right */}
                    <svg className="hidden lg:block w-full h-20" viewBox="0 0 1000 80" preserveAspectRatio="none" fill="var(--hero)" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 200 0 L 280 50 L 1000 50 L 1000 0 Z" />
                        <path d="M 200 0 L 280 50 L 1000 50" stroke="var(--stroke)" strokeWidth="1" fill="none" />
                    </svg>

                    {/* Mobile: Smaller version */}
                    <svg className="block lg:hidden w-full h-10" viewBox="0 0 400 40" preserveAspectRatio="none" fill="var(--hero)" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 120 0 L 160 30 L 400 30 L 400 0 Z" />
                        <path d="M 120 0 L 160 30 L 400 30" stroke="var(--stroke)" strokeWidth="1" fill="none" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}
