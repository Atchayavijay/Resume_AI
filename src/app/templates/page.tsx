'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATES, type Template } from '@/lib/templates';
import { useAuth } from '@/contexts/AuthContext';
import { loadAllGoogleFonts } from '@/lib/utils';

function TemplateThumbnail({ template }: { template: Template }) {
  const { design } = template;
  const isTwoCol = design.layout.columns === 'two' || design.layout.columns === 'mix';

  return (
    <div
      className="w-full aspect-[210/297] max-h-[280px] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col"
      style={{ fontFamily: design.typography.fontFamily }}
    >
      <div
        className="h-2 shrink-0"
        style={{ backgroundColor: design.colors.accent }}
      />
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="border-b pb-2" style={{ borderColor: `${design.colors.accent}40` }}>
          <div
            className="font-bold text-sm truncate"
            style={{ color: design.colors.text }}
          >
            John Doe
          </div>
          <div
            className="text-[10px] truncate"
            style={{ color: design.colors.accent }}
          >
            Software Engineer
          </div>
        </div>
        {isTwoCol ? (
          <div className="flex gap-2 flex-1 min-h-0">
            <div
              className="w-1/3 rounded"
              style={{ backgroundColor: `${design.colors.accent}15` }}
            />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded bg-slate-100 w-full" />
              <div className="h-1.5 rounded bg-slate-100 w-4/5" />
              <div className="h-1.5 rounded bg-slate-100 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-1 flex-1">
            <div className="h-1.5 rounded bg-slate-100 w-full" />
            <div className="h-1.5 rounded bg-slate-100 w-4/5" />
            <div className="h-1.5 rounded bg-slate-100 w-full" />
            <div className="h-1.5 rounded bg-slate-100 w-3/5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadAllGoogleFonts();
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/builder?template=${templateId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 bg-gradient-to-b from-background to-orange-50/30">
      <motion.div
        className="w-full max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 justify-center mb-8 hover:opacity-90"
        >
          <div className="gradient-primary p-2.5 rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold gradient-text text-xl">Resume AI Builder</span>
        </Link>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose a template</h1>
          <p className="text-muted-foreground">
            Select a design to start building your resume. You can switch templates later in the builder.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-card rounded-2xl border border-orange-200/30 shadow-xl overflow-hidden hover:shadow-2xl hover:border-orange-300/50 transition-all group"
            >
              <div className="p-4 bg-slate-50/50 border-b border-slate-200/50">
                <TemplateThumbnail template={template} />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-foreground mb-1">{template.name}</h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                <Button
                  onClick={() => handleSelectTemplate(template.id)}
                  className="w-full gradient-primary text-white font-semibold group-hover:opacity-95 transition-opacity"
                >
                  Use this template
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user?.email}</span>
        </p>
      </motion.div>
    </div>
  );
}
