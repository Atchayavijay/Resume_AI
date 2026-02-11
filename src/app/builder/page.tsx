"use client";

/**
 * Main Resume AI Builder Page
 * Two-column layout with form on left and preview/analysis on right
 */

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Download,
  BarChart3,
  Settings,
  Save,
  Eye,
  Menu,
  X,
  Palette,
  LogOut
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import ResumeForm from '@/components/ResumeForm';
import ResumePreview from '@/components/ResumePreview';
import AIResumeChecker from '@/components/AIResumeChecker';
import FeatureShowcase from '@/components/FeatureShowcase';
import ExportButtons from '@/components/ExportButtons';
import ChangesVisualization from '@/components/ChangesVisualization';
import AddSectionsModal from '@/components/AddSectionsModal';
import BottomDockPanel from '@/components/BottomDockPanel';
import CustomizeForm from '@/components/CustomizeForm';
import '@/components/bottom-dock-panel.css';

import type { ResumeData } from '@/lib/types';
import { loadResumeData, saveResumeData, clearResumeData, loadResumeDataFromDB, saveResumeDataToDB } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { trackResumeChanges, type ChangesSummary } from '@/lib/change-tracker';
import { DEFAULT_DESIGN } from '@/lib/defaults';
import { getTemplateById } from '@/lib/templates';
import atsOptimizedResume from '@/lib/seed/atsOptimizedResume';
import lastAIResponseResume from '@/lib/seed/lastAIResponseResume';

