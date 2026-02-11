"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  { quote: 'The AI optimization helped me land three interviews in a week. My resume finally passed ATS filters.', name: 'Sarah M.', role: 'Software Engineer' },
  { quote: 'Clean, professional export and the real-time ATS score gave me confidence before applying. Highly recommend.', name: 'James K.', role: 'Product Manager' },
  { quote: 'Imported from LinkedIn and had a polished resume in under 10 minutes. The templates are gorgeous.', name: 'Priya L.', role: 'Data Analyst' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-orange-50/20 to-transparent">
      <div className="container mx-auto max-w-6xl">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Loved by job seekers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Join thousands who landed interviews with ATS-optimized resumes.</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}>
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={item} className="glass-card rounded-2xl p-6 sm:p-8 border border-orange-200/30 card-hover-glow flex flex-col">
              <Quote className="h-10 w-10 text-orange-300/80 mb-4" />
              <p className="text-foreground leading-relaxed mb-6 flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
