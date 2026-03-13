'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MemberCard } from './members-card';
import { MemberDialog } from './members-dialog';
import type { Database } from '@/types/database';

type Member = Database['public']['Tables']['members']['Row'];

interface MemberDirectoryProps {
  initialMembers: Member[];
}

export function MemberDirectory({ initialMembers }: MemberDirectoryProps) {
  const [search, setSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Derive unique skills from members
  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    initialMembers.forEach(member => {
      member.skill_tags?.forEach(tag => {
        skills.add(tag);
      });
    });
    return Array.from(skills).sort();
  }, [initialMembers]);

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((member) => {
      const matchesSearch = 
        member.full_name.toLowerCase().includes(search.toLowerCase()) ||
        member.role_title?.toLowerCase().includes(search.toLowerCase()) ||
        member.company?.toLowerCase().includes(search.toLowerCase());

      const matchesSkills = 
        selectedSkills.length === 0 || 
        selectedSkills.every(skill => 
          member.skill_tags?.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
        );

      return matchesSearch && matchesSkills;
    });
  }, [search, selectedSkills, initialMembers]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  return (
    <div className="space-y-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white tracking-tighter">
            Directory
          </h1>
          <p className="text-white/60 text-lg max-w-xl">
            Browse our community of talented builders and contributors.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
            <Input
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 pl-12 h-14 rounded-2xl text-white placeholder:text-white/20 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary" size={20} />
            <span className="text-white/60 font-medium text-sm uppercase tracking-widest">Filters</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {availableSkills.map((skill) => {
            const isActive = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                  ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-white/5'}
                `}
              >
                {skill}
              </button>
            );
          })}
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary/60 hover:text-primary transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Results Stats */}
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
          Showing {filteredMembers.length} members
        </p>
      </div>

      {/* Members Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {filteredMembers.map((member) => (
            <MemberCard 
                key={member.id} 
                member={member} 
                onClick={() => setSelectedMember(member)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center space-y-4"
        >
          <div className="text-white/20 flex justify-center">
            <Search size={64} />
          </div>
          <h3 className="text-2xl font-bold text-white">No members found</h3>
          <p className="text-white/40">Try adjusting your search or filters.</p>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => {
              setSearch('');
              setSelectedSkills([]);
            }}
          >
            Reset all filters
          </Button>
        </motion.div>
      )}

      {/* Member Details Dialog */}
      <MemberDialog 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
      />
    </div>
  );
}
