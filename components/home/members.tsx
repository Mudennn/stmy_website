'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

interface Member {
    id: number | string;
    full_name: string;
    role_title: string | null;
    avatar_url: string | null;
}

interface MemberSpotlightProps {
    members: Member[];
}

export function MemberSpotlight({ members }: MemberSpotlightProps) {
    return (
        <section className="pt-24 lg:pt-36 px-4 lg:px-17.5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                
                {/* Left Side: Content */}
                
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-primary text-sm uppercase tracking-widest block mb-14">
                             {"/// 04 - MEMBER SPOTLIGHT "}
                        </span>
                        <h2 className="text-4xl font-bold tracking-tighter text-white leading-none mb-4">
                            The Builders Behind<br />Superteam Malaysia
                        </h2>
                        <p className="text-xl text-white leading-relaxed max-w-xl mb-14">
                            Meet the developers, designers, and creators powering the
                            Malaysian Solana ecosystem. Every member here has shown
                            up, shipped work, and earned their place in the community.
                        </p>

                        <Link href="/members">
                            <button className="flex items-center gap-2 bg-white/90 hover:bg-white text-black px-8 py-4 rounded-xl text-sm font-bold transition-all group">
                                See All Members
                                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
               

                {/* Right Side: Grid */}
               
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
                        {members.map((member, i) => (
                            <motion.div
                                key={`${member.id}-${i}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (i % 3) * 0.1 }}
                                className="flex flex-col gap-4"
                            >
                                {/* Beveled Avatar Container */}
                                {member.avatar_url && (
                                    <div
                                        className="relative aspect-square w-full  h-full bg-secondary overflow-hidden group-hover:scale-105 transition-transform duration-300"
                                        style={{
                                            clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
                                        }}
                                    >
                                        <Image
                                            src={member.avatar_url}
                                            alt={member.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold text-white">
                                        {member.full_name}
                                    </h4>
                                    {member.role_title && (
                                        <p className="text-muted-text text-base font-medium">
                                            {member.role_title}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
        </section>
    );
}
