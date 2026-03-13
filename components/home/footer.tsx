'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

const Socials = [
    { name: "Twitter", href: "#" },
    { name: "Telegram", href: "#" },
    { name: "Discord", href: "#" },
    { name: "GitHub", href: "#" },
];

export function Footer() {
    return (
        <footer className="bg-hero pt-24 px-4 lg:px-17.5 text-white/80 pb-6">
            <div className="max-w-7xl mx-auto flex flex-col min-h-[50vh] justify-between gap-24">
                
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8 items-start pt-16">
                    
                    {/* Left: Contact */}
                    <div className="flex flex-col gap-6 max-w-sm">
                        <span className="text-primary text-sm uppercase tracking-widest font-semibold">Contact</span>
                        <p className="text-xl leading-relaxed text-white">
                            Reach out for partnerships, ecosystem collaborations, 
                            or just to say hi.
                        </p>
                        <a href="mailto:hello@superteam.fun" className="w-fit flex items-center group font-medium mt-2">
                            <div className="border border-stroke bg-white/5 rounded-l-xl px-5 py-3 group-hover:bg-white group-hover:text-black transition-colors">
                                hello@superteam.fun
                            </div>
                            <div className="border border-l-0 border-stroke bg-white/5 rounded-r-xl p-3 group-hover:bg-white group-hover:text-black transition-colors flex items-center justify-center">
                                <ArrowUpRight size={24} />
                            </div>
                        </a>
                    </div>
                    
                    {/* Middle: Socials */}
                    <div className="flex flex-col gap-6">
                        <span className="text-primary text-sm uppercase tracking-widest font-semibold">Socials</span>
                        <div className="flex flex-col gap-3">
                            {Socials.map((social) => (
                                <a key={social.name} href={social.href} className="w-fit flex items-center group font-medium">
                                    <div className="border border-stroke bg-white/5 rounded-l-xl px-5 py-2.5 min-w-35 lg:min-w-30 group-hover:bg-white group-hover:text-black transition-colors">
                                        {social.name}
                                    </div>
                                    <div className="border border-l-0 border-stroke bg-white/5 rounded-r-xl p-2.5 group-hover:bg-white group-hover:text-black transition-colors flex items-center justify-center">
                                        <ArrowUpRight size={24} />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right: Giant STMY */}
                    <div className="flex justify-start lg:justify-end items-center h-full relative">
                        <Image src="/images/stmy-logo 1.png" alt="Superteam Malaysia" width={200} height={200} className='object-cover'/>
                    </div>
                    
                </div>
                
                {/* Bottom Bar */}
                <div className="pt-6 border-t border-stroke/50 ">
                    <span className="text-muted text-sm">
                        All rights reserved. © {new Date().getFullYear()} Superteam Malaysia.
                    </span>
                </div>
                
            </div>
        </footer>
    );
}
