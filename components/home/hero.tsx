'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import Navbar from '../navbar';

export function Hero() {
    return (
        <section className="relative h-[750px] md:h-screen w-full overflow-hidden text-white">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero_image.png"
                    alt="Kuala Lumpur Skyline"
                    fill
                    priority
                    className="object-cover object-bottom"
                />
                {/* Gradients for readability and depth */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent opacity-50" /> */}
            </div>

            {/* Top Navbar Area */}
            <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between">
                {/* Logo Section */}
                <div className="relative flex flex-col items-start gap-1">
                    <div className='pl-4 lg:pl-17.5 pt-6 lg:pt-11'>
                        <Image
                            src="/images/stmy-logo 1.png"
                            alt="STMY Logo"
                            width={68}
                            height={64}
                            className="h-auto"
                        />
                    </div>
                </div>
                {/* Navigation Shape Section */}
                <div className="relative">
                    {/* The "Menu Container" */}
                    <div className="hidden bg-background py-10 px-17.5 w-95 h-31.25 rounded-bl-[30px] lg:flex items-center gap-10 shadow-2xl relative">
                        {/* 
                          SVG Inverted Corner (Concave)
                          This creates the smooth transition from the top edge to the dark navigation box.
                        */}
                        <div className="absolute top-0 -left-7.5 w-7.5 h-7.5 pointer-events-none">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 0V30C30 13.4315 16.5685 0 0 0H30Z" fill="var(--background)" />
                            </svg>
                        </div>
                        <div className='absolute'>
                            <Navbar />
                        </div>

                        <div className="absolute top-31 right-0 w-7.5 h-7.5 pointer-events-none">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 0V30C30 13.4315 16.5685 0 0 0H30Z" fill="var(--background)" />
                            </svg>
                        </div>
                    </div>
                     <div className='absolute lg:hidden'>
                            <Navbar />
                        </div>
                </div>
            </header>

            {/* Hero Content */}
            <div className="relative z-10 flex h-full flex-col justify-start md:justify-end px-4 lg:px-17.5 pb-0 md:pb-20 pt-40 mb:pt-0">
                <div className="flex flex-col md:flex-row justify-between items-end">
                    {/* Left Side: Main Heading */}
                    <div className="max-w-full lg:max-w-4xl">
                        <h1 className="text-4xl lg:text-6xl font-bold max-w-full md:max-w-lg tracking-tighter text-white">
                            Building the home
                            for Solana builders
                            in Malaysia
                        </h1>
                    </div>

                    {/* Right Side: Description and Buttons */}
                    <div className="flex flex-col items-start md:items-end text-left md:text-right gap-6 max-w-lg">
                        <p className="text-base lg:text-xl text-white font-medium max-w-md">
                            Superteam Malaysia is the official Solana community helping Malaysian developers and creators earn globally, without leaving home.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="default">Join the Community</Button>
                            <Button variant="outline">Explore Opportunities</Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}


{/* The "Menu Container" */ }
// <div className="bg-background py-10 px-17.5 rounded-bl-[30px] flex items-center gap-10 shadow-2xl relative">
{/* 
                          SVG Inverted Corner (Concave)
                          This creates the smooth transition from the top edge to the dark navigation box.
                        */}
{/* <div className="absolute top-0 -left-7.5 w-7.5 h-7.5 pointer-events-none">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 0V30C30 13.4315 16.5685 0 0 0H30Z" fill="#0b0c14" />
                            </svg>
                        </div>

                        <nav className="flex items-center gap-10 mr-4">
                            <Link href="/directory" className="text-sm font-semibold text-white/70 hover:text-white transition-colors tracking-wide">
                                Member Directory
                            </Link>
                        </nav>
                        <Link
                            href="/join"
                            className="bg-[#e2e8f0] text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-white transition-all transform hover:scale-105"
                        >
                            Join Us
                        </Link>

                        <div className="absolute top-31 right-0 w-7.5 h-7.5 pointer-events-none">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 0V30C30 13.4315 16.5685 0 0 0H30Z" fill="#0b0c14" />
                            </svg>
                        </div>
                    </div> */}