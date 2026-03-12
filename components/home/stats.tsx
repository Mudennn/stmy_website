"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useInView, useMotionValue } from "motion/react";
import Image from "next/image";

// interface StatItemProps {
//     value: number;
//     label: string;
//     description: string;
//     suffix?: string;
// }

function Counter({ value, suffix = "+" }: { value: number; suffix?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
    });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(Math.floor(latest));
        });
    }, [springValue]);

    return (
        <span
            ref={ref}
            className="text-5xl text-primary tracking-tighter"
        >
            {displayValue.toLocaleString()}
            {suffix}
        </span>
    );
}

const AvatarRow = ({
    speed = 20,
    direction = "left",
    count = 10,
}: {
    speed?: number;
    direction?: "left" | "right";
    count?: number;
}) => {
    const avatars = Array.from({ length: count }).map((_, i) => ({
        id: i,
        src: `https://i.pravatar.cc/150?u=${i + (direction === "left" ? 0 : 20)}`,
    }));

    return (
        <div className="flex overflow-hidden gap-4 py-2">
            <motion.div
                animate={{
                    x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
                }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="flex gap-4 shrink-0"
            >
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        {avatars.map((avatar) => (
                            <div
                                key={avatar.id}
                                className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0"
                            >
                                <img
                                    src={avatar.src}
                                    alt="avatar"
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export function Stats() {
    const bountyBricks = [
        { title: "Website Design & Build Challenge" },
        { title: "Build a Telegram Intro Gatekeeper Bot" },
        { title: "Twitter Thread or Article" },
    ];

    return (
        <section className="relative pt-20 lg:pt-36 bg-background overflow-hidden">
            <div className="mx-auto px-4 lg:px-17.5">
                {/* Header */}
                <div className="max-w-3xl mb-16 lg:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-primary text-sm uppercase tracking-widest block mb-16">
              /// 02 - STATS
                        </span>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Impact of Superteam Malaysia
                        </h2>
                        <p className="text-lg text-white leading-relaxed max-w-2xl">
                            In just a short time, Superteam Malaysia has grown from a small
                            Telegram chat into a nationwide Solana builder hub. Connecting
                            thousands of members, dozens of events, and real projects earning
                            in crypto across Malaysia.
                        </p>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-fit">
                    {/* Left Large Card: Core Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group relative bg-background border border-stroke overflow-hidden flex flex-col justify-center px-6 lg:px-14 py-20 lg:py-22 gap-12"
                    >
                        {/* Background Radial Glow (Graph Area) */}
                        {/* <div
                            className="absolute pointer-events-none z-0"
                            style={{
                                width: '100%',
                                height: '100%',
                                right: '-10%',
                                bottom: '-20%',
                                background: 'radial-gradient(circle at 80% 80%, #683FEA 19%, rgba(10, 10, 10, 0) 100%)',
                                opacity: 0.15,
                            }}
                        /> */}

                        {/* Focused Beam Gradient */}
                        <div
                            className="absolute top-25 -left-40 lg:-left-37.5 pointer-events-none z-0 rotate-75 md:rotate-20 lg:rotate-38 blur-2xl opacity-30 rounded-full"
                            style={{
                                width: '657.88px',
                                height: '150.39px',
                                background: 'linear-gradient(90deg, #683FEA 0%, #CFBFFF 100%)',
                            }}
                        />

                        {/* Background Decorative Line (Solid) */}
                        <div className="absolute bottom-0 right-0">
                            <Image  src="/images/graph.png" alt="STMY" width={800} height={800}/>
                        </div>
                        {/* <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                            <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 400 600"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute inset-0"
                            >
                                <path
                                    d="M0 600 C80 570 120 610 160 570 C200 530 230 580 270 540 C310 500 330 570 360 510 C380 480 390 420 400 360"
                                    stroke="#683FEA"
                                    strokeWidth="1.5"
                                />
                                <g transform="translate(400, 360)">
                                    <circle r="12" fill="#683FEA" fillOpacity="0.4" />
                                    <circle r="6" fill="#683FEA" />
                                    <circle r="3" fill="white" />
                                </g>
                            </svg>
                        </div> */}

                        <div className="relative z-10">
                            <Counter value={3000} />
                            <h3 className="text-2xl font-medium text-white tracking-tight mt-6 mb-2">
                                Community members
                            </h3>
                            <p className="text-sm text-muted max-w-xs">
                                Active builders, students, and creators across Malaysia.
                            </p>
                        </div>

                        <div className="relative z-10">
                            <Counter value={40} />
                            <h3 className="text-2xl font-medium text-white tracking-tight mt-6 mb-2">
                                Events hosted
                            </h3>
                            <p className="text-sm text-muted max-w-xs">
                                Meetups, community calls, watch parties, and build sessions.
                            </p>
                        </div>

                        <div className="relative z-10">
                            <Counter value={50} />
                            <h3 className="text-2xl font-medium text-white tracking-tight mt-6 mb-2">
                                Projects built
                            </h3>
                            <p className="text-sm text-muted max-w-xs">
                                Hackathon teams and community projects shipped on Solana.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Column: Two Smaller Cards */}
                    <div className="flex flex-col gap-6">
                        {/* Top Right Card: Bounties */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-background border border-stroke p-6 md:p-14 relative flex flex-col justify-end h-96 md:flex-1 md:h-auto"
                        >
                            {/* Gradient Circle Background */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div
                                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-40"
                                    style={{
                                        background:
                                            "radial-gradient(circle, #683FEA 0%, #020817 100%)",
                                        filter: "blur(60px)",
                                    }}
                                />
                            </div>

                            {/* Falling Bricks Container */}
                            <div className="absolute top-12 right-4 lg:right-12 flex flex-col items-end gap-6 max-w-70">
                                {bountyBricks.map((brick, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            y: -100,
                                            opacity: 0,
                                            rotate: i % 2 === 0 ? -5 : 5,
                                        }}
                                        whileInView={{
                                            y: 0,
                                            opacity: 1,
                                            rotate: i % 2 === 0 ? -2 : 2,
                                        }}
                                        transition={{
                                            delay: 0.2 + i * 0.15,
                                            type: "spring",
                                            stiffness: 120,
                                            damping: 12,
                                        }}
                                        viewport={{ once: true }}
                                        style={{
                                            background:
                                                "linear-gradient(to top, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 46%, rgba(255, 255, 255, 0.1) 100%)",
                                        }}
                                        className="px-6 py-2 backdrop-blur-md text-sm rounded-sm text-white whitespace-nowrap"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-0.75 h-5 bg-primary" />
                                            {brick.title}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <Counter value={40} />
                                <h3 className="text-2xl font-medium text-white tracking-tight mt-6 mb-2">
                                    Bounties completed
                                </h3>
                                <p className="text-base text-muted">
                                    Paid submissions through Superteam Earn
                                </p>
                            </div>
                        </motion.div>

                        {/* Bottom Right Card: Reach */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex-1 border border-stroke p-6 md:p-14 flex flex-col justify-center overflow-hidden relative"
                            style={{
                                background:
                                    "linear-gradient(180deg,rgba(2, 8, 23, 1) 80%, rgba(104, 63, 234, 0.2) 100%)",
                            }}
                        >
                            <div
                                className="absolute inset-0 pointer-events-none z-10 w-full h-62.5"
                                style={{
                                    background:
                                        "radial-gradient(50% 50% at center, transparent 0%, var(--background) 85%)",
                                }}
                            />
                            <div className="relative">
                                <AvatarRow speed={18} direction="right" />
                                <AvatarRow speed={25} direction="left" />
                                <AvatarRow speed={18} direction="right" />
                            </div>

                            <div className="z-10 mt-10 md:mt-0">
                                <h3 className="text-2xl font-medium text-white tracking-tight mb-2">
                                    Nationwide community reach
                                </h3>
                                <p className="text-sm text-muted">Across Malaysia</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
