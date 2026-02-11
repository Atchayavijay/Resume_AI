/**
 * Feature Showcase Component
 * Highlights the comprehensive AI-powered resume checker features
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  FileText, 
  Zap, 
  Award, 
  User, 
  Palette,
  BarChart3,
  Sparkles
} from 'lucide-react';

const features = [
  {
    category: 'Content Analysis',
    icon: FileText,
    color: 'text-blue-600',
    checks: [
      'ATS parse rate optimization',
      'Word and phrase repetition detection',
      'Spelling and grammar verification',
      'Quantified impact measurement'
    ]
  },
  {
    category: 'Format Optimization',
    icon: Zap,
    color: 'text-yellow-600',
    checks: [
      'File format and size validation',
      'Resume length optimization',
      'Bullet point length analysis'
    ]
  },
  {
    category: 'Skills Assessment',
    icon: Award,
    color: 'text-green-600',
    checks: [
      'Hard skills relevancy',
      'Soft skills demonstration'
    ]
  },
  {
    category: 'Section Completeness',
    icon: User,
    color: 'text-purple-600',
    checks: [
      'Contact information verification',
      'Essential sections checklist',
      'Personality showcase evaluation'
    ]
  },
  {
    category: 'Style Enhancement',
    icon: Palette,
    color: 'text-pink-600',
    checks: [
      'Professional design assessment',
      'Email address professionalism',
      'Active voice usage',
      'Buzzword and cliché detection'
    ]
  }
];

export default function FeatureShowcase() {
  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-blue-600" />
          AI-Powered Resume Checker
          <Sparkles className="h-6 w-6 text-blue-600" />
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Our comprehensive system analyzes <strong>16 crucial aspects</strong> across 5 categories to optimize your resume for both ATS systems and human recruiters.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 text-lg ${feature.color}`}>
                    <IconComponent className="h-5 w-5" />
                    {feature.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {feature.checks.map((check, checkIndex) => (
                      <li key={checkIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{check}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-white/60 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Comprehensive Scoring System</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">Content</div>
              <div className="text-gray-600">4 checks</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-yellow-600">Format</div>
              <div className="text-gray-600">3 checks</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">Skills</div>
              <div className="text-gray-600">2 checks</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">Sections</div>
              <div className="text-gray-600">3 checks</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-pink-600">Style</div>
              <div className="text-gray-600">4 checks</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <p className="text-center text-sm text-gray-700">
            <strong>✨ AI-Enhanced Analysis:</strong> Goes beyond basic spell-check to provide tailored recommendations for maximum ATS compatibility and recruiter appeal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}