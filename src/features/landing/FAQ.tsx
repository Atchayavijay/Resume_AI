"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { question: 'Is it really free?', answer: 'Yes. You can create, edit, and export your resume at no cost. We offer a free tier to help job seekers land their next role.' },
  { question: 'How does ATS optimization work?', answer: 'Our AI analyzes job descriptions and your resume to match keywords, suggest improvements, and score compatibility. You get real-time feedback so your resume passes applicant tracking systems.' },
  { question: 'Can I import from LinkedIn?', answer: 'Yes. You can paste your LinkedIn profile URL or export data to quickly populate your resume. We parse your experience, education, and skills automatically.' },
  { question: 'What export formats are available?', answer: 'We support PDF and DOCX. Both are print-ready and formatted for ATS compatibility. PDF is best for online applications; DOCX is ideal if you need to edit further in Word.' },
  { question: 'Is my data secure?', answer: 'Your resume data is stored securely. We do not share your information with third parties. You can also use local storage only if you prefer not to sync to the cloud.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          <p className="text-muted-foreground text-lg">Quick answers to common questions.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div key={faq.question} className="glass-card rounded-xl border border-orange-200/30 overflow-hidden" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/10 transition-colors" aria-expanded={isOpen}>
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <p className="px-6 pb-4 text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
