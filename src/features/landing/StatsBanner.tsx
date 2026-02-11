"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart3, Zap, Download } from 'lucide-react';

const stats = [
  { icon: FileText, value: '10,000+', label: 'Resumes Created' },
  { icon: BarChart3, value: '98%', label: 'ATS Score' },
  { icon: Zap, value: 'Free', label: 'To Start' },
  { icon: Download, value: 'PDF & DOCX', label: 'Export' },
];

export default function StatsBanner() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, staggerChildren: 0.1, delayChildren: 0.1 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="glass-card rounded-2xl p-6 sm:p-8 border border-orange-200/30 flex flex-col items-center text-center transition-all duration-300 hover:border-orange-300/50 card-hover-glow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="p-2.5 rounded-xl bg-orange-100/80 mb-3">
                  <Icon className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
