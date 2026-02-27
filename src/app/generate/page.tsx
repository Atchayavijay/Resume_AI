"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ResumePreview from '@/components/ResumePreview';
import type { ResumeData } from '@/lib/types';
import { loadResumeData, saveResumeData, sanitizeSummary, loadResumeDataFromDB, saveResumeDataToDB } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

const GeneratePage = () => {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [jobDetails, setJobDetails] = useState('');
  const [additionalPrompts, setAdditionalPrompts] = useState('');
  const [generatedData, setGeneratedData] = useState<ResumeData | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visiblePanels, setVisiblePanels] = useState({ prompt: true, preview: true });

  useEffect(() => {
    const loadData = async () => {
      // Try loading from MongoDB first
      const dbData = await loadResumeDataFromDB();
      if (dbData) {
        setResumeData(dbData);
        setPosition(dbData.jobTitle || dbData.jobTarget?.position || '');
        setCompany(dbData.jobTarget?.company || '');
        setJobDetails(dbData.jobTarget?.description || dbData.jobDescription || '');
        return;
      }

      // Fallback to localStorage
      const stored = loadResumeData();
      if (!stored) {
        setError('No saved resume information found. Please build your resume first.');
      } else {
        setResumeData(stored);
        setPosition(stored.jobTitle || stored.jobTarget?.position || '');
        setCompany(stored.jobTarget?.company || '');
        setJobDetails(stored.jobTarget?.description || stored.jobDescription || '');
      }
    };

    loadData();
  }, []);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resumeData) return;

    setLoading(true);
    setError(null);
    setGeneratedData(null);

    const combinedDescription = [jobDetails.trim(), additionalPrompts.trim()]
      .filter(Boolean)
      .join('\n\n');

    const payload: ResumeData = {
      ...resumeData,
      jobTitle: position,
      jobDescription: combinedDescription,
      jobTarget: {
        position,
        company,
        description: combinedDescription
      }
    };

    try {
      const response = await apiClient('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          data: payload,
          options: { tone: 'professional', length: 'medium' }
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate resume. Please try again.');
      }

      const enhancedResume: ResumeData =
        result.data?.enhancedResumeData || payload;

      const sanitizedResume: ResumeData = {
        ...enhancedResume,
        personalInfo: {
          ...enhancedResume.personalInfo,
          summary: sanitizeSummary(enhancedResume.personalInfo.summary || '')
        }
      };

      setGeneratedData(sanitizedResume);
      setGeneratedContent(sanitizeSummary(result.data?.generatedContent || ''));
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Something went wrong while generating your resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyResume = () => {
    if (!generatedData) return;
    saveResumeData(generatedData);
    router.push('/builder');
  };

  if (!resumeData && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading your resume information...</p>
      </div>
    );
  }

  const togglePanel = (panel: 'prompt' | 'preview') => {
    setVisiblePanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const promptVisible = visiblePanels.prompt;
  const previewVisible = visiblePanels.preview;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/builder')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Button>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">AI Generation</p>
              <h1 className="text-xl font-semibold text-slate-900">Target Job & Prompts</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/builder')}
          >
            Exit
          </Button>
        </div>
      </header>

      <main
        className={`max-w-7xl mx-auto px-3 sm:px-6 pb-10 grid gap-6 ${promptVisible && previewVisible ? 'lg:grid-cols-12' : 'grid-cols-1'
          }`}
      >
        <Card className={`border border-slate-200 shadow-lg ${previewVisible ? 'lg:col-span-5' : 'w-full'}`}>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Customize the AI prompt</CardTitle>
              <p className="text-sm text-slate-500">
                We already saved your resume details. Provide the job target and any additional guidance for the AI to rebuild your resume from scratch.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePanel('prompt')}
              className="self-end text-slate-600 hover:text-slate-900"
            >
              {promptVisible ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" /> Hide
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" /> Show
                </>
              )}
            </Button>
          </CardHeader>
          {promptVisible && (
            <CardContent>
              <form className="space-y-5" onSubmit={handleGenerate}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Target Job Title</label>
                  <Input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g., Senior Product Manager"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Target Company (Optional)</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Microsoft"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Job Description / Requirements</label>
                  <Textarea
                    value={jobDetails}
                    onChange={(e) => setJobDetails(e.target.value)}
                    placeholder="Paste the job description or key responsibilities here..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Additional Prompts (Optional)</label>
                  <Textarea
                    value={additionalPrompts}
                    onChange={(e) => setAdditionalPrompts(e.target.value)}
                    placeholder="Anything specific you'd like the AI to emphasize? (e.g., leadership, certifications, tone)"
                    rows={4}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center gradient-primary text-white font-medium"
                  disabled={loading || !resumeData}
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Generating Resume...' : 'Generate New Resume'}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        <div className={`${promptVisible && previewVisible ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col space-y-4`}>
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>AI Resume Preview</CardTitle>
                <p className="text-sm text-slate-500">
                  The AI will rebuild your entire resume using the information you already provided plus the job target above.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePanel('preview')}
                className="self-end text-slate-600 hover:text-slate-900"
              >
                {previewVisible ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" /> Show
                  </>
                )}
              </Button>
            </CardHeader>
            {previewVisible && (
              <CardContent>
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 flex justify-center items-start w-full overflow-hidden">
                  {generatedData ? (
                    <div className="w-full max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
                      <div
                        className="a4-resume-container mx-auto"
                        style={{ width: 'min(240mm, 100%)', minHeight: '297mm', padding: '32px' }}
                      >
                        <ResumePreview
                          data={generatedData}
                          generatedContent={generatedContent}
                          selectedSections={[
                            'personalInfo',
                            'experience',
                            'education',
                            'skills',
                            'certificates',
                            'interests',
                            'projects',
                            'courses',
                            'awards',
                            'organisations',
                            'publications',
                            'references',
                            'languages',
                            'declaration',
                            'custom'
                          ]}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-16 w-full">
                      Submit the form to see the regenerated resume preview.
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {generatedData && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => router.push('/builder')}>
                Back to Builder
              </Button>
              <Button className="gradient-primary text-white" onClick={handleApplyResume}>
                Use This Resume
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GeneratePage;

