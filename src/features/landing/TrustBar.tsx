"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileCheck, Download, Linkedin } from 'lucide-react';

const badges = [
  { icon: Sparkles, label: 'AI-Powered' },
  { icon: FileCheck, label: 'ATS-Optimized' },
  { icon: Download, label: 'PDF & DOCX Export' },
  { icon: Linkedin, label: 'LinkedIn Import' },
];

export default function TrustBar() {
  return (
    <section className="py-8 border-y border-orange-200/40 bg-white/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-wrap justify-center gap-8 sm:gap-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.label}
                className="flex items-center gap-3 text-muted-foreground transition-transform duration-300 btn-hover-lift cursor-default"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-2 rounded-lg bg-orange-100/80">
                  <Icon className="h-5 w-5 text-orange-600" />
                </div>
                <span className="font-medium text-foreground">{badge.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
