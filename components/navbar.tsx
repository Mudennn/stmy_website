"use client"

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Member Directory", href: "/members" },
];

const menuLinks = [
  { name: "Member Directory", href: "/members" },
  { name: "Earn", href: "https://superteam.fun/earn/s/superteammalaysia" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <>
      {/* Navbar Container */}
      <div className="fixed top-6 lg:top-8 right-4 lg:right-17.5 flex justify-center z-50 pointer-events-none">
        <motion.nav
          layout
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
          className="pointer-events-auto bg-hero backdrop-blur-md rounded-full flex items-center overflow-hidden h-14 px-1 shadow-2xl relative"
          style={{
            width: isScrolled ? "fit" : "fit",
          }}
        >
          <div className="flex items-center w-full h-full relative px-1">
            {/* Links (Slide from/to LEFT) */}
            <AnimatePresence mode="popLayout">
              {!isScrolled && (
                <motion.div
                  key="links"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                  className="flex gap-6 px-4 whitespace-nowrap"
                >
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Join Us Button (Slides via layout) */}
            <motion.button
              layout="position"
              className="bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap z-10 flex items-center justify-center shrink-0"
              style={{
                width: "100px",
                minWidth: "100px",
                maxWidth: "100px",
                height: "40px",
                marginLeft: isScrolled ? "4px" : "auto",
                marginRight: isScrolled ? "auto" : "4px",
              }}
              onClick={() => window.open("https://t.me/SuperteamMY#", "_blank", "noopener,noreferrer")}
            >
              Join Us
            </motion.button>

            {/* Menu Button (Slide from/to RIGHT) */}
            <AnimatePresence mode="popLayout">
              {isScrolled && (
                <motion.button
                  key="menu-trigger"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full transition-colors ml-2"
                >
                  <Menu size={18} className="text-primary" />
                  <span className="text-sm font-medium">Menu</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      </div>

      {/* OPEN MENU OVERLAY (Image 3) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 bg-white z-100 flex flex-col px-2 py-6 lg:px-12 lg:py-12 text-hero shadow-2xl overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  window.open("https://t.me/SuperteamMY#", "_blank", "noopener,noreferrer")
                }
                className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold"
              >
                Join Us
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 bg-hero text-white px-4 py-2 rounded-full"
              >
                <X size={18} />
                <span className="text-sm font-medium">Menu</span>
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 flex flex-col justify-center gap-0 lg:gap-6">
              {menuLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ x: 16 }}
                  className="text-4xl lg:text-6xl font-medium"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="flex items-end justify-between mt-auto">
              {/* Contact Info */}
              <div className="flex gap-12 text-lg font-medium">
                <a
                  href="https://t.me/SuperteamMY"
                  target="_blank"
                  className="border-b border-hero/20 pb-1 hover:border-hero transition-colors"
                >
                  TELEGRAM
                </a>
                <a
                  href="https://x.com/SuperteamMY"
                  target="_blank"
                  className="border-b border-hero/20 pb-1 hover:border-hero transition-colors"
                >
                  TWITTER
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
