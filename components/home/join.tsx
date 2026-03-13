'use client';

import Image from 'next/image';
import { Twitter, Send, Calendar } from 'lucide-react';

interface SocialLink {
    platform?: string
    href: string
    icon?: string
}

interface JoinCommunityProps {
    socials?: SocialLink[]
}

export function JoinCommunity({ socials = [] }: JoinCommunityProps) {
    return (
        <section className="pt-24 lg:pt-36">
            <div className="relative w-full mx-auto overflow-hidden group">

                {/* Main Container */}
                <div className="relative w-full bg-hero min-h-100 lg:min-h-196.25 flex items-center overflow-hidden">

                    {/* SVG Bevel Overlay - Top Right */}
                    <div className="absolute top-0 right-0 pointer-events-none z-5">
                        {/* Desktop */}
                        <svg className="hidden lg:block w-112.5 h-30" viewBox="0 0 450 120" fill="var(--hero)" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0 L120 120 L450 120 L450 0 Z" />
                        </svg>
                    </div>

                    {/* SVG Bevel Overlay - Bottom Left */}
                    <div className="absolute bottom-0 left-0 pointer-events-none z-5">
                        {/* Desktop */}
                        <svg className="hidden lg:block w-112.5 h-30" viewBox="0 0 450 120" fill="var(--hero)" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0 L330 0 L450 120 L0 120 Z" />
                        </svg>
                    </div>
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0 ">
                        <Image
                            src="/images/cta.png" 
                            alt="Superteam Malaysia"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-hero via-hero/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 w-full px-8 lg:px-20 max-w-xl text-center lg:text-left">
                        <h2 className="text-4xl lg:text-9xl font-bold  text-white whitespace-nowrap">
                            Join Our
                        </h2>
                        <span className="text-4xl lg:text-9xl font-bold  text-white ml-0 lg:ml-16">Community</span>

                    </div>

                    {/* Social Icons */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 lg:left-auto lg:right-60 lg:translate-x-0 lg:bottom-20 flex items-center justify-center lg:justify-start gap-4">
                        {socials.map((social, i) => {
                            const Icon = social.icon === 'Twitter' ? Twitter : social.icon === 'Send' ? Send : Calendar
                            return (
                                <a key={i} href={social.href} className="w-20 h-20 flex items-center justify-center border border-white/20 bg-white/5 hover:bg-white transition-all rounded-none backdrop-blur-sm group/btn">
                                    <Icon size={32} className='text-white group-hover/btn:text-primary transition-colors duration-300' />
                                </a>
                            )
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
}
