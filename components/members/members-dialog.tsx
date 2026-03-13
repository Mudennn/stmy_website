'use client';

import Image from 'next/image';
import { Building2, User2, Trophy, Twitter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import type { Database } from '@/types/database';
import { Button } from '../ui/button';

type Member = Database['public']['Tables']['members']['Row'];

interface MemberDialogProps {
  member: Member | null;
  onClose: () => void;
}

export function MemberDialog({ member, onClose }: MemberDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={!!member} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! max-h-[90vh] bg-hero p-0 gap-0 w-full border border-stroke" showCloseButton={false}>
        <DialogClose className="absolute top-4 right-4 z-50 text-white border-0 cursor-pointer">
          <X size={20} className="text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="sr-only">
          <DialogTitle>{member.full_name}</DialogTitle>
          <DialogDescription>Member profile information</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row no-scrollbar max-h-[80vh] overflow-y-auto flex-1">

          {/* Left Column: Image & Basic Info */}
          <div className="w-full lg:w-2/5 p-4 lg:p-12 border-b lg:border-b-0 lg:border-r border-stroke bg-hero flex flex-col shrink-0 overflow-y-auto">
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
                <Button variant="tertiary" size="hero" onClick={() => window.open(member.twitter_url!, '_blank')}>
                  <Twitter size={16} />
                Follow on X
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 overflow-visible lg:overflow-hidden bg-hero">
            <div className=" overflow-y-auto max-h-full p-4 lg:p-12">
              <div className="space-y-10 ">
                {/* Bio Section */}
                {member.bio && (
                  <section>
                    <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">Biography</h3>
                    <p className="text-muted-text leading-relaxed text-lg italic">
                      &quot;{member.bio}&quot;
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
                        className="bg-white/5 text-white p-4 text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* Achievements */}
                {member.achievements && Array.isArray(member.achievements) && member.achievements.length > 0 && (
                  <section>
                    <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                      <Trophy size={16} /> Achievements
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {member.achievements.map((achievement, i) => {
                        const item = achievement as Record<string, unknown>;
                        const title = item?.title ? String(item.title) : null;
                        const year = item?.year ? Number(item.year) : null;

                        return (
                          <div key={i} className="bg-white/5 p-4">
                            {title && (
                              <>
                                <p className="text-white font-medium">{title}</p>
                                {year && <p className="text-muted-text text-xs mt-1">{year}</p>}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

//  <Dialog open={!!member} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] bg-[#050510] border-stroke p-0 gap-0 overflow-hidden flex flex-col">
//         <DialogHeader className="sr-only">
//           <DialogTitle>{member.full_name}</DialogTitle>
//           <DialogDescription>Member profile information</DialogDescription>
//         </DialogHeader>

//         <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
//           {/* Left Column: Image & Basic Info */}
//           <div className="w-full lg:w-2/5 p-4 lg:p-12 border-b lg:border-b-0 lg:border-r border-stroke flex flex-col shrink-0 overflow-y-auto">
//             <div className="relative aspect-square w-full mb-8">
//               {member.avatar_url ? (
//                 <div
//                   className="relative w-full h-full bg-secondary overflow-hidden"
//                   style={{
//                     clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
//                   }}
//                 >
//                   <Image
//                     src={member.avatar_url}
//                     alt={member.full_name}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>
//               ) : (
//                 <div
//                   className="w-full h-full bg-secondary flex items-center justify-center text-6xl font-bold text-white/20"
//                   style={{
//                     clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
//                   }}
//                 >
//                   {member.full_name.charAt(0)}
//                 </div>
//               )}
//             </div>

//             <div className="space-y-4">
//               <h2 className="text-3xl font-bold text-white">{member.full_name}</h2>
//               <div className="space-y-2">
//                 {member.role_title && (
//                   <div className="flex items-center gap-2 text-muted-text">
//                     <User2 size={16} className="text-primary" />
//                     <span className="text-sm font-medium">{member.role_title}</span>
//                   </div>
//                 )}
//                 {member.company && (
//                   <div className="flex items-center gap-2 text-muted-text">
//                     <Building2 size={16} className="text-primary" />
//                     <span className="text-sm font-medium">{member.company}</span>
//                   </div>
//                 )}
//               </div>

//               {member.twitter_url && (
//                 <a
//                   href={member.twitter_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center gap-2 bg-white/5 hover:bg-stroke p-3 rounded-xl transition-colors group w-fit"
//                 >
//                   <svg className="w-4 h-4 text-[#1DA1F2] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
//                   </svg>
//                   <span className="text-sm font-medium text-white/80 group-hover:text-white">Follow on X</span>
//                 </a>
//               )}
//             </div>
//           </div>

//           {/* Right Column: Details */}
//           <div className="flex-1 overflow-hidden">
//             <div className="-mx-4 overflow-y-auto max-h-full px-4">
//               <div className="space-y-10 py-4">
//                 {/* Bio Section */}
//                 {member.bio && (
//                   <section>
//                     <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">Biography</h3>
//                     <p className="text-muted-text leading-relaxed text-lg italic">
//                       &quot;{member.bio}&quot;
//                     </p>
//                   </section>
//                 )}

//                 {/* Skills Section */}
//                 <section>
//                   <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">Expertise</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {member.skill_tags?.map((tag) => (
//                       <Badge
//                         key={tag}
//                         variant="secondary"
//                         className="bg-white/5 text-white/90 border-stroke px-4 py-1.5 rounded-lg text-sm"
//                       >
//                         {tag}
//                       </Badge>
//                     ))}
//                   </div>
//                 </section>

//                 {/* Achievements */}
//                 {member.achievements && (
//                   <section>
//                     <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
//                       <Trophy size={16} /> Achievements
//                     </h3>
//                     <div className="grid grid-cols-1 gap-4">
//                       {(() => {
//                         const achievements = Array.isArray(member.achievements)
//                           ? member.achievements
//                           : [member.achievements];

//                         return achievements.map((item, i) => {
//                           const achievement = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : null;
//                           const title = achievement?.title ? String(achievement.title) : (typeof item === 'string' ? item : null);
//                           const year = achievement?.year ? Number(achievement.year) : null;

//                           return (
//                             <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
//                               {title && (
//                                 <>
//                                   <p className="text-white font-medium">{title}</p>
//                                   {year && <p className="text-muted-text text-xs mt-1">{year}</p>}
//                                 </>
//                               )}
//                             </div>
//                           );
//                         });
//                       })()}
//                     </div>
//                   </section>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>

