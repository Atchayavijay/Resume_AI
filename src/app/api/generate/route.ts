                                                                                                                                                                        /**
 * API Route for AI-Powered Resume Generation
 * Integrates with Groq (Mixtral-8x7b) for intelligent resume creation and optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateResumeContent, optimizeResumeForATS } from '@/lib/groq';
import { analyzeATSCompatibility } from '@/lib/ats';
import { distributeAIContent, isAIGeneratedContent } from '@/lib/resume-parser';
import type { ResumeData } from '@/lib/types';
import { DEFAULT_DESIGN } from '@/lib/defaults';

export async function POST(request: NextRequest) {
  try {                                                                                              
    const body = await request.json();
  const { action, data } = body;

    switch (action) {
      case 'generate':
          return await generateResume(data);
      case 'optimize':
          return await optimizeResume(data);
      case 'analyze':
          return await analyzeResume(data);
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: generate, optimize, analyze' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Generate resume content based on job target and personal information
 */
async function generateResume(data: Partial<ResumeData>) {
  try {
    // === LOG DATA RECEIVED BY API ===
    console.log('=== API RECEIVED DATA ===');
    console.log('📦 Raw Data Object:', JSON.stringify(data, null, 2));
    console.log('👤 Personal Info Received:', data.personalInfo);
    console.log('💼 Experience Received:', data.experience);
    console.log('🎓 Education Received:', data.education);
    console.log('⚡ Skills Received:', data.skills);
    console.log('🎯 Job Target Received:', data.jobTarget);
    console.log('📝 Job Title Received:', data.jobTitle);
    console.log('📋 Job Description Received:', data.jobDescription);
    console.log('========================');

    if (!data.personalInfo?.fullName) {
      return NextResponse.json(
        { error: 'Personal information is required for resume generation' },
        { status: 400 }
      );
    }

    // Convert partial data to full ResumeData with defaults
    const resumeData: ResumeData = {
      personalInfo: data.personalInfo,
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      jobTitle: data.jobTarget?.position || data.jobTitle || '',
      jobDescription: data.jobTarget?.description || data.jobDescription || '',
      jobTarget: data.jobTarget,
      design: data.design || DEFAULT_DESIGN,
    };

    const response = await generateResumeContent(resumeData);
    
    if (!response.content) {
      throw new Error('Failed to generate resume content');
    }

    // Enhanced: Distribute AI content across all resume sections
    let enhancedResumeData = resumeData;
    console.log('📄 AI Generated Content:', response.content); 
    
    // Check if content should be distributed
    const shouldDistribute = isAIGeneratedContent(response.content);
    console.log('🤔 Should distribute content?', shouldDistribute);
    console.log('📏 Content length:', response.content.length);
    console.log('🔍 Has Professional Summary?', response.content.includes('Professional Summary'));
    console.log('🔍 Has Technical Skills?', response.content.includes('Technical Skills'));
    
    if (shouldDistribute) {
      console.log('✅ Distributing AI content...');
      try {
        enhancedResumeData = distributeAIContent(response.content, resumeData);
        console.log('🎉 Enhanced Resume Data after distribution:', enhancedResumeData);
      } catch (error) {
        console.error('❌ Error in distributeAIContent:', error);
        enhancedResumeData = resumeData; // Fallback to original
      }
    } else {
      console.log('❌ Content not recognized as AI-generated, using as summary only');
      // Fallback: treat as summary enhancement
      enhancedResumeData = {
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          summary: response.content
        }
      };
    }

    // Analyze the enhanced resume for ATS optimization
    const atsAnalysis = analyzeATSCompatibility(
      enhancedResumeData.personalInfo.summary || response.content,
      resumeData.jobDescription,
      enhancedResumeData
    );

    // Use the ATS analysis score as the primary score
    const finalATSScore = atsAnalysis.score;

    // Generate advanced ATS optimization suggestions
    const suggestions = generateSuggestions(enhancedResumeData, response.content, atsAnalysis);

    return NextResponse.json({
      success: true,
      data: {
        enhancedResumeData, // Return the complete enhanced resume data
        generatedContent: response.content,
        atsAnalysis,
        atsScore: finalATSScore, // Use consistent ATS score
        suggestions,
        keywordOptimization: {
          matched: atsAnalysis.matchedKeywords,
          missing: atsAnalysis.missingKeywords.slice(0, 10),
          suggestions: atsAnalysis.missingKeywords.slice(0, 5).map(keyword => ({
            keyword,
            priority: 'high',
            suggestion: `Consider incorporating "${keyword}" in your experience or skills sections`
          }))
        }
      }
    });

  } catch (error) {
    console.error('Resume generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume content. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Optimize existing resume content for better ATS compatibility
 */
async function optimizeResume(data: ResumeData) {
  try {
    if (!data.jobTarget?.description && !data.jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required for resume optimization' },
        { status: 400 }
      );
    }

    const currentContent = data.personalInfo.summary || '';
    
    if (!currentContent.trim()) {
      return NextResponse.json(
        { error: 'Resume content is required for optimization' },
        { status: 400 }
      );
    }

    const jobDescription = data.jobTarget?.description || data.jobDescription;

    // Analyze original content
    const originalAnalysis = analyzeATSCompatibility(
      currentContent,
      jobDescription,
      data
    );

    // Optimize with AI
    const missingKeywords = originalAnalysis.missingKeywords || [];
    const optimizedContent = await optimizeResumeForATS(
      data,
      missingKeywords
    );

    // Analyze optimized content
    const optimizedData = {
      ...data,
      personalInfo: {
        ...data.personalInfo,
        summary: optimizedContent
      }
    };
    const optimizedAnalysis = analyzeATSCompatibility(
      optimizedContent,
      jobDescription,
      optimizedData
    );

    return NextResponse.json({
      success: true,
      data: {
        originalContent: currentContent,
        optimizedContent,
        originalAnalysis,
        optimizedAnalysis,
        improvement: {
          scoreIncrease: optimizedAnalysis.score - originalAnalysis.score,
          keywordImprovement: optimizedAnalysis.matchedKeywords.length - originalAnalysis.matchedKeywords.length,
          newKeywords: optimizedAnalysis.matchedKeywords.filter(
            (kw: string) => !originalAnalysis.matchedKeywords.includes(kw)
          )
        }
      }
    });

  } catch (error) {
    console.error('Resume optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize resume content. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Analyze resume for ATS compatibility and provide detailed feedback
 */
async function analyzeResume(data: ResumeData) {
  try {
    if (!data.jobTarget?.description && !data.jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required for resume analysis' },
        { status: 400 }
      );
    }

    const jobDescription = data.jobTarget?.description || data.jobDescription;
    const resumeContent = data.personalInfo.summary || '';

    // Perform comprehensive ATS analysis
    const atsAnalysis = analyzeATSCompatibility(
      resumeContent,
      jobDescription,
      data
    );

    // Generate improvement suggestions
    const suggestions = generateAnalysisSuggestions(atsAnalysis, data);

    return NextResponse.json({
      success: true,
      data: {
        atsAnalysis,
        suggestions,
        competitiveAnalysis: generateCompetitiveAnalysis(atsAnalysis),
        keywordGaps: atsAnalysis.missingKeywords.slice(0, 10),
        strengths: atsAnalysis.matchedKeywords.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Generate improvement suggestions based on context
 */
import type { ATSAnalysis } from '@/lib/types';
function generateSuggestions(resumeData: ResumeData, generatedContent: string, atsAnalysis: ATSAnalysis) {
  const suggestions = [];

  // Keyword suggestions
  if (atsAnalysis.missingKeywords.length > 0) {
    suggestions.push({
      type: 'keywords',
      priority: 'high',
      message: `Consider incorporating these missing keywords: ${atsAnalysis.missingKeywords.slice(0, 5).join(', ')}`,
      keywords: atsAnalysis.missingKeywords.slice(0, 5)
    });
  }

  // Experience suggestions
  if (resumeData.experience.length === 0) {
    suggestions.push({
      type: 'experience',
      priority: 'high',
      message: 'Add relevant work experience to strengthen your profile',
      action: 'Add work experience in the Experience section'
    });
  }

  // Skills suggestions
  if (resumeData.skills.length < 8) {
    suggestions.push({
      type: 'skills',
      priority: 'medium',
      message: 'Consider adding more relevant skills to match the job requirements',
      action: 'Add technical and soft skills relevant to the position'
    });
  }

  // ATS score suggestions
  if (atsAnalysis.score < 80) {
    suggestions.push({
      type: 'ats',
      priority: 'medium',
      message: 'Your ATS score can be improved by optimizing keyword usage and content structure',
      action: 'Use the Optimize feature to improve ATS compatibility'
    });
  }

  return suggestions;
}

/**
 * Generate analysis-specific suggestions
 */
function generateAnalysisSuggestions(atsAnalysis: ATSAnalysis, data: ResumeData) {
  const suggestions = [];

  // High-priority suggestions
  if (atsAnalysis.score < 70) {
    suggestions.push({
      category: 'Critical',
      priority: 'high',
      suggestion: 'Your resume needs significant optimization to pass ATS screening',
      impact: 'Major improvement in job application success rate'
    });
  }

  // Keyword suggestions
  if (atsAnalysis.missingKeywords.length > 5) {
    suggestions.push({
      category: 'Keywords',
      priority: 'high',
      suggestion: `Add these critical keywords: ${atsAnalysis.missingKeywords.slice(0, 3).join(', ')}`,
      impact: 'Improves ATS keyword matching significantly'
    });
  }

  // Experience suggestions
  const hasQuantifiedAchievements = data.experience.some(exp => 
    exp.achievements.some(achievement => /\d+/.test(achievement))
  );

  if (!hasQuantifiedAchievements) {
    suggestions.push({
      category: 'Experience',
      priority: 'medium',
      suggestion: 'Add quantified achievements with specific numbers and metrics',
      impact: 'Makes accomplishments more compelling and measurable'
    });
  }

  // Skills alignment
  if (data.skills.length < 5) {
    suggestions.push({
      category: 'Skills',
      priority: 'medium',
      suggestion: 'Add more technical skills relevant to the target position',
      impact: 'Better alignment with job requirements'
    });
  }

  return suggestions;
}

/**
 * Generate competitive analysis insights
 */
function generateCompetitiveAnalysis(atsAnalysis: ATSAnalysis) {
  const score = atsAnalysis.score;
  
  let competitiveLevel = 'Needs Improvement';
  let benchmarkMessage = 'Your resume needs significant optimization to compete effectively.';
  
  if (score >= 90) {
    competitiveLevel = 'Excellent';
    benchmarkMessage = 'Your resume is highly competitive and likely to pass ATS screening.';
  } else if (score >= 80) {
    competitiveLevel = 'Good';
    benchmarkMessage = 'Your resume is competitive with minor improvements needed.';
  } else if (score >= 70) {
    competitiveLevel = 'Fair';
    benchmarkMessage = 'Your resume has potential but needs optimization for better results.';
  }

  return {
    competitiveLevel,
    benchmarkMessage,
    marketPosition: `Top ${Math.max(5, Math.min(95, 100 - score))}% of candidates`,
    recommendations: score < 80 ? [
      'Focus on keyword optimization',
      'Strengthen experience descriptions',
      'Improve skills alignment'
    ] : [
      'Minor keyword refinements',
      'Polish formatting consistency'
    ]
  };
}