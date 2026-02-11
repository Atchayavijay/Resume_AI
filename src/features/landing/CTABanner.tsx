"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTABanner() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <motion.div className="relative rounded-3xl overflow-hidden gradient-primary p-12 sm:p-16 lg:p-20 text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Ready to land your next interview?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">Build an ATS-optimized resume in minutes. Free to start, no sign-up required.</p>
          <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-white/95 font-bold px-10 py-6 text-lg rounded-xl btn-hover-lift shadow-xl">
            <Link href="/builder">Start Building Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
