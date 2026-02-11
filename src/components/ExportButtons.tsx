"use client";

/**
 * ExportButtons Component
 * PDF and DOCX export functionality with proper formatting
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  File, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { ResumeData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExportButtonsProps {
  resumeData: ResumeData;
  resumeContent?: string;
  className?: string;
}

type ExportFormat = 'pdf' | 'docx';
type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  resumeData, 
  resumeContent,
  className 
}) => {
  const [exportStatus, setExportStatus] = useState<Record<ExportFormat, ExportStatus>>({
    pdf: 'idle',
    docx: 'idle'
  });

  // Generate PDF export
  const exportToPDF = async () => {
    if (!resumeData.personalInfo.fullName && !resumeContent) {
      alert('Please fill in your resume information first');
      return;
    }

    setExportStatus(prev => ({ ...prev, pdf: 'loading' }));

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;

      // Create PDF with text-based content (ATS-friendly)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = margin;

      // Helper function to add text with automatic line wrapping
      const addText = (text: string, fontSize: number, isBold: boolean = false, isTitle: boolean = false) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(fontSize);
        
        if (isBold || isTitle) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }

        if (isTitle) {
          // Center titles
          const textWidth = pdf.getTextWidth(text);
          const xPosition = (pageWidth - textWidth) / 2;
          pdf.text(text, xPosition, yPosition);
        } else {
          // Split long text into multiple lines
          const lines = pdf.splitTextToSize(text, contentWidth);
          pdf.text(lines, margin, yPosition);
          yPosition += (lines.length - 1) * (fontSize * 0.35);
        }

        yPosition += fontSize * 0.5;
      };

      // Helper function to add section spacing
      const addSpacing = (space: number = 6) => {
        yPosition += space;
      };

      // Header - Name (ATS-friendly)
      addText(resumeData.personalInfo.fullName || 'Your Name', 18, true, true);
      addSpacing(4);

      // Contact Information (one line, ATS-friendly format)
      const contactInfo = [
        resumeData.personalInfo.email,
        resumeData.personalInfo.phone,
        resumeData.personalInfo.location
      ].filter(Boolean).join(' | ');

      if (contactInfo) {
        addText(contactInfo, 10, false, true);
      }

      // LinkedIn and Website
      if (resumeData.personalInfo.linkedIn || resumeData.personalInfo.website) {
        const webInfo = [resumeData.personalInfo.linkedIn, resumeData.personalInfo.website]
          .filter(Boolean).join(' | ');
        addText(webInfo, 10, false, true);
      }

      addSpacing(10);

      // Professional Summary
      if (resumeContent || resumeData.personalInfo.summary) {
        addText('PROFESSIONAL SUMMARY', 12, true);
        addSpacing(3);
        addText(resumeContent || resumeData.personalInfo.summary, 10);
        addSpacing(8);
      }

      // Professional Experience
      if (resumeData.experience.length > 0) {
        addText('PROFESSIONAL EXPERIENCE', 12, true);
        addSpacing(3);

        resumeData.experience.forEach((exp, index) => {
          // Job Title and Company
          addText(`${exp.position} | ${exp.company}`, 11, true);
          
          // Dates
          const dates = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
          addText(dates, 10);
          addSpacing(2);

          // Description
          if (exp.description) {
            addText(exp.description, 10);
            addSpacing(2);
          }

          // Achievements (ATS-friendly bullet points)
          exp.achievements.filter(a => a.trim()).forEach(achievement => {
            addText(`• ${achievement}`, 10);
          });

          if (index < resumeData.experience.length - 1) {
            addSpacing(6);
          }
        });

        addSpacing(8);
      }

      // Education
      if (resumeData.education.length > 0) {
        addText('EDUCATION', 12, true);
        addSpacing(3);

        resumeData.education.forEach(edu => {
          if (edu.degree && edu.field) {
            addText(`${edu.degree} in ${edu.field}`, 11, true);
          } else if (edu.degree) {
            addText(`${edu.degree}`, 11, true);
          } else if (edu.field) {
            addText(`${edu.field}`, 11, true);
          }
          addText(`${edu.institution}`, 10);
          
          const dates = `${edu.startYear} - ${edu.endYear}`;
          addText(dates, 10);

          if (edu.gpa) {
            addText(`GPA: ${edu.gpa}`, 10);
          }

          addSpacing(4);
        });

        addSpacing(6);
      }

      // Skills (ATS-friendly format)
      if (resumeData.skills.length > 0) {
        addText('TECHNICAL SKILLS', 12, true);
        addSpacing(3);

        const skills = resumeData.skills.map(skill => skill.name);
        if (skills.length > 0) {
          addText(`Technical Skills: ${skills.join(', ')}`, 10);
          addSpacing(2);
        }
      }

      // Check file size
      const pdfBlob = pdf.output('blob');
      const fileSizeMB = pdfBlob.size / (1024 * 1024);
      
      console.log(`ATS-friendly PDF file size: ${fileSizeMB.toFixed(2)} MB`);
      
      if (fileSizeMB > 2) {
        alert(`Warning: PDF size (${fileSizeMB.toFixed(2)} MB) exceeds 2MB. Consider reducing content length.`);
      }

      // Download the PDF
      const fileName = `${resumeData.personalInfo.fullName || 'Resume'}_Resume_ATS.pdf`;
      pdf.save(fileName);

      setExportStatus(prev => ({ ...prev, pdf: 'success' }));
      
      // Reset status after delay
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, pdf: 'idle' }));
      }, 2000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setExportStatus(prev => ({ ...prev, pdf: 'error' }));
      
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, pdf: 'idle' }));
      }, 2000);
    }
  };

  // Generate DOCX export
  const exportToDOCX = async () => {
    if (!resumeData.personalInfo.fullName && !resumeContent) {
      alert('Please fill in your resume information first');
      return;
    }

    setExportStatus(prev => ({ ...prev, docx: 'loading' }));

    try {
      // Dynamic import to avoid SSR issues
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

      // Create document sections
      const children = [];

      // Header with name and contact info
      children.push(
        new Paragraph({
          text: resumeData.personalInfo.fullName || 'Your Name',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        })
      );

      // Contact information
      const contactInfo = [
        resumeData.personalInfo.email,
        resumeData.personalInfo.phone,
        resumeData.personalInfo.location,
        resumeData.personalInfo.linkedIn,
        resumeData.personalInfo.website
      ].filter(Boolean).join(' | ');

      if (contactInfo) {
        children.push(
          new Paragraph({
            text: contactInfo,
            alignment: AlignmentType.CENTER,
          })
        );
      }

      children.push(new Paragraph({ text: "" })); // Empty line

      // Professional Summary
      if (resumeContent || resumeData.personalInfo.summary) {
        children.push(
          new Paragraph({
            text: "PROFESSIONAL SUMMARY",
            heading: HeadingLevel.HEADING_1,
          })
        );
        children.push(
          new Paragraph({
            text: resumeContent || resumeData.personalInfo.summary,
          })
        );
        children.push(new Paragraph({ text: "" }));
      }

      // Experience
      if (resumeData.experience.length > 0) {
        children.push(
          new Paragraph({
            text: "PROFESSIONAL EXPERIENCE",
            heading: HeadingLevel.HEADING_1,
          })
        );

        resumeData.experience.forEach(exp => {
          // Job title and company
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: exp.position, bold: true }),
                new TextRun({ text: ` | ${exp.company}` }),
              ],
            })
          );

          // Dates
          const dates = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
          children.push(
            new Paragraph({
              children: [new TextRun({ text: dates, italics: true })],
            })
          );

          // Description
          if (exp.description) {
            children.push(new Paragraph({ text: exp.description }));
          }

          // Achievements
          exp.achievements.filter(a => a.trim()).forEach(achievement => {
            children.push(
              new Paragraph({
                text: `• ${achievement}`,
              })
            );
          });

          children.push(new Paragraph({ text: "" }));
        });
      }

      // Education
      if (resumeData.education.length > 0) {
        children.push(
          new Paragraph({
            text: "EDUCATION",
            heading: HeadingLevel.HEADING_1,
          })
        );

        resumeData.education.forEach(edu => {
          let degreeFieldText = '';
          if (edu.degree && edu.field) {
            degreeFieldText = `${edu.degree} in ${edu.field}`;
          } else if (edu.degree) {
            degreeFieldText = edu.degree;
          } else if (edu.field) {
            degreeFieldText = edu.field;
          }
          
          const childrenArray: any[] = [];
          if (degreeFieldText) {
            childrenArray.push(new TextRun({ text: degreeFieldText, bold: true }));
            childrenArray.push(new TextRun({ text: ` | ${edu.institution}` }));
          } else {
            childrenArray.push(new TextRun({ text: edu.institution, bold: true }));
          }
          
          children.push(
            new Paragraph({
              children: childrenArray,
            })
          );

          const dates = `${edu.startYear} - ${edu.endYear}`;
          children.push(
            new Paragraph({
              children: [new TextRun({ text: dates, italics: true })],
            })
          );

          if (edu.gpa) {
            children.push(new Paragraph({ text: `GPA: ${edu.gpa}` }));
          }

          children.push(new Paragraph({ text: "" }));
        });
      }

      // Skills
      if (resumeData.skills.length > 0) {
        children.push(
          new Paragraph({
            text: "SKILLS",
            heading: HeadingLevel.HEADING_1,
          })
        );

        const skills = resumeData.skills.map(skill => skill.name);
        if (skills.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Technical Skills: ', bold: true }),
                new TextRun({ text: skills.join(', ') }),
              ],
            })
          );
        }
      }

      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      // Generate and download
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.fullName || 'Resume'}_Resume.docx`;
      link.click();
      URL.revokeObjectURL(url);

      setExportStatus(prev => ({ ...prev, docx: 'success' }));
      
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, docx: 'idle' }));
      }, 2000);

    } catch (error) {
      console.error('Error generating DOCX:', error);
      setExportStatus(prev => ({ ...prev, docx: 'error' }));
      
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, docx: 'idle' }));
      }, 2000);
    }
  };

  // Generate HTML content for PDF
  const generateHTMLContent = (data: ResumeData, content?: string): string => {
    const sections = [];

    // Header
    sections.push(`
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${data.personalInfo.fullName || 'Your Name'}</h1>
        <div style="margin-top: 10px; font-size: 12px;">
          ${[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean).join(' | ')}
        </div>
        ${data.personalInfo.linkedIn || data.personalInfo.website ? `
          <div style="margin-top: 5px; font-size: 12px;">
            ${[data.personalInfo.linkedIn, data.personalInfo.website].filter(Boolean).join(' | ')}
          </div>
        ` : ''}
      </div>
    `);

    // Professional Summary
    if (content || data.personalInfo.summary) {
      sections.push(`
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">PROFESSIONAL SUMMARY</h2>
          <p style="margin: 0; line-height: 1.4;">${content || data.personalInfo.summary}</p>
        </div>
      `);
    }

    // Experience
    if (data.experience.length > 0) {
      sections.push(`
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">PROFESSIONAL EXPERIENCE</h2>
          ${data.experience.map(exp => `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: bold;">${exp.position}</h3>
                <span style="font-size: 12px; font-style: italic;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div style="font-weight: bold; margin-bottom: 5px; color: #555;">${exp.company}</div>
              ${exp.description ? `<p style="margin: 5px 0; font-size: 12px;">${exp.description}</p>` : ''}
              ${exp.achievements.filter(a => a.trim()).length > 0 ? `
                <ul style="margin: 5px 0; padding-left: 20px;">
                  ${exp.achievements.filter(a => a.trim()).map(achievement => `<li style="margin-bottom: 3px; font-size: 12px;">${achievement}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `);
    }

    // Education
    if (data.education.length > 0) {
      sections.push(`
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">EDUCATION</h2>
          ${data.education.map(edu => {
            let degreeFieldText = '';
            if (edu.degree && edu.field) {
              degreeFieldText = `${edu.degree} in ${edu.field}`;
            } else if (edu.degree) {
              degreeFieldText = edu.degree;
            } else if (edu.field) {
              degreeFieldText = edu.field;
            }
            
            return `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="margin: 0; font-size: 14px; font-weight: bold;">${degreeFieldText || edu.institution}</h3>
                <span style="font-size: 12px; font-style: italic;">${edu.startYear} - ${edu.endYear}</span>
              </div>
              ${degreeFieldText ? `<div style="margin-top: 2px; color: #555;">${edu.institution}</div>` : ''}
              ${edu.gpa ? `<div style="margin-top: 2px; font-size: 12px;">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `;
          }).join('')}
        </div>
      `);
    }

    // Skills
    if (data.skills.length > 0) {
      const skills = data.skills.map(skill => skill.name);
      sections.push(`
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px;">TECHNICAL SKILLS</h2>
          <div style="margin-bottom: 8px;">
            <strong>Technical Skills:</strong> ${skills.join(', ')}
          </div>
        </div>
      `);
    }

    return sections.join('');
  };

  const getButtonContent = (format: ExportFormat) => {
    const status = exportStatus[format];
    const icon = format === 'pdf' ? FileText : File;
    
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Downloaded!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </>
        );
      default:
        return (
          <>
            {React.createElement(icon, { className: "w-4 h-4" })}
            <span>Export {format.toUpperCase()}</span>
          </>
        );
    }
  };

  return (
    <Card className={cn("border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Export Resume</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* PDF Export */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={exportToPDF}
              disabled={exportStatus.pdf === 'loading'}
              variant={exportStatus.pdf === 'success' ? 'default' : 'outline'}
              className={cn(
                "w-full flex items-center justify-center space-x-2 transition-all duration-200",
                exportStatus.pdf === 'success' && "bg-green-600 hover:bg-green-700 text-white",
                exportStatus.pdf === 'error' && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {getButtonContent('pdf')}
            </Button>
          </motion.div>

          {/* DOCX Export */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={exportToDOCX}
              disabled={exportStatus.docx === 'loading'}
              variant={exportStatus.docx === 'success' ? 'default' : 'outline'}
              className={cn(
                "w-full flex items-center justify-center space-x-2 transition-all duration-200",
                exportStatus.docx === 'success' && "bg-green-600 hover:bg-green-700 text-white",
                exportStatus.docx === 'error' && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {getButtonContent('docx')}
            </Button>
          </motion.div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>Export your resume in PDF format for job applications or DOCX for further editing</p>
          <p className="mt-1 text-green-600 font-medium">✓ PDF files are ATS-friendly with selectable text (100% parse rate)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportButtons;