import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Member Directory', href: '#' },
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
    <div className="min-h-[200vh] bg-background text-white font-sans selection:bg-background selection:text-foreground">
      {/* Navbar Container */}
      <div className="fixed top-6 lg:top-8 right-4 lg:right-17.5 flex justify-center z-50 pointer-events-none">
        <motion.nav
          layout
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 35,
          }}
          className="pointer-events-auto bg-background backdrop-blur-md rounded-full flex items-center overflow-hidden h-14 px-1 shadow-2xl relative"
          style={{
            width: isScrolled ? 'fit' : 'fit',
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

            {/* Contact Button (Slides via layout) */}
            <motion.button
              layout="position"
              className="bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap z-10 flex items-center justify-center shrink-0"
              style={{
                width: '100px',
                minWidth: '100px',
                maxWidth: '100px',
                height: '40px',
                marginLeft: isScrolled ? '4px' : 'auto',
                marginRight: isScrolled ? 'auto' : '4px',
              }}
            >
              Contact
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
            className="fixed inset-4 bg-white z-100 flex flex-col px-2 py-6 lg:px-12 lg:py-12 text-background shadow-2xl overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex justify-end gap-2">
              <button className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold">
                Contact
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 bg-background text-white px-4 py-2 rounded-full"
              >
                <X size={18} />
                <span className="text-sm font-medium">Menu</span>
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 flex flex-col justify-center gap-0 lg:gap-6">
              {[...navLinks, { name: 'Contact', href: '#' }].map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-4xl lg:text-6xl font-medium hover:translate-x-4"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="flex items-end justify-between mt-auto">
              {/* Contact Info */}
              <div className="flex gap-12 text-lg font-medium">
                <a href="mailto:hello@sitetrip.be" className="border-b border-background/20 pb-1 hover:border-background transition-colors">
                  hello@sitetrip.be
                </a>
                <a href="tel:056171190" className="border-b border-background/20 pb-1 hover:border-background transition-colors">
                  056 17 11 90
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}