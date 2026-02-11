"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-25 floating-animation"
        style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 50%, #f97316 100%)', animationDelay: '0s' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 floating-animation"
        style={{ background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #ea580c 100%)', animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 left-[10%] w-48 h-48 rounded-full blur-3xl opacity-15 floating-animation hidden lg:block"
        style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)', animationDelay: '4s' }}
      />
      <div
        className="absolute top-[20%] right-[15%] w-56 h-56 rounded-full blur-3xl opacity-12 floating-animation hidden lg:block"
        style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #ea580c 100%)', animationDelay: '1s' }}
      />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-xl mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <FileText className="h-10 w-10 text-white" />
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="gradient-text">Resumes that get interviews.</span>
          <br />
          <span className="text-foreground">Powered by AI.</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          ATS-optimized, professional templates, one-click export. Build a resume that stands out to recruiters and passes applicant tracking systems.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Button asChild size="lg" className="gradient-primary text-white font-bold px-10 py-6 text-lg rounded-xl hover:shadow-xl transition-all duration-300 btn-hover-lift">
            <Link href="/builder">Start Building Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="glass-card border-2 border-orange-200/60 text-foreground font-semibold px-10 py-6 text-lg rounded-xl hover:bg-white/20">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-8 sm:gap-12 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground">10,000+</span>
            <span className="text-muted-foreground">Resumes created</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground">98%</span>
            <span className="text-muted-foreground">ATS pass rate</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-foreground">Free</span>
            <span className="text-muted-foreground">To start</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 right-8 lg:right-24 w-[180px] h-[240px] rounded-lg glass-card border border-white/40 shadow-2xl hidden lg:block floating-animation"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 0.9, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        style={{ animationDelay: '3s' }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="h-3 bg-orange-600/80 rounded w-2/3 mb-4" />
          <div className="h-2 bg-orange-400/60 rounded w-1/2 mb-6" />
          <div className="space-y-2 flex-1">
            <div className="h-1.5 bg-orange-200/70 rounded w-full" />
            <div className="h-1.5 bg-orange-200/60 rounded w-[92%]" />
            <div className="h-1.5 bg-orange-200/50 rounded w-full" />
            <div className="h-1.5 bg-orange-200/50 rounded w-4/5" />
            <div className="h-1.5 bg-orange-200/40 rounded w-full" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
