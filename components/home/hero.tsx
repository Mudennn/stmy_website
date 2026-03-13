'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import Navbar from '../navbar';

interface HeroProps {
  ctaPrimary?: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
}

export function Hero({ ctaPrimary, ctaSecondary }: HeroProps) {
  const backgroundVideo = '/images/hero_video.mp4'
    return (
        <section className="relative h-187.5 md:h-screen w-full overflow-hidden text-white">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video
                    src={backgroundVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
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
                    <div className="hidden bg-hero py-10 px-17.5 w-95 h-31.25 rounded-bl-[30px] lg:flex items-center gap-10 shadow-2xl relative">
                        {/*
                          SVG Inverted Corner (Concave)
                          This creates the smooth transition from the top edge to the dark navigation box.
                        */}
                        <div className="absolute top-0 -left-7.5 w-7.5 h-7.5 pointer-events-none">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 0V30C30 13.4315 16.5685 0 0 0H30Z" fill="var(--hero)" />
                            </svg>
                        </div>
                        <div className='absolute'>
                            <Navbar />
                        </div>

                        <div className="absolute top-31 right-0 w-7.5 h-7.5 pointer-events-none">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M30 0V30C30 13.4315 16.5685 0 0 0H30Z" fill="var(--hero)" />
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
                        {(ctaPrimary || ctaSecondary) && (
                          <div className="flex flex-wrap gap-4">
                            {ctaPrimary && <Button variant="primary" size="hero" onClick={() => window.location.href = ctaPrimary.href}>{ctaPrimary.label}</Button>}
                            {ctaSecondary && <Button variant="tertiary" size="hero" onClick={() => window.location.href = ctaSecondary.href}>{ctaSecondary.label}</Button>}
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}