"use client";

/**
 * Landing Page for Resume AI Builder
 * Warm, premium design with Hero, Features, How It Works, and more
 */

import React from 'react';
import {
  LandingHeader,
  Hero,
  TrustBar,
  StatsBanner,
  Features,
  Testimonials,
  HowItWorks,
  FAQ,
  CTABanner,
  Footer,
} from '@/features/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main id="main-content">
        <Hero />
        <TrustBar />
        <StatsBanner />
        <Features />
        <Testimonials />
        <HowItWorks />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
