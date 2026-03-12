'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, Twitter, Building2, User2, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/database';

type Member = Database['public']['Tables']['members']['Row'];

interface MemberDialogProps {
  member: Member | null;
  onClose: () => void;
}

export function MemberDialog({ member, onClose }: MemberDialogProps) {
  if (!member) return null;

  return (
    <AnimatePresence>
      {member && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background backdrop-blur-xl"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-[#050510] border border-stroke rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-white/5 hover:bg-stroke rounded-full text-muted-text hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Left Column: Image & Basic Info */}
            <div className="w-full lg:w-2/5 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-stroke flex flex-col">
              <div className="relative aspect-square w-full mb-8">
               {member.avatar_url ? (
                  <div
                    className="relative w-full h-full bg-secondary overflow-hidden"
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
                    }}
                  >
                    <Image
                      src={member.avatar_url}
                      alt={member.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full bg-secondary flex items-center justify-center text-6xl font-bold text-white/20"
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
                    }}
                  >
                    {member.full_name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white">{member.full_name}</h2>
                <div className="space-y-2">
                  {member.role_title && (
                    <div className="flex items-center gap-2 text-muted-text">
                      <User2 size={16} className="text-primary" />
                      <span className="text-sm font-medium">{member.role_title}</span>
                    </div>
                  )}
                  {member.company && (
                    <div className="flex items-center gap-2 text-muted-text">
                      <Building2 size={16} className="text-primary" />
                      <span className="text-sm font-medium">{member.company}</span>
                    </div>
                  )}
                </div>

                {member.twitter_url && (
                  <a
                    href={member.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/5 hover:bg-stroke p-3 rounded-xl transition-colors group w-fit"
                  >
                    <Twitter size={18} className="text-[#1DA1F2] group-hover:scale-110 transition-transform" fill="currentColor" />
                    <span className="text-sm font-medium text-white/80 group-hover:text-white">Follow on X</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[60vh] lg:max-h-[80vh] custom-scrollbar">
              <div className="space-y-10">
                {/* Bio Section */}
                {member.bio && (
                  <section>
                    <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">Biography</h3>
                    <p className="text-muted-text leading-relaxed text-lg italic">
                      "{member.bio}"
                    </p>
                  </section>
                )}

                {/* Skills Section */}
                <section>
                  <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skill_tags?.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-white/5 text-white/90 border-stroke px-4 py-1.5 rounded-lg text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* Achievements placeholder or parsed from JSON */}
                {member.achievements && (
                  <section>
                    <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                      <Trophy size={16} /> Achievements
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Assuming achievements is an array of strings for now based on common usage, or handling JSON */}
                      {Array.isArray(member.achievements) ? (
                        member.achievements.map((item, i) => (
                          <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 text-muted-text text-sm">
                            {typeof item === 'string' ? item : JSON.stringify(item)}
                          </div>
                        ))
                      ) : (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-muted-text text-sm italic">
                          Multiple ecosystem contributions and hackathon participations.
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
