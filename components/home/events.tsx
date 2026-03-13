'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/button';

interface Event {
    id: string;
    title: string;
    event_date: string;
    location: string | null;
    image_url: string | null;
    luma_url: string | null;
}

interface EventsProps {
    upcomingEvents: Event[];
    pastEvents: Event[];
}

export function Events({ upcomingEvents, pastEvents }: EventsProps) {
    const [activeTab, setActiveTab] = useState<'PAST' | 'UPCOMING'>('UPCOMING');

    const filteredEvents = activeTab === 'UPCOMING' ? upcomingEvents : pastEvents;

    return (
        <section className="relative flex items-center overflow-hidden mt-24 lg:mt-36 mx-4 lg:mx-17.5">
            {/* Background with Blur */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/events.png"
                    alt="Superteam Malaysia Events"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[0px]" />
            </div>

            <div className="mx-auto relative z-10 w-full px-4 lg:px-17.5">
                <div className="flex flex-col lg:flex-row items-center justify-between py-22 gap-20">

                    {/* Left Side: Story */}
                    <div className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-primary text-sm uppercase tracking-widest block">
                {"/// 03 - EVENTS"}
                            </span>
                            <h2 className="text-4xl font-bold tracking-tighter text-primary leading-none mb-4 mt-16">
                                IRL & Online Events
                            </h2>
                            <p className="text-xl text-white leading-relaxed max-w-xl mb-8">
                                Connect with the local Solana community. From casual mamak meetups to
                                technical buildstations and hackathons, see where Malaysian builders are gathering next.
                            </p>

                            <Button variant="tertiary" size="hero" onClick={() => window.open('https://luma.com/mysuperteam/events', '_blank', 'noopener,noreferrer')}>
                                View All Events
                                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right Side: Event List */}
                    <div className="w-full min-h-125 max-h-125 overflow-y-auto">
                        {/* Tabs */}
                        <div className="flex gap-8 mb-6">
                            {['UPCOMING', 'PAST'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as 'PAST' | 'UPCOMING')}
                                    className={`text-base uppercase font-medium  tracking-widest transition-colors relative ${activeTab === tab ? 'text-primary font-bold' : 'text-white hover:text-primary'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Event Cards */}
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.map((event, i) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`group bg-hero border border-stroke rounded-2xl h-full overflow-hidden ${event.luma_url ? 'cursor-pointer' : ''}`}
                                        onClick={() => event.luma_url && window.open(event.luma_url, '_blank', 'noopener,noreferrer')}
                                    >
                                        <div className="w-full group py-6 px-4 flex flex-col md:flex-row gap-6 items-center justify-between h-full" style={{
                                            background:
                                                "linear-gradient(180deg, rgba(2, 8, 23, 1) 70%, rgba(104, 63, 234, 0.2) 100%)",
                                        }}>
                                        <div className="flex-1 space-y-2 max-w-xs">
                                            <h3 className="text-lg font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                                                {event.title}
                                            </h3>

                                            <p className="text-base font-medium text-muted-text">
                                                {new Date(event.event_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            {event.location && (
                                                <div className="flex items-center gap-2 text-muted-text text-base">
                                                    <MapPin size={24} />
                                                    {event.location}
                                                </div>
                                            )}

                                        </div>

                                        {event.image_url && (
                                            <div className="relative w-full md:w-32 aspect-square overflow-hidden">
                                                <Image
                                                    src={event.image_url}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
