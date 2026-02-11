"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  { icon: UserPlus, title: 'Add your info', description: 'Fill in your experience, education, and skills. Or import from LinkedIn to save time.', step: 1 },
  { icon: Sparkles, title: 'AI optimizes', description: 'Enter your target job. AI tailors your resume with the right keywords and phrasing.', step: 2 },
  { icon: FileDown, title: 'Export and apply', description: 'Download PDF or DOCX. Print-ready and formatted for ATS and recruiters.', step: 3 },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent">
      <div className="container mx-auto max-w-6xl">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Three simple steps to a resume that gets noticed.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-0.5 border-t-2 border-dashed border-orange-200/60" aria-hidden />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.step} className="relative text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15, duration: 0.5 }}>
                <div className="glass-card rounded-2xl p-8 border border-orange-200/30 card-hover-glow h-full flex flex-col items-center">
                  <motion.div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-white font-bold text-xl mb-6 shadow-lg" initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.15 + 0.2, duration: 0.4 }}>{step.step}</motion.div>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-100 mb-4">
                    <Icon className="h-7 w-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div className="text-center mt-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Button asChild size="lg" className="gradient-primary text-white font-bold px-10 py-6 text-lg rounded-xl btn-hover-lift">
            <Link href="/builder">Create Your Resume</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
