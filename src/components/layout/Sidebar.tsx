"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, BookOpen, Clock, Link as LinkIcon, Settings, ChevronLeft, ChevronRight, BookMarked } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGlobalStore } from '@/lib/store/GlobalStore';
import { InlineEditor } from '@/components/shared/InlineEditor';

const navItems = [
  { icon: User, label: 'You', href: '/' },
  { icon: Calendar, label: 'Plans', href: '/plans' },
  { icon: BookOpen, label: 'Study', href: '/study' },
  { icon: BookMarked, label: 'Documents', href: '/read' },
  { icon: LinkIcon, label: "Don't Break Chain", href: '/chain' },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { profile, updateProfile } = useGlobalStore();

  return (
    <motion.aside
      className="flex flex-col h-full bg-sidebar border-r border-sidebar-border relative z-10 shrink-0 py-6"
      initial={false}
      animate={{ width: isExpanded ? 260 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="px-6 mb-8 h-10 flex items-center">
        <motion.div 
          className="flex items-center w-full"
          animate={{ justifyContent: isExpanded ? 'space-between' : 'center' }}
        >
          {isExpanded && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold tracking-tight text-sidebar-foreground flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <span className="truncate">
                <InlineEditor 
                  value={profile.appName || 'Osfer'} 
                  onSave={(val) => updateProfile({ appName: val })} 
                  className="hover:text-primary transition-colors cursor-text"
                />
              </span>
            </motion.span>
          )}
          <button 
            className="flex items-center justify-center w-8 h-8 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </motion.div>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 px-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.button 
                whileHover="hover"
                className={`flex items-center gap-3 w-full p-3 rounded-xl relative transition-all ${isActive ? 'text-primary font-semibold bg-primary/8' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'} ${!isExpanded && 'justify-center'}`}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    variants={{
                      hover: { scale: 1.1, color: 'var(--primary)' }
                    }}
                    className={`text-[14px] whitespace-nowrap origin-left transition-colors cursor-default`}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-[20%] h-[60%] w-[3.5px] bg-primary rounded-r-full z-20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]" />
                )}
              </motion.button>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-auto flex flex-col gap-1.5 border-t border-sidebar-border pt-4 text-sidebar-foreground">
        <Link href="/time">
          <motion.button 
            whileHover="hover"
            className={`flex items-center gap-3 w-full p-3 rounded-xl relative transition-all ${pathname === '/time' ? 'text-primary font-semibold bg-primary/8' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'} ${!isExpanded && 'justify-center'}`}
            title={!isExpanded ? "Timer" : undefined}
          >
            <Clock size={20} strokeWidth={pathname === '/time' ? 2.2 : 1.8} />
            {isExpanded && (
              <motion.span 
                variants={{
                  hover: { scale: 1.1, color: 'var(--primary)' }
                }}
                className={`text-[14px] whitespace-nowrap origin-left transition-colors cursor-default`}
              >
                Timer
              </motion.span>
            )}
            {pathname === '/time' && (
              <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} className="absolute left-0 top-[20%] h-[60%] w-[3.5px] bg-primary rounded-r-full z-20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] origin-center" />
            )}
          </motion.button>
        </Link>
        <Link href="/settings">
          <motion.button 
            whileHover="hover"
            className={`flex items-center gap-3 w-full p-3 rounded-xl relative transition-all ${pathname === '/settings' ? 'text-primary font-semibold bg-primary/8' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'} ${!isExpanded && 'justify-center'}`} 
            title={!isExpanded ? "Settings" : undefined}
          >
            <Settings size={20} strokeWidth={pathname === '/settings' ? 2.2 : 1.8} />
            {isExpanded && (
              <motion.span 
                variants={{
                  hover: { scale: 1.1, color: 'var(--primary)' }
                }}
                className="text-[14px] origin-left transition-colors cursor-default"
              >
                Settings
              </motion.span>
            )}
            {pathname === '/settings' && (
              <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} className="absolute left-0 top-[20%] h-[60%] w-[3.5px] bg-primary rounded-r-full z-20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)] origin-center" />
            )}
          </motion.button>
        </Link>
      </div>
    </motion.aside>
  );
}