function BuilderPageContent() {
  const searchParams = useSearchParams();
  const [previewVisible] = useState(true);
  // State management
  const [dockOpen, setDockOpen] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      website: '',
      summary: '',
      yearsOfExperience: 0
    },
    experience: [],
    education: [],
    skills: [],
    softSkills: [],
    jobTitle: '',
    jobDescription: '',
    jobTarget: {
      position: '',
      company: '',
      description: ''
    },
    certificates: [],
    interests: [],
    projects: [],
    courses: [],
    awards: [],
    organisations: [],
    publications: [],
    references: [],
    languages: [],
    declaration: {
      statement: '',
      place: '',
      date: '',
      signature: ''
    },
    custom: {
      title: '',
      content: ''
    },
    design: DEFAULT_DESIGN
  });

  const router = useRouter();
  const { user, logout } = useAuth();
  const [generatedContent, setGeneratedContent] = useState<string>('');
  // Separate AI preview data so manual form isn't overwritten until user accepts
  const [aiPreviewData, setAiPreviewData] = useState<ResumeData | null>(null);
  const [currentView, setCurrentView] = useState<'preview' | 'aiPreview' | 'ats' | 'export' | 'changes' | 'customize'>('preview');
  const [analysisMode, setAnalysisMode] = useState<'manual' | 'ai'>('manual'); // Track which content to analyze
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'info' | 'preview'>('split');
  const [changesSummary, setChangesSummary] = useState<ChangesSummary | null>(null);

  // Modal state
  const [addSectionsModalOpen, setAddSectionsModalOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(['personalInfo', 'summary', 'experience', 'education', 'skills']);

  // Load saved data on mount
  useEffect(() => {
    const loadData = async () => {
      const templateId = searchParams.get('template');
      const template = templateId ? getTemplateById(templateId) : undefined;
      const applyDesign = (data: ResumeData) => ({
        ...data,
        design: template ? template.design : (data.design || DEFAULT_DESIGN)
      });

      // Try loading from MongoDB first
      const dbData = await loadResumeDataFromDB();
      if (dbData) {
        setResumeData(applyDesign(dbData));
        return;
      }
      
      // Fallback to localStorage
      const savedData = loadResumeData();
      if (savedData) {
        setResumeData(applyDesign(savedData));
        saveResumeDataToDB(applyDesign(savedData)).catch(console.error);
        return;
      }

      // No saved resume: apply template design to default state
      if (template) {
        setResumeData((prev) => ({
          ...prev,
          design: template.design
        }));
      }
    };
    
    loadData();
  }, [searchParams]);

  // Generate comprehensive resume content for analysis
  const generateFullResumeContent = (data: ResumeData): string => {
    const content = [];

    // Personal Info & Summary
    if (data.personalInfo.fullName) {
      content.push(`Name: ${data.personalInfo.fullName}`);
    }
    if (data.personalInfo.email) {
      content.push(`Email: ${data.personalInfo.email}`);
    }
    if (data.personalInfo.phone) {
      content.push(`Phone: ${data.personalInfo.phone}`);
    }
    if (data.personalInfo.location) {
      content.push(`Location: ${data.personalInfo.location}`);
    }
    if (data.personalInfo.linkedIn) {
      content.push(`LinkedIn: ${data.personalInfo.linkedIn}`);
    }
    if (data.personalInfo.website) {
      content.push(`Website: ${data.personalInfo.website}`);
    }

    // Professional Summary
    if (data.personalInfo.summary) {
      content.push(`\nProfessional Summary:\n${data.personalInfo.summary}`);
    }

    // Experience
    if (data.experience.length > 0) {
      content.push('\nExperience:');
      data.experience.forEach(exp => {
        content.push(`\n${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`);
        if (exp.description) {
          content.push(exp.description);
        }
        if (exp.achievements.length > 0) {
          content.push('Achievements:');
          exp.achievements.forEach(achievement => {
            content.push(`• ${achievement}`);
          });
        }
      });
    }

    // Education
    if (data.education.length > 0) {
      content.push('\nEducation:');
      data.education.forEach(edu => {
        let eduLine = edu.institution;
        if (edu.degree && edu.field) {
          eduLine = `${edu.degree} in ${edu.field} from ${edu.institution}`;
        } else if (edu.degree) {
          eduLine = `${edu.degree} from ${edu.institution}`;
        } else if (edu.field) {
          eduLine = `${edu.field} from ${edu.institution}`;
        }
        eduLine += ` (${edu.startYear} - ${edu.endYear})`;
        content.push(eduLine);
        if (edu.gpa) {
          content.push(`GPA: ${edu.gpa}`);
        }
      });
    }

    // Skills
    if (data.skills.length > 0) {
      content.push(`\nTechnical Skills: ${data.skills.map(skill => skill.name).join(', ')}`);
    }

    return content.join('\n');
  };

  // Auto-switch to AI analysis mode when AI preview data is available
  useEffect(() => {
    if (aiPreviewData && currentView === 'ats') {
      setAnalysisMode('ai');
    }
  }, [aiPreviewData, currentView]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && resumeData.personalInfo.fullName) {
      const timeoutId = setTimeout(() => {
        saveResumeData(resumeData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, autoSave]);

  const handleGenerateContent = () => {
    if (!resumeData.personalInfo.fullName) {
      alert('Please fill in your name first');
      return;
    }

    saveResumeData(resumeData);
    router.push('/generate');
  };

  const handleSave = () => {
    saveResumeData(resumeData);
    const button = document.getElementById('save-button');
    if (button) {
      button.textContent = 'Saved!';
      setTimeout(() => {
        button.textContent = 'Save';
      }, 1500);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearResumeData();
      setResumeData({
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          linkedIn: '',
          website: '',
          summary: '',
          yearsOfExperience: 0
        },
        experience: [],
        education: [],
        skills: [],
        jobTitle: '',
        jobDescription: '',
        jobTarget: {
          position: '',
          company: '',
          description: ''
        },
        design: DEFAULT_DESIGN
      });
      setGeneratedContent('');
    }
  };

  const handleAddSection = (sectionId: string) => {
    if (!selectedSections.includes(sectionId) && sectionId !== 'personalInfo') {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const handleRemoveSection = (sectionId: string) => {
    if (sectionId !== 'personalInfo') {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    }
  };

  const handleToggleSection = (sectionId: string) => {
    if (sectionId === 'personalInfo') return;

    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  return (
    <div className="min-h-screen">
      {!dockOpen && (
        <div className="fixed bottom-6 right-8 z-50">
          <Button
            variant="default"
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-400 text-white font-bold px-6 py-3 hover:from-pink-400 hover:to-purple-500 transition-colors duration-300"
            onClick={() => setDockOpen(true)}
          >
            Resume Menu
          </Button>
        </div>
      )}

      <BottomDockPanel isOpen={dockOpen} onClose={() => setDockOpen(false)}>
        <div className="flex flex-row justify-center items-center gap-6 w-full px-2 py-2 bg-white/40 rounded-2xl shadow-md overflow-x-auto no-scrollbar">
          <Button
            variant={currentView === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('preview')}
            className={`flex flex-col items-center justify-center shrink-0 h-20 w-32 rounded-2xl font-semibold text-base transition-all duration-300 shadow-sm ${currentView === 'preview' ? 'bg-gradient-to-r from-orange-400 to-yellow-300 text-white shadow-xl ring-2 ring-orange-400 transform scale-105' : 'bg-white/0 text-foreground hover:bg-white/30 hover:scale-102'}`}
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Content</span>
          </Button>

          <Button
            variant={currentView === 'customize' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('customize')}
            className={`flex flex-col items-center justify-center shrink-0 h-20 w-32 rounded-2xl font-semibold text-base transition-all duration-300 shadow-sm ${currentView === 'customize' ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-white shadow-xl ring-2 ring-emerald-400 transform scale-105' : 'bg-white/0 text-foreground hover:bg-white/30 hover:scale-102'}`}
          >
            <Palette className="h-5 w-5 mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Custom Design</span>
          </Button>

          <Button
            variant={currentView === 'aiPreview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('aiPreview')}
            className={`flex flex-col items-center justify-center shrink-0 h-20 w-32 rounded-2xl font-semibold text-base transition-all duration-300 shadow-sm ${currentView === 'aiPreview' ? 'bg-[linear-gradient(to_right,#f59e0b,#f97316,#ea580c,#dc2626)] text-white shadow-xl ring-2 ring-orange-400 transform scale-105' : 'bg-white/0 text-foreground hover:bg-white/30 hover:scale-102'}`}
          >
            <Sparkles className="h-5 w-5 mb-1 text-white" />
            <span className="text-[11px] font-bold uppercase tracking-tight">AI Suggestions</span>
          </Button>

          <div className="w-px h-10 bg-slate-200 mx-2 opacity-50" />

          <Button
            variant={currentView === 'ats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('ats')}
            className={`flex flex-col items-center justify-center shrink-0 h-20 w-32 rounded-2xl font-semibold text-base transition-all duration-300 shadow-sm ${currentView === 'ats' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-xl ring-2 ring-blue-400 transform scale-105' : 'bg-white/0 text-foreground hover:bg-white/30 hover:scale-102'}`}
          >
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Analysis</span>
          </Button>

          <Button
            variant={currentView === 'changes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('changes')}
            className={`relative flex flex-col items-center justify-center shrink-0 h-20 w-32 rounded-2xl font-semibold text-base transition-all duration-300 shadow-sm ${currentView === 'changes' ? 'bg-gradient-to-r from-yellow-400 to-red-400 text-white shadow-xl ring-2 ring-red-400 transform scale-105' : 'bg-white/0 text-foreground hover:bg-white/30 hover:scale-102'}`}
          >
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Changes</span>
            {changesSummary && changesSummary.totalChanges > 0 && (
              <div className="absolute top-2 right-4 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center pulse-glow">
                {changesSummary.totalChanges}
              </div>
            )}
          </Button>

          <Button
            variant={currentView === 'export' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('export')}
            className={`flex flex-col items-center justify-center shrink-0 h-20 w-32 rounded-2xl font-semibold text-base transition-all duration-300 shadow-sm ${currentView === 'export' ? 'bg-gradient-to-r from-sky-400 to-indigo-400 text-white shadow-xl ring-2 ring-indigo-400 transform scale-105' : 'bg-white/0 text-foreground hover:bg-white/30 hover:scale-102'}`}
          >
            <Download className="h-5 w-5 mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-tight">Export</span>
          </Button>
        </div>
      </BottomDockPanel>

      <header className="sticky top-0 z-50 w-full glass-card border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
                <div className="relative">
                  <div className="gradient-primary p-3 rounded-2xl shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 gradient-accent rounded-full pulse-glow" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    Resume AI Builder
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    Professional • ATS-Optimized • AI-Powered
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="flex items-center space-x-2 glass-card p-2 rounded-2xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button
                variant={viewMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="rounded-xl"
              >
                Split View
              </Button>
              <Button
                variant={viewMode === 'info' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('info')}
                className="rounded-xl"
              >
                Info Only
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('preview')}
                className="rounded-xl"
              >
                Preview Only
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                id="save-button"
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="glass-button rounded-xl text-foreground hover:text-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={handleGenerateContent}
                className="gradient-primary hover:shadow-xl rounded-full btn-hover-lift text-white font-bold px-8 shadow-orange-200/50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await logout();
                  router.push('/');
                  router.refresh();
                }}
                className="hidden sm:flex glass-button rounded-xl text-muted-foreground hover:text-foreground"
                title="Logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden glass-button rounded-xl"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/20 glass-card"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'preview', icon: Eye, label: 'Preview' },
                    { id: 'ats', icon: BarChart3, label: 'Analysis' },
                    { id: 'export', icon: Download, label: 'Export' },
                    { id: 'changes', icon: Settings, label: 'Changes' }
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      variant={currentView === tab.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setCurrentView(tab.id as typeof currentView);
                        setMobileMenuOpen(false);
                      }}
                      className={`justify-start rounded-xl ${
                        currentView === tab.id
                          ? 'gradient-primary text-white'
                          : 'glass-button text-foreground'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAiPreviewData(atsOptimizedResume);
                      setGeneratedContent(atsOptimizedResume.personalInfo.summary);
                      if (resumeData) {
                        const changes = trackResumeChanges(resumeData, atsOptimizedResume);
                        setChangesSummary(changes);
                        if (changes.totalChanges > 0) setCurrentView('changes');
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start glass-button rounded-xl"
                  >
                    Load ATS Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAiPreviewData(lastAIResponseResume);
                      setGeneratedContent(lastAIResponseResume.personalInfo.summary);
                      if (resumeData) {
                        const changes = trackResumeChanges(resumeData, lastAIResponseResume);
                        setChangesSummary(changes);
                        if (changes.totalChanges > 0) setCurrentView('changes');
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start glass-button rounded-xl"
                  >
                    Load Last AI Response
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main-content" className="w-full px-0 py-4">
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 w-full mx-0">
            <div className="lg:col-span-5 flex flex-col flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-16"
              >
                <Card className="glass-card border-0 shadow-2xl card-hover-glow">
                  <CardHeader className="pb-2 border-b border-white/10">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="gradient-primary p-2 rounded-xl">
                        <Settings className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="gradient-text text-lg font-semibold">Resume Information</span>
                        <p className="text-sm text-muted-foreground font-normal">Build your professional resume</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-160px)] overflow-y-auto">
                    {currentView === 'customize' ? (
                      <CustomizeForm
                        data={resumeData}
                        onChange={setResumeData}
                      />
                    ) : (
                      <ResumeForm
                        data={resumeData}
                        onChange={setResumeData}
                        selectedSections={selectedSections}
                        onOpenSectionsModal={() => setAddSectionsModalOpen(true)}
                        onSectionsOrderChange={setSelectedSections}
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            <div className="lg:col-span-7 flex flex-col flex-1">
              <AnimatePresence mode="wait">
                {previewVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <AnimatePresence mode="wait">
                      {(currentView === 'preview' || currentView === 'customize') && (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-center items-start w-full min-h-[297mm]"
                        >
                          <ResumePreview
                            data={resumeData}
                            selectedSections={selectedSections}
                            generatedContent={generatedContent}
                            className="a4-resume-content"
                            onToggleSection={handleToggleSection}
                          />
                        </motion.div>
                      )}

                      {currentView === 'aiPreview' && (
                        <motion.div
                          key="aiPreview"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="mb-4">
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span>AI Preview</span>
                                <div className="space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (aiPreviewData) {
                                        setResumeData(aiPreviewData);
                                        setAiPreviewData(null);
                                        const changes = trackResumeChanges(resumeData, aiPreviewData);
                                        setChangesSummary(changes);
                                        setCurrentView('preview');
                                      }
                                    }}
                                  >
                                    Apply AI Suggestions
                                  </Button>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {aiPreviewData ? (
                                <ResumePreview data={aiPreviewData} selectedSections={selectedSections} generatedContent={generatedContent} onToggleSection={handleToggleSection} />
                              ) : (
                                <div className="text-sm text-slate-500">No AI preview available. Generate content to see suggestions.</div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {currentView === 'ats' && (
                        <motion.div
                          key="ats"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          {(!resumeData.personalInfo.fullName || resumeData.personalInfo.fullName.length < 3) && (
                            <FeatureShowcase />
                          )}

                          {(resumeData.personalInfo.fullName && aiPreviewData) && (
                            <Card className="bg-blue-50 border-blue-200">
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-blue-800">
                                    Analyze Resume Version:
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      variant={analysisMode === 'manual' ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => setAnalysisMode('manual')}
                                    >
                                      Manual Resume
                                    </Button>
                                    <Button
                                      variant={analysisMode === 'ai' ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => setAnalysisMode('ai')}
                                    >
                                      AI Generated
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          <AIResumeChecker
                            resumeData={analysisMode === 'ai' && aiPreviewData ? aiPreviewData : resumeData}
                            resumeContent={generateFullResumeContent(
                              analysisMode === 'ai' && aiPreviewData ? aiPreviewData : resumeData
                            )}
                            analysisMode={analysisMode}
                          />
                        </motion.div>
                      )}

                      {currentView === 'changes' && (
                        <motion.div
                          key="changes"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChangesVisualization
                            changes={changesSummary}
                            originalData={resumeData}
                            enhancedData={resumeData}
                            visible={true}
                            onToggleVisibility={() => { }}
                          />
                        </motion.div>
                      )}

                      {currentView === 'export' && (
                        <motion.div
                          key="export"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          <ExportButtons
                            resumeData={resumeData}
                            resumeContent={generatedContent || resumeData.personalInfo.summary}
                          />

                          <Card className="border border-slate-200/60 bg-white/60 backdrop-blur-sm">
                            <CardHeader>
                              <CardTitle className="text-sm">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSave}
                                className="w-full justify-start"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Current Progress
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                                className="w-full justify-start text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Clear All Data
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
        {viewMode === 'info' && (
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-6xl"
            >
              <Card className="glass-card border-0 shadow-2xl card-hover-glow">
                <CardHeader className="pb-2 border-b border-white/10">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="gradient-primary p-2 rounded-xl">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="gradient-text text-lg font-semibold">Resume Information</span>
                      <p className="text-sm text-muted-foreground font-normal">Build your professional resume</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-160px)] overflow-y-auto">
                  {currentView === 'customize' ? (
                    <CustomizeForm
                      data={resumeData}
                      onChange={setResumeData}
                    />
                  ) : (
                    <ResumeForm
                      data={resumeData}
                      onChange={setResumeData}
                      selectedSections={selectedSections}
                      onOpenSectionsModal={() => setAddSectionsModalOpen(true)}
                      onSectionsOrderChange={setSelectedSections}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
        {viewMode === 'preview' && (
          <div className="w-full flex justify-center py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200"
              style={{ width: '210mm', height: '297mm', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden', padding: '32px' }}
            >
              <ResumePreview
                data={resumeData}
                selectedSections={selectedSections}
                generatedContent={generatedContent}
                onToggleSection={handleToggleSection}
              />
            </motion.div>
          </div>
        )}
      </main>

      <AddSectionsModal
        isOpen={addSectionsModalOpen}
        onClose={() => setAddSectionsModalOpen(false)}
        selectedSections={selectedSections}
        onAddSection={handleAddSection}
        onRemoveSection={handleRemoveSection}
      />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-orange-50/30">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BuilderPageContent />
    </Suspense>
  );
}
