/**
 * AI-Powered Resume Checker Component
 * Uses Grok AI to provide intelligent, personalized resume analysis
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Zap,
  Award,
  User,
  Palette,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Target,
  Brain
} from 'lucide-react';
import type { ResumeData } from '@/lib/types';

// AI Analysis Types
interface AIResumeAnalysis {
  overallScore: number;
  overallFeedback: string;
  categories: {
    content: AIAnalysisCategory;
    format: AIAnalysisCategory;
    skills: AIAnalysisCategory;
    sections: AIAnalysisCategory;
    style: AIAnalysisCategory;
  };
  keyStrengths: string[];
  criticalImprovements: string[];
  personalizedRecommendations: string[];
  atsCompatibility: {
    score: number;
    parseability: string;
    keywordMatch: string;
    suggestions: string[];
  };
  competitiveAnalysis: {
    industryComparison: string;
    standoutFactors: string[];
    gapAnalysis: string[];
  };
}

interface AIAnalysisCategory {
  score: number;
  feedback: string;
  specificIssues: string[];
  improvements: string[];
  examples: string[];
}

interface ResumeCheckerProps {
  resumeData: ResumeData;
  resumeContent: string;
  // Removed unused variable pdfBlob
  onAnalysisComplete?: (analysis: AIResumeAnalysis) => void;
  analysisMode?: 'manual' | 'ai'; // Add analysis mode prop
}


interface BadgeComponentProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

const BadgeComponent = ({ children, variant = "default", className = "" }: BadgeComponentProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant === 'outline' ? 'border border-gray-300 text-gray-700' : 'bg-gray-100 text-gray-800'
    } ${className}`}>
    {children}
  </span>
);

export default function ResumeChecker({
  resumeData,
  resumeContent,
  // Removed unused variable pdfBlob
  onAnalysisComplete,
  analysisMode = 'manual'
}: ResumeCheckerProps) {
  const [analysis, setAnalysis] = useState<AIResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  const [error, setError] = useState<string | null>(null);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await apiClient('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          resumeContent,
          jobDescription: resumeData.jobDescription
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (resumeData && resumeContent && resumeData.personalInfo.fullName) {
      runAIAnalysis();
    }
  }, [resumeData, resumeContent, runAIAnalysis]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColorBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const categoryIcons = {
    content: FileText,
    format: Zap,
    skills: Award,
    sections: User,
    style: Palette
  };

  const categoryLabels = {
    content: 'Content',
    format: 'Format',
    skills: 'Skills',
    sections: 'Sections',
    style: 'Style'
  };

  if (isAnalyzing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI is Analyzing Your Resume...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Our AI expert is conducting a comprehensive analysis of your resume, examining 16 crucial aspects across 5 categories to provide personalized, actionable recommendations.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">AI Analysis in Progress</span>
              </div>
              <div className="text-sm text-blue-700">
                ✓ Parsing resume structure and content<br />
                ✓ Analyzing ATS compatibility<br />
                ✓ Evaluating industry alignment<br />
                ✓ Generating personalized recommendations...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={runAIAnalysis} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            AI-Powered Resume Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Get intelligent, personalized analysis powered by advanced AI. Our system examines your resume like an expert recruiter and provides actionable recommendations.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-blue-800 mb-1">📊 Smart Analysis</div>
                <div className="text-blue-700">Context-aware scoring and feedback</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-green-800 mb-1">🎯 Personalized Tips</div>
                <div className="text-green-700">Tailored to your experience and goals</div>
              </div>
            </div>
            <Button onClick={runAIAnalysis} className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Start AI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Card with AI Badge */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span>AI Resume Analysis</span>
              <BadgeComponent className="bg-blue-600 text-white">
                Powered by AI
              </BadgeComponent>
              {analysisMode === 'ai' && (
                <BadgeComponent className="bg-purple-600 text-white">
                  AI Content
                </BadgeComponent>
              )}
              {analysisMode === 'manual' && (
                <BadgeComponent className="bg-green-600 text-white">
                  Manual Content
                </BadgeComponent>
              )}
            </div>
            <BadgeComponent variant="outline" className={`text-lg px-3 py-1 ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}/100
            </BadgeComponent>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall AI Score</span>
                <span className={getScoreColor(analysis.overallScore)}>
                  {analysis.overallScore}%
                </span>
              </div>
              <Progress value={analysis.overallScore} className="h-3" />
            </div>

            <div className="bg-white/80 p-4 rounded-lg border">
              <p className="text-gray-700 text-sm leading-relaxed">{analysis.overallFeedback}</p>
            </div>

            <Button onClick={runAIAnalysis} variant="outline" size="sm" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-analyze with AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-1">
              {React.createElement(categoryIcons[key as keyof typeof categoryIcons], {
                className: "w-4 h-4"
              })}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Category Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(analysis.categories).map(([category, data]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <Card key={category} className={`${getScoreColorBg(data.score)} border-2`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                        {data.score}%
                      </div>
                      <Progress value={data.score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strengths */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyStrengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span className="text-green-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Critical Improvements */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Priority Fixes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.criticalImprovements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span className="text-red-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                  <Brain className="w-5 h-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.personalizedRecommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-blue-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* ATS Compatibility */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Target className="w-5 h-5" />
                ATS Compatibility Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">ATS Score:</span>
                <BadgeComponent className={`${getScoreColor(analysis.atsCompatibility.score)} border-current`}>
                  {analysis.atsCompatibility.score}/100
                </BadgeComponent>
              </div>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Parseability:</span> {analysis.atsCompatibility.parseability}</p>
                <p><span className="font-medium">Keyword Match:</span> {analysis.atsCompatibility.keywordMatch}</p>
              </div>
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">ATS Optimization Tips:</h4>
                <ul className="space-y-1 text-sm">
                  {analysis.atsCompatibility.suggestions.slice(0, 3).map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span className="text-purple-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Detail Tabs */}
        {Object.entries(analysis.categories).map(([category, data]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <CategoryDetailCard category={category} data={data} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function CategoryDetailCard({ category, data }: { category: string, data: AIAnalysisCategory }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColorBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const categoryIcons = {
    content: FileText,
    format: Zap,
    skills: Award,
    sections: User,
    style: Palette
  };

  const Icon = categoryIcons[category as keyof typeof categoryIcons];

  return (
    <Card className={`border-2 ${getScoreColorBg(data.score)}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6" />}
            <span className="text-xl capitalize">{category} Analysis</span>
          </div>
          <BadgeComponent variant="outline" className={`text-lg px-3 py-1 ${getScoreColor(data.score)} border-current`}>
            {data.score}/100
          </BadgeComponent>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/80 p-4 rounded-lg border">
          <p className="text-gray-700 leading-relaxed">{data.feedback}</p>
        </div>

        {data.specificIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Issues Found:
            </h4>
            <ul className="space-y-1 text-sm">
              {data.specificIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span className="text-gray-700">{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Improvement Suggestions:
            </h4>
            <ul className="space-y-1 text-sm">
              {data.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.examples.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Examples:
            </h4>
            <ul className="space-y-1 text-sm">
              {data.examples.map((example, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700 italic">{example}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}