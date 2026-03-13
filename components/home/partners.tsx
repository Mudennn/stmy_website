'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

interface Partner {
    name: string;
    logo_url: string | null;
}

interface PartnersProps {
    partners: Partner[];
}

export function Partners({ partners }: PartnersProps) {
    return (
        <section className="pt-24 lg:pt-36 px-4 lg:px-17.5">
            <div className="container mx-auto px-4 lg:px-17.5 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-primary text-sm uppercase tracking-widest block mb-4">
                        {"/// 05 - PARTNERS"}
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter text-white">
                        Ecosystem
                    </h2>
                </motion.div>
            </div>

            {/* Partners Marquee with Borders */}
            <div className="border-t border-b border-stroke overflow-hidden py-6">
                <div className="relative mx-auto max-w-full overflow-hidden">
                    <motion.div
                        className="flex w-max"
                        initial={{ x: 0 }}
                        animate={{ x: '-50%' }}
                        transition={{
                            duration: 10,
                            ease: 'linear',
                            repeat: Infinity,
                        }}
                    >
                        {[0, 1].map((dup) => (
                            <div
                                key={dup}
                                className="flex flex-none items-center "
                            >
                                {partners.map((partner, i) => (
                                    <div
                                        key={`${dup}-${i}`}
                                        className="relative flex items-center justify-center"
                                    >
                                        {/* Partner Logo */}
                                        {partner.logo_url ? (
                                            <div className="flex items-center justify-center h-16 lg:h-32 w-auto px-8 lg:px-16 border-r border-stroke opacity-50 hover:opacity-100 transition-opacity">
                                                <Image
                                                    src={partner.logo_url}
                                                    alt={partner.name}
                                                    height={128}
                                                    width={200}
                                                    className="object-contain max-h-16 lg:max-h-32"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-white text-3xl lg:text-5xl font-bold tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity cursor-default px-8 lg:px-16 border-r border-stroke py-4 h-16 lg:h-32 flex items-center">
                                                {partner.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
