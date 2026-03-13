'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Twitter, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/database';

type Member = Database['public']['Tables']['members']['Row'];

interface MemberCardProps {
  member: Member;
  onClick: () => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-hero border border-stroke p-6 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Beveled Avatar Container */}
      <div className="relative aspect-square w-full mb-6 overflow-hidden">
        {member.avatar_url ? (
          <div
            className="relative w-full h-full bg-secondary overflow-hidden group-hover:scale-110 transition-transform duration-500 ease-out"
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
        ) : (
          <div
            className="w-full h-full bg-secondary flex items-center justify-center text-4xl font-bold text-white/20"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
            }}
          >
            {member.full_name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
            {member.full_name}
          </h3>
          <ArrowUpRight size={18} className="text-white/30 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
        
        {member.role_title && (
          <p className="text-white/60 text-sm font-medium mb-1">
            {member.role_title}
          </p>
        )}
        
        {member.company && (
          <p className="text-white/40 text-xs mb-4">
            {member.company}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {member.skill_tags?.slice(0, 3).map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="bg-white/5 text-white/60 border-none text-[10px] px-2 py-0"
            >
              {tag}
            </Badge>
          ))}
          {(member.skill_tags?.length ?? 0) > 3 && (
            <Badge 
              variant="secondary" 
              className="bg-white/5 text-white/60 border-none text-[10px] px-2 py-0"
            >
              +{(member.skill_tags?.length ?? 0) - 3}
            </Badge>
          )}
        </div>
      </div>

      {member.twitter_url && (
        <a
          href={member.twitter_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-6 right-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Twitter size={14} fill="currentColor" />
        </a>
      )}
    </motion.div>
  );
}
