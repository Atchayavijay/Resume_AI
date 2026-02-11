"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  Download,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  ExternalLink,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Trophy,
  Users,
  FileCheck,
  Languages,
  Compass,
  Award,
  BookOpen,
  UserCheck,
  Send,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/lib/types';
import { cn, formatDate, loadGoogleFont, loadAllGoogleFonts, getGoogleFontUrl } from '@/lib/utils';
import { extractProfessionalSummary } from '@/lib/resume-parser';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_DESIGN } from '@/lib/defaults';
import { flattenResumeData, distributeBlocksByLayout, ResumeBlock } from '@/lib/resume-layout-utils';
import { useResumePagination } from '@/hooks/useResumePagination';
import { ResumePage } from '@/components/ResumePage';

interface ResumePreviewProps {
  data: ResumeData;
  selectedSections?: string[];
  generatedContent?: string;
  className?: string;
  onToggleSection?: (sectionId: string) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  selectedSections = [],
  generatedContent,
  className,
  onToggleSection
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.8); // Default zoom slightly smaller for visibility
  const previewRef = useRef<HTMLDivElement>(null);

  const design = data.design || DEFAULT_DESIGN;

  useEffect(() => {
    setIsClient(true);
    loadAllGoogleFonts();
  }, []);

  useEffect(() => {
    if (design?.typography?.fontFamily) {
      loadGoogleFont(design.typography.fontFamily);
    }
  }, [design?.typography?.fontFamily]);

  // --- Design Helpers ---
  const getDesignStyles = () => {
    const { spacing, colors, typography, personalDetails } = design;
    return {
      '--resume-font-size': `${spacing.fontSize}pt`,
      '--resume-line-height': spacing.lineHeight,
      '--resume-margin-lr': `${spacing.marginLR}mm`,
      '--resume-margin-tb': `${spacing.marginTB}mm`,
      '--resume-entry-spacing': `${spacing.entrySpacing}px`,
      '--resume-accent-color': colors.accent,
      '--resume-text-color': colors.text,
      '--resume-font-family': typography.fontFamily,
      '--resume-heading-size': typography.headings.size === 's' ? '0.9rem' : typography.headings.size === 'm' ? '1.1rem' : typography.headings.size === 'l' ? '1.3rem' : '1.5rem',
      '--resume-name-size': personalDetails.nameSize === 'xs' ? '1.5rem' : personalDetails.nameSize === 's' ? '2rem' : personalDetails.nameSize === 'm' ? '2.5rem' : personalDetails.nameSize === 'l' ? '3rem' : '3.5rem',
      '--resume-name-font-weight': personalDetails.nameBold ? '800' : '400',
    } as React.CSSProperties;
  };

  const pageDimensions = useMemo(() => {
    return design.languageRegion.pageFormat === 'A4'
      ? { width: 794, height: 1123, name: 'A4' } // 210mm x 297mm at 96 DPI
      : { width: 816, height: 1056, name: 'Letter' }; // 8.5in x 11in at 96 DPI
    // Note: We use pixels for internal calculation relative to 96dpi usually, 
    // but styling uses mm. ResizeObserver returns pixels.
  }, [design.languageRegion.pageFormat]);

  // --- PDF Generation Logic ---
  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    try {
      setIsDownloading(true);

      // 1. Get the HTML content
      const content = previewRef.current.innerHTML;

      // 2. Get the styles
      // We to capture Tailwind styles and any other global styles
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('');

      // 3. Serialize CSS variables from design
      const designStyles = getDesignStyles() as Record<string, string>;
      const cssVariables = Object.entries(designStyles)
        .map(([key, value]) => `${key}: ${value}`)
        .join(';');

      // 4. Construct full HTML
      // We wrap content in a div that provides the CSS variables
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            ${styles}
            <style>
              body { 
                background: white; 
                margin: 0;
                padding: 0;
              }
              @media print {
                 @page { margin: 0; }
                 body { margin: 0; -webkit-print-color-adjust: exact; }
              }
              .pdf-container {
                ${cssVariables}
              }
            </style>
          </head>
          <body>
            <div class="pdf-container">
              ${content}
            </div>
            <script>
                // Force all images to load if lazy loaded
                window.onload = function() {
                    const images = document.images;
                    for (let i = 0; i < images.length; i++) {
                         if (images[i].loading === 'lazy') images[i].loading = 'eager';
                    }
                }
            </script>
          </body>
        </html>
      `;

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          fileName: `Resume_${data.personalInfo.fullName?.replace(/\s+/g, '_') || 'Draft'}.pdf`,
          isPaginated: true
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resume_${data.personalInfo.fullName?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Flatten Data ---
  const blocks = useMemo(() => flattenResumeData(data, selectedSections), [data, selectedSections]);

  // --- Distribute blocks by layout (one-col vs two-col) ---
  const { main: mainBlocks, sidebar: sidebarBlocks } = useMemo(
    () => distributeBlocksByLayout(blocks, design.layout),
    [blocks, design.layout]
  );

  const isTwoColumn = design.layout.columns === 'two' || design.layout.columns === 'mix';

  // --- Render Block Helper ---
  const renderBlock = (block: ResumeBlock) => {
    const { sectionSettings } = design;

    // Helper for icons
    const renderSectionIcon = (icon: React.ReactNode) => {
      const { headings } = design.typography;
      const isFilled = headings.icons === 'filled';
      const isOutline = headings.icons === 'outline';

      if (headings.icons === 'none') return null;

      return (
        <span className={cn(
          "p-1 rounded flex items-center justify-center mr-2",
          isFilled ? "text-white" : "border",
        )} style={{
          backgroundColor: isFilled ? design.colors.accent : 'transparent',
          borderColor: isOutline ? design.colors.accent : 'transparent',
          color: isFilled ? 'white' : design.colors.accent,
          width: '1.5em', height: '1.5em'
        }}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: "w-3 h-3" })}
        </span>
      );
    };

    const SectionTitle = ({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) => (
      <h2 className={cn(
        "font-bold uppercase tracking-widest border-b pb-1 mb-3 transition-colors flex items-center group mt-2",
        design.typography.headings.capitalization === 'none' && "normal-case",
        design.typography.headings.capitalization === 'capitalize' && "capitalize",
        design.typography.headings.capitalization === 'uppercase' && "uppercase"
      )}
        style={{
          fontSize: 'var(--resume-heading-size)',
          color: design.colors.accent,
          borderColor: `${design.colors.accent}40`
        }}>
        {icon && renderSectionIcon(icon)}
        <span className="flex-1">{children}</span>
      </h2>
    );

    switch (block.type) {
      case 'header':
        return <PersonalInfoModule data={data} design={design} />;

      case 'section-title':
        let icon: React.ReactNode = null;
        switch (block.sectionId) {
          case 'summary': icon = <Sparkles />; break;
          case 'experience': icon = <Briefcase />; break;
          case 'education': icon = <GraduationCap />; break;
          case 'skills': icon = <Lightbulb />; break;
          case 'softSkills': icon = <Users />; break;
          case 'projects': icon = <Compass />; break;
          case 'certificates': icon = <FileCheck />; break;
          case 'languages': icon = <Languages />; break;
          case 'interests': icon = <Compass />; break;
          case 'awards': icon = <Award />; break;
          case 'organisations': icon = <Users />; break;
          case 'publications': icon = <BookOpen />; break;
          case 'references': icon = <UserCheck />; break;
          case 'declaration': icon = <Send />; break;
          case 'custom': icon = <Info />; break;
        }
        return <SectionTitle icon={icon}>{block.content}</SectionTitle>;

      case 'section-item':
        if (block.sectionId === 'summary') {
          return (
            <div
              className="text-justify relative pl-0 prose prose-slate max-w-none [&_p]:m-0"
              style={{
                fontSize: 'var(--resume-font-size)',
                lineHeight: 'var(--resume-line-height)',
                opacity: 0.9,
                marginBottom: 'var(--resume-entry-spacing)'
              }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        }
        if (block.sectionId === 'experience') {
          const exp = block.content;
          const { order } = sectionSettings.workExperience;
          return (
            <div className="resume-item mb-4" style={{ marginBottom: 'var(--resume-entry-spacing)' }}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex flex-col">
                  {order === 'title-employer' ? (
                    <>
                      <h3 className="font-bold tracking-tight" style={{ fontSize: 'var(--resume-font-size)' }}>{exp.position}</h3>
                      <div className="font-bold text-xs" style={{ color: design.colors.accent }}>{exp.company}</div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold tracking-tight" style={{ fontSize: 'var(--resume-font-size)', color: design.colors.accent }}>{exp.company}</h3>
                      <div className="font-bold text-xs">{exp.position}</div>
                    </>
                  )}
                </div>
                <span className="text-[10px] font-semibold opacity-60 italic whitespace-nowrap">
                  {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              {exp.description && (
                <div
                  className="mt-2 prose prose-slate max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                  style={{ fontSize: 'calc(var(--resume-font-size) - 1pt)' }}
                  dangerouslySetInnerHTML={{ __html: exp.description }}
                />
              )}
            </div>
          );
        }
        if (block.sectionId === 'education') {
          const edu = block.content;
          return (
            <div className="resume-item mb-3" style={{ marginBottom: 'var(--resume-entry-spacing)' }}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold" style={{ fontSize: 'var(--resume-font-size)' }}>{edu.institution}</h3>
                <span className="text-[10px] font-medium opacity-60 whitespace-nowrap">
                  {edu.startYear || ''} {edu.startYear && edu.endYear ? '–' : ''} {edu.endYear || ''}
                </span>
              </div>
              {(edu.degree || edu.field || edu.gpa) && (
                <div style={{ fontSize: 'calc(var(--resume-font-size) - 0.5pt)' }}>
                  {edu.degree && edu.field && (
                    <span className="italic font-medium opacity-80">{edu.degree} in {edu.field}</span>
                  )}
                  {edu.degree && !edu.field && (
                    <span className="italic font-medium opacity-80">{edu.degree}</span>
                  )}
                  {!edu.degree && edu.field && (
                    <span className="italic font-medium opacity-80">{edu.field}</span>
                  )}
                  {edu.gpa && <span className="ml-2 font-semibold opacity-60">GPA: {edu.gpa}</span>}
                </div>
              )}
            </div>
          );
        }
        if (block.sectionId === 'projects') {
          const project = block.content;
          return (
            <div className="resume-item mb-3" style={{ marginBottom: 'var(--resume-entry-spacing)' }}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold" style={{ fontSize: 'var(--resume-font-size)' }}>{project.title}</h3>
                  {project.link && <ExternalLink className="w-3 h-3 opacity-30" />}
                </div>
                {(project.startDate || project.endDate) && (
                  <span className="text-[10px] opacity-60">
                    {project.startDate ? formatDate(project.startDate) : ''} {project.startDate && project.endDate ? '–' : ''} {project.endDate ? formatDate(project.endDate) : ''}
                  </span>
                )}
              </div>
              {project.description && (
                <div
                  className="mb-2 prose prose-slate max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
                  style={{ fontSize: 'calc(var(--resume-font-size) - 1pt)' }}
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
            </div>
          );
        }
        if (block.sectionId === 'certificates') {
          const cert = block.content;
          return (
            <div className="resume-item break-inside-avoid flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <h3 className="font-bold" style={{ fontSize: 'var(--resume-font-size)' }}>{cert.name}</h3>
                <span className="text-xs opacity-60">{cert.organization}</span>
              </div>
              <span className="text-[10px] font-mono opacity-60">
                {formatDate(cert.issueDate)}
              </span>
            </div>
          );
        }
        if (block.sectionId === 'awards') {
          const award = block.content;
          return (
            <div className="resume-item break-inside-avoid flex justify-between items-baseline mb-2">
              <div className="flex flex-col">
                <span className="font-bold" style={{ fontSize: 'var(--resume-font-size)' }}>{award.title}</span>
                <span className="text-xs opacity-60">{award.organization}</span>
              </div>
              <span className="text-[10px] opacity-60">{formatDate(award.date)}</span>
            </div>
          );
        }
        if (block.sectionId === 'organisations') {
          const org = block.content;
          return (
            <div className="resume-item break-inside-avoid flex justify-between items-baseline mb-2">
              <div className="flex flex-col">
                <span className="font-bold" style={{ fontSize: 'var(--resume-font-size)' }}>{org.role}</span>
                <span className="text-xs opacity-60">{org.name}</span>
              </div>
              <span className="text-[10px] opacity-60 whitespace-nowrap">
                {formatDate(org.startDate)} – {org.endDate ? formatDate(org.endDate) : 'Present'}
              </span>
            </div>
          );
        }
        if (block.sectionId === 'publications') {
          const pub = block.content;
          return (
            <div className="resume-item break-inside-avoid shadow-sm border border-slate-50 p-2 rounded mb-2">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold italic" style={{ fontSize: 'var(--resume-font-size)' }}>"{pub.title}"</h3>
                <span className="text-[10px] opacity-60">{formatDate(pub.date)}</span>
              </div>
              <div className="text-xs opacity-80">{pub.publisher}</div>
            </div>
          );
        }

        // Fallback for simple list items or single items
        if (block.sectionId === 'custom') {
          return (
            <div
              className="text-justify prose prose-slate max-w-none"
              style={{ fontSize: 'var(--resume-font-size)' }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          )
        }

        return <div>{JSON.stringify(block.content)}</div>;

      case 'section-group':
        // Handle skills, languages, etc. which are passed as a group content
        if (block.sectionId === 'skills' || block.sectionId === 'softSkills') {
          const skills = block.content;
          const style = sectionSettings.skills; // Or softSkills logic

          if (style === 'grid') {
            return (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
                {skills.map((skill: any, i: number) => (
                  <div key={i} className="flex flex-col border-b border-slate-100 pb-1.5 group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">{skill.name}</span>
                      {skill.level && (
                        <span className="text-[10px] opacity-40 font-mono uppercase tracking-wider">{skill.level}</span>
                      )}
                    </div>
                    {skill.level && (
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--resume-accent-color)] opacity-60 rounded-full transition-all duration-500"
                          style={{ width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '80%' : skill.level === 'intermediate' ? '60%' : '40%' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          } else if (style === 'bubble') {
            return (
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map((skill: any, i: number) => (
                  <span key={i} className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-[var(--resume-accent-color)] text-[var(--resume-accent-color)] bg-[var(--resume-accent-color)]/[0.05]">
                    {skill.name}
                  </span>
                ))}
              </div>
            )
          }
          // Default compact
          return (
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
              {skills.map((skill: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--resume-accent-color)] opacity-40" />
                  <span className="text-[11px] font-medium leading-none">{skill.name}</span>
                </div>
              ))}
            </div>
          );
        }
        if (block.sectionId === 'languages') {
          const languages = block.content;
          return (
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
              {languages.map((lang: any) => (
                <div key={lang.id} className="flex items-center gap-2">
                  <span className="font-bold" style={{ fontSize: 'var(--resume-font-size)' }}>{lang.name}</span>
                  <span className="text-xs opacity-50 italic">{lang.level}</span>
                </div>
              ))}
            </div>
          )
        }
        if (block.sectionId === 'interests') {
          const interests = block.content;
          return (
            <div className="text-sm italic opacity-80 mb-4" style={{ fontSize: 'calc(var(--resume-font-size) - 0.5pt)' }}>
              {interests.map((i: any) => i.name).join(' • ')}
            </div>
          )
        }
        if (block.sectionId === 'references') {
          const items = block.content;
          return (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {items.map((ref: any) => (
                <div key={ref.id} className="resume-item opacity-80" style={{ fontSize: 'calc(var(--resume-font-size) - 1pt)' }}>
                  <div className="font-bold">{ref.name}</div>
                  <div className="italic">{ref.position}, {ref.company}</div>
                  <div>{ref.email} | {ref.phone}</div>
                </div>
              ))}
            </div>
          )
        }
        if (block.sectionId === 'declaration') {
          const dec = block.content;
          return (
            <div className="mb-6 mt-8">
              <div className="border-t pt-4 opacity-70">
                <div className="italic" style={{ fontSize: 'calc(var(--resume-font-size) - 1pt)' }}>
                  "{dec.statement}"
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-[10px]">{dec.place}, {dec.date}</div>
                  </div>
                  <div className="text-right">
                    {dec.signature && <div className="font-mono text-lg">{dec.signature}</div>}
                    <div className="text-[8px] border-t border-slate-300 pt-0.5 w-24 ml-auto text-center">Signature</div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        return null;

      default:
        return null;
    }
  };

  // --- Measurement & Pagination Props ---
  // Convert mm margins to pixels for pagination logic 
  // (approx 1mm = 3.78px at 96dpi, but we can rely on relative CSS)
  // Actually, ResizeObserver measures in pixels. 
  // we just need the pagination hook to measure elements.
  const { pages, measuring, containerRef } = useResumePagination(blocks, renderBlock, {
    width: pageDimensions.width,
    height: pageDimensions.height,
    marginTop: design.spacing.marginTB * 3.78, // approx conversion for safety calculation
    marginBottom: design.spacing.marginTB * 3.78
  });


  // --- Render ---
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Toolbar */}
      <div className="w-full max-w-2xl mb-4 flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={handleDownloadPDF} disabled={isDownloading || measuring} size="sm" className="gap-2">
          {isDownloading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download PDF
        </Button>
      </div>

      {/* Main Preview Area */}
      <div
        ref={previewRef}
        className="relative transition-all duration-300 ease-in-out print:p-0 print:m-0"
        style={{
          ...getDesignStyles(),
          // We scale the container or the pages. Scaling wrapper is better for visual centering.
          // But margins are easier if we scale pages.
        }}
      >
        {!isClient || measuring ? (
          <div className="flex flex-col items-center justify-center h-[297mm] w-[210mm] bg-white shadow-sm border animate-pulse">
            <p className="mb-4 text-sm text-slate-400">Formatting Resume...</p>
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : isTwoColumn ? (
          (() => {
            const sidebarFirst = design.layout.headerPosition === 'left';
            const leftCol = sidebarFirst ? sidebarBlocks : mainBlocks;
            const rightCol = sidebarFirst ? mainBlocks : sidebarBlocks;
            const leftPct = design.layout.columnWidths.left;
            const rightPct = design.layout.columnWidths.right;
            return (
              <ResumePage
                pageNumber={1}
                totalNumbers={1}
                scale={zoomLevel}
                width={design.languageRegion.pageFormat === 'A4' ? '210mm' : '215.9mm'}
                height={design.languageRegion.pageFormat === 'A4' ? '297mm' : '279.4mm'}
                style={{
                  padding: `var(--resume-margin-tb) var(--resume-margin-lr)`
                }}
              >
                <div
                  className="grid w-full gap-x-6"
                  style={{
                    gridTemplateColumns: `${leftPct}% ${rightPct}%`
                  }}
                >
                  <div className="flex flex-col gap-4 min-w-0">
                    {leftCol.map(block => (
                      <div key={block.id} data-id={block.id}>
                        {renderBlock(block)}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-4 min-w-0">
                    {rightCol.map(block => (
                      <div key={block.id} data-id={block.id}>
                        {renderBlock(block)}
                      </div>
                    ))}
                  </div>
                </div>
              </ResumePage>
            );
          })()
        ) : (
          <>
            {pages.map((pageBlocks, index) => (
              <ResumePage
                key={index}
                pageNumber={index + 1}
                totalNumbers={pages.length}
                scale={zoomLevel}
                width={design.languageRegion.pageFormat === 'A4' ? '210mm' : '215.9mm'}
                height={design.languageRegion.pageFormat === 'A4' ? '297mm' : '279.4mm'}
                style={{
                  padding: `var(--resume-margin-tb) var(--resume-margin-lr)`
                }}
              >
                {pageBlocks.map(block => (
                  <div key={block.id} data-id={block.id}>
                    {renderBlock(block)}
                  </div>
                ))}
              </ResumePage>
            ))}
          </>
        )}
      </div>

      {/* Hidden Measurement Container */}
      <div
        ref={containerRef}
        className="absolute top-0 left-0 invisible pointer-events-none"
        style={{
          width: design.languageRegion.pageFormat === 'A4' ? '210mm' : '215.9mm',
          padding: `0 var(--resume-margin-lr)`, // Only horizontal padding matters for width constrain
          ...getDesignStyles()
        }}
      >
        {blocks.map(block => (
          <div key={block.id} data-id={block.id} className="w-full">
            {renderBlock(block)}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Personal Info Component (Reusable) ---
const PersonalInfoModule = ({ data, design }: { data: ResumeData, design: any }) => { // Keeping design:any for now to avoid strict type refactor of design object if needed, but fixing the other any
  const { personalInfo, jobTitle } = data;
  const { personalDetails } = design;
  if (!personalInfo.fullName) return null;

  const iconStyle = personalDetails.iconStyle;

  const renderIcon = (IconComponent: React.ElementType) => {
    if (!iconStyle || iconStyle === 'none') return null;
    const safeIconStyle = String(iconStyle || 'none');
    const isFilled = safeIconStyle.includes('filled');
    const isCircle = safeIconStyle.includes('circle');
    const isRounded = safeIconStyle.includes('rounded');
    const isOutline = safeIconStyle.includes('outline');

    return (
      <div className={cn(
        "flex items-center justify-center transition-all",
        isFilled ? "text-white" : "",
        isOutline ? "border" : "",
        isCircle ? "rounded-full" : isRounded ? "rounded-md" : "rounded-none"
      )} style={{
        backgroundColor: isFilled ? design.colors.accent : 'transparent',
        borderColor: isOutline ? design.colors.accent : 'transparent',
        color: isFilled ? 'white' : design.colors.accent,
        padding: '2px'
      }}>
        <IconComponent className="w-3 h-3" />
      </div>
    );
  };

  return (
    <header className={cn(
      "mb-6 pb-2",
      personalDetails.align === 'center' && "text-center",
      personalDetails.align === 'right' && "text-right"
    )}>
      <h1 className="tracking-tight mb-2" style={{
        fontSize: 'var(--resume-name-size)',
        fontWeight: 'var(--resume-name-font-weight)',
        color: 'var(--resume-text-color)'
      }}>
        {personalInfo.fullName}
      </h1>
      {jobTitle && jobTitle.trim() && (
        <div className={cn(
          "text-xl font-semibold mb-3 tracking-wide flex items-center gap-2",
          personalDetails.align === 'center' && "justify-center",
          personalDetails.align === 'right' && "justify-end"
        )} style={{ color: design.colors.accent }}>
          <span>{jobTitle.trim()}</span>
          <div className="h-px grow max-w-[100px] bg-current opacity-20" />
        </div>
      )}

      <div className={cn(
        "flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium mt-1",
        personalDetails.align === 'center' && "justify-center",
        personalDetails.align === 'right' && "justify-end"
      )} style={{ color: 'var(--resume-text-color)', opacity: design.advanced.dateLocationOpacity }}>
        {[
          { value: personalInfo.email, icon: Mail },
          { value: personalInfo.phone, icon: Phone },
          { value: personalInfo.location, icon: MapPin },
          { value: personalInfo.linkedIn, icon: Linkedin, isLink: true, label: 'LinkedIn' },
          { value: personalInfo.website, icon: Globe, isLink: true, label: 'Portfolio' }
        ].map((item, i) => item.value && (
          <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            {renderIcon(item.icon)}
            {item.isLink ? (
              <a href={item.value} target="_blank" rel="noreferrer" className="underline underline-offset-2 decoration-slate-300">{item.label}</a>
            ) : (
              <span>{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </header>
  );
};

export default ResumePreview;
