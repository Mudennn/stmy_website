'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "What is Superteam Malaysia?",
        answer: "We are the official Malaysian community for the Solana ecosystem. We operate as a talent network and incubator, helping local developers, designers, and creators learn Web3 skills, launch projects, and earn global crypto income right from home."
    },
    {
        question: "How do I join?",
        answer: "You can join our community by joining our Discord and following us on Twitter. We host regular onboarding calls and IRL events where you can meet the team and other builders."
    },
    {
        question: "What opportunities are available?",
        answer: "We offer bounties, grants, and job opportunities within the Solana ecosystem. Whether you're a developer, designer, or content creator, there's always something to build or contribute to."
    },
    {
        question: "How can projects collaborate with us?",
        answer: "Projects can collaborate with us through ecosystem partnerships, co-hosted events, or by listing bounties on Superteam Earn to tap into Malaysian talent."
    },
    {
        question: "Do I need to be a developer to join?",
        answer: "Not at all! While we have many developers, we're also home to designers, community managers, writers, and researchers. Anyone passionate about Web3 and Solana is welcome."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="pt-24 lg:pt-36 px-4 lg:px-17.5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
                
                {/* Left Side: Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-primary text-sm uppercase tracking-widest block mb-16">
                        /// 07 - FAQ
                    </span>
                    <h2 className="text-4xl font-bold tracking-tighter text-white mb-4">
                        Got Questions?
                    </h2>
                    <p className="text-xl text-white/80 leading-relaxed max-w-md">
                        Everything you need to know about getting started, earning, 
                        and building with Superteam Malaysia.
                    </p>
                </motion.div>

                {/* Right Side: Accordion */}
                <div className="space-y-0">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-stroke last:border-0 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full py-8 flex items-center justify-between text-left group"
                            >
                                <span className={`text-xl lg:text-2xl font-bold transition-colors ${openIndex === i ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                    {faq.question}
                                </span>
                                <ChevronDown 
                                    className={`text-white/40 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-white' : ''}`}
                                    size={24}
                                />
                            </button>
                            <AnimatePresence initial={false}>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="pb-8 pr-12">
                                            <p className="text-lg text-white/60 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
