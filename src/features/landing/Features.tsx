"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Download, Palette, Linkedin } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI Generation', description: 'Target a job and let AI optimize your content. Professional summaries, bullet points, and keyword alignment in seconds.' },
  { icon: BarChart3, title: 'ATS Analysis', description: 'Real-time compatibility scoring. See matched and missing keywords, and get actionable recommendations to improve.' },
  { icon: Download, title: 'Professional Export', description: 'Export to PDF and DOCX. Print-ready, professional formatting for job applications and online submissions.' },
  { icon: Palette, title: 'Custom Design', description: 'Multiple templates, fonts, and layout options. Tailor the look to match your industry and personality.' },
  { icon: Linkedin, title: 'LinkedIn Import', description: 'Paste your LinkedIn URL or export data to populate your resume instantly. Save time and focus on optimization.' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for job seekers who want to stand out. From AI optimization to one-click export.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className="glass-card rounded-2xl p-6 sm:p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 card-hover-glow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl gradient-primary flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
