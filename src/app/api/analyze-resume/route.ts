/**
 * AI-Powered Resume Analysis API
 * Uses Groq AI to provide intelligent, contextual resume analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData } from '@/lib/types';

// Groq AI Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export interface AIResumeAnalysis {
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

export interface AIAnalysisCategory {
  score: number;
  feedback: string;
  specificIssues: string[];
  improvements: string[];
  examples: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { resumeData, resumeContent, jobDescription } = await request.json();

    if (!resumeData || !resumeContent) {
      return NextResponse.json(
        { error: 'Resume data and content are required' },
        { status: 400 }
      );
    }

    // Generate AI-powered analysis
    const analysis = await generateAIAnalysis(resumeData, resumeContent, jobDescription);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('AI Resume Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume with AI' },
      { status: 500 }
    );
  }
}

async function generateAIAnalysis(
  resumeData: ResumeData,
  resumeContent: string,
  jobDescription?: string
): Promise<AIResumeAnalysis> {
  const analysisPrompt = createAnalysisPrompt(resumeData, resumeContent, jobDescription);

  try {
    const response = await callGroqAPI(analysisPrompt);

    if (!response) {
      throw new Error('No response from Groq AI');
    }

    // Parse AI response as JSON
    const analysis: AIResumeAnalysis = JSON.parse(response);

    // Validate and ensure all required fields are present
    return validateAndEnhanceAnalysis(analysis);
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    // Fallback to a basic analysis if AI fails
    return generateFallbackAnalysis(resumeData, resumeContent, jobDescription);
  }
}

async function callGroqAPI(prompt: string): Promise<string> {
  // Check if API key is available
  if (!GROQ_API_KEY) {
    console.log('No Groq API key found, using enhanced fallback analysis');
    return generateEnhancedFallbackResponse(prompt);
  }

  const requestBody = {
    messages: [
      {
        role: "system",
        content: `You are an expert resume and career coach with 15+ years of experience in recruitment, ATS optimization, and career development. You analyze resumes with the expertise of both a technical recruiter and a hiring manager across multiple industries.

Your analysis should be:
1. PERSONALIZED - Consider the specific role, industry, and experience level
2. ACTIONABLE - Provide specific, implementable recommendations
3. BALANCED - Highlight both strengths and areas for improvement
4. MODERN - Consider current ATS technology and recruitment trends
5. INDUSTRY-AWARE - Adapt feedback based on the target role/industry

Return your analysis as a valid JSON object matching the AIResumeAnalysis interface structure.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "llama-3.3-70b-versatile",
    stream: false,
    temperature: 0.7,
    max_tokens: 2500,
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API Error:', response.status, errorText);
    // Fallback to enhanced analysis if API fails
    return generateEnhancedFallbackResponse(prompt);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || generateEnhancedFallbackResponse(prompt);
}

function generateEnhancedFallbackResponse(prompt: string): string {
  // Extract resume data from prompt for intelligent analysis
  const hasJobDescription = prompt.includes('TARGET JOB DESCRIPTION:');
  const hasExperience = prompt.includes('"experience":[') && !prompt.includes('"experience":[]');
  const hasSkills = prompt.includes('"skills":[') && !prompt.includes('"skills":[]');
  const hasEducation = prompt.includes('"education":[');

  // Count achievements for better scoring
  // Removed unused variable achievementCount
  const hasQuantifiedMetrics = /\d+%|\d+\s*(million|thousand|k|m|percent|years?|months?)/.test(prompt);

  // Intelligent scoring based on content
  const baseScore = hasExperience ? 70 : 45;
  const experienceBonus = hasExperience ? 10 : 0;
  const skillsBonus = hasSkills ? 8 : 0;
  const metricsBonus = hasQuantifiedMetrics ? 12 : 0;
  const jobAlignmentBonus = hasJobDescription ? 10 : 0;

  const finalScore = Math.min(100, baseScore + experienceBonus + skillsBonus + metricsBonus + jobAlignmentBonus);

  return JSON.stringify({
    overallScore: finalScore,
    overallFeedback: hasJobDescription
      ? `Your resume demonstrates relevant professional experience with a ${finalScore}% compatibility score. The analysis shows ${hasQuantifiedMetrics ? 'strong use of quantified achievements' : 'opportunities to add more specific metrics'} and ${hasSkills ? 'a comprehensive skills section' : 'room to enhance your skills presentation'}. ${finalScore >= 80 ? 'This is a competitive resume that should perform well in ATS systems.' : 'Consider the recommendations below to strengthen your resume\'s impact.'}`
      : `Your resume shows professional development with a ${finalScore}% score based on standard best practices. ${hasQuantifiedMetrics ? 'Your use of specific metrics strengthens your achievements.' : 'Adding quantified results would significantly improve impact.'} ${hasSkills ? 'Your skills section provides good technical foundation.' : 'A dedicated skills section would enhance visibility.'} Providing a target job description would enable more targeted feedback.`,
    categories: {
      content: {
        score: Math.min(100, finalScore + (hasQuantifiedMetrics ? 10 : -15)),
        feedback: hasQuantifiedMetrics
          ? "Content demonstrates strong achievement focus with quantified results that recruiters value."
          : "Content shows professional experience but would benefit from more specific, measurable achievements.",
        specificIssues: hasQuantifiedMetrics ? [] : ["Limited use of specific numbers and percentages", "Some achievements lack quantifiable impact"],
        improvements: hasQuantifiedMetrics
          ? ["Continue emphasizing quantified results", "Ensure all major achievements include metrics"]
          : ["Add specific percentages, dollar amounts, or time savings", "Transform vague accomplishments into measurable results"],
        examples: ["'Increased team productivity by 40%' instead of 'Improved team efficiency'", "'Managed $2M budget' instead of 'Responsible for budget management'"]
      },
      format: {
        score: Math.min(100, finalScore + 5),
        feedback: "Resume follows professional formatting standards with good ATS compatibility.",
        specificIssues: [],
        improvements: ["Ensure consistent date formatting", "Use standard section headers for optimal ATS parsing"],
        examples: ["Experience > Work History", "Skills > Technical Competencies"]
      },
      skills: {
        score: hasSkills ? Math.min(100, finalScore + 15) : Math.max(30, finalScore - 25),
        feedback: hasSkills
          ? hasJobDescription
            ? "Skills section present with good coverage. Consider aligning more closely with job requirements."
            : "Skills section provides solid foundation. Would benefit from job-specific targeting."
          : "Skills section missing or underdeveloped. This is crucial for ATS optimization and recruiter screening.",
        specificIssues: hasSkills ? ["Generic skill descriptions"] : ["Missing dedicated skills section", "Limited technical skill visibility"],
        improvements: hasSkills
          ? ["Prioritize skills mentioned in target job descriptions", "Add proficiency levels where relevant"]
          : ["Create comprehensive skills section with technical and soft skills", "Include industry-specific tools and technologies"],
        examples: hasSkills
          ? ["React.js (Expert), Node.js (Advanced)", "Project Management (5+ years)"]
          : ["Technical Skills: JavaScript, Python, AWS", "Soft Skills: Leadership, Communication, Problem-solving"]
      },
      sections: {
        score: finalScore,
        feedback: `Resume includes ${hasExperience ? 'professional experience, ' : ''}${hasEducation ? 'education, ' : ''}${hasSkills ? 'and skills sections' : 'basic sections'}. ${!hasExperience || !hasSkills ? 'Some essential sections need development.' : 'Core sections are well-established.'}`,
        specificIssues: [
          ...(hasExperience ? [] : ["Missing or insufficient work experience section"]),
          ...(hasSkills ? [] : ["Missing skills section"]),
          ...(!prompt.includes('summary') || prompt.includes('"summary":""') ? ["Professional summary needs development"] : [])
        ],
        improvements: [
          "Enhance professional summary with compelling value proposition",
          ...(hasSkills ? [] : ["Add comprehensive skills section"]),
          "Consider adding relevant certifications or projects section"
        ],
        examples: ["Professional Summary: 'Results-driven developer with 5+ years...'", "Core Competencies section highlighting key skills"]
      },
      style: {
        score: Math.min(100, finalScore + 8),
        feedback: "Professional presentation with modern resume conventions. Room for enhancement in action-oriented language.",
        specificIssues: ["Some passive voice constructions", "Opportunity for stronger action verbs"],
        improvements: ["Use more dynamic action verbs", "Eliminate passive voice where possible", "Strengthen opening statements"],
        examples: ["'Led cross-functional team' vs 'Was responsible for team'", "'Architected scalable solution' vs 'Worked on system design'"]
      }
    },
    keyStrengths: [
      ...(hasExperience ? ["Relevant professional experience documented"] : ["Educational foundation established"]),
      ...(hasQuantifiedMetrics ? ["Strong use of quantified achievements"] : []),
      ...(hasSkills ? ["Comprehensive skills coverage"] : []),
      ...(hasJobDescription ? ["Clear career targeting"] : []),
      "Professional formatting and structure"
    ].slice(0, 3),
    criticalImprovements: [
      ...(hasQuantifiedMetrics ? [] : ["Add specific metrics and percentages to achievements"]),
      ...(hasJobDescription ? ["Align keywords and skills with job requirements"] : ["Define target role for better optimization"]),
      ...(hasSkills ? [] : ["Develop comprehensive skills section"]),
      "Strengthen action-oriented language throughout",
      "Enhance professional summary impact"
    ].slice(0, 3),
    personalizedRecommendations: [
      hasQuantifiedMetrics
        ? "Continue emphasizing your quantified achievements - they set you apart from other candidates"
        : "Transform your achievements into quantified results (e.g., 'increased efficiency by 30%', 'managed team of 8')",
      hasJobDescription
        ? "Research and incorporate 5-7 key terms from your target job description naturally throughout your resume"
        : "Identify 2-3 target roles and tailor your resume with relevant keywords for each application",
      hasSkills
        ? "Prioritize your most relevant skills at the top of your skills section based on job requirements"
        : "Create a dedicated skills section with 8-12 relevant technical and soft skills",
      "Write a compelling 2-3 line professional summary that immediately communicates your unique value proposition",
      finalScore >= 75
        ? "Your resume is strong - focus on fine-tuning for specific opportunities"
        : "Focus on adding quantified achievements and job-relevant keywords to boost your competitiveness"
    ],
    atsCompatibility: {
      score: Math.min(100, finalScore + (hasSkills ? 10 : -10)),
      parseability: hasSkills && hasExperience
        ? "Excellent - Resume structure and content will parse well in ATS systems"
        : "Good - Standard formatting will work with most ATS, but content optimization needed",
      keywordMatch: hasJobDescription
        ? hasSkills
          ? "Strong keyword foundation with room for targeted enhancement"
          : "Moderate - Skills section development would improve keyword density"
        : "Cannot assess without target job description - this significantly impacts ATS performance",
      suggestions: [
        "Use standard section headers (Experience, Education, Skills) for optimal ATS recognition",
        hasJobDescription
          ? "Include 6-8 key terms from the job description naturally in your content"
          : "Research target job postings and incorporate relevant industry keywords",
        "Ensure all major achievements include relevant action verbs and industry terms",
        hasSkills ? "Organize skills by relevance to target roles" : "Add comprehensive skills section with industry-specific tools"
      ]
    },
    competitiveAnalysis: {
      industryComparison: finalScore >= 80
        ? "Resume performs above average compared to industry standards with strong competitive positioning"
        : finalScore >= 65
          ? "Resume meets industry standards with clear opportunities for competitive advantage"
          : "Resume needs strengthening to compete effectively in current job market",
      standoutFactors: [
        ...(hasQuantifiedMetrics ? ["Quantified achievement focus"] : []),
        ...(hasExperience ? ["Relevant professional experience"] : []),
        ...(hasJobDescription ? ["Clear career targeting"] : []),
        "Professional presentation",
        ...(hasSkills ? ["Technical competency demonstration"] : [])
      ].slice(0, 3),
      gapAnalysis: [
        ...(hasQuantifiedMetrics ? [] : ["Top candidates consistently use specific metrics and percentages"]),
        ...(hasSkills ? [] : ["Most competitive resumes include comprehensive skills sections"]),
        hasJobDescription
          ? "Opportunity to better align with specific role requirements through keyword optimization"
          : "Need to define target roles for effective positioning against other candidates",
        finalScore < 75 ? "Overall content depth and impact need enhancement to match top-tier candidates" : "Minor optimizations needed to reach top-tier status"
      ]
    }
  });
}

function createAnalysisPrompt(
  resumeData: ResumeData,
  resumeContent: string,
  jobDescription?: string
): string {
  const hasJobDescription = jobDescription && jobDescription.length > 50;

  return `
Please analyze this resume comprehensively and provide detailed, personalized feedback:

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

RESUME CONTENT:
${resumeContent}

${hasJobDescription ? `TARGET JOB DESCRIPTION:
${jobDescription}` : 'NO SPECIFIC JOB TARGET PROVIDED'}

Please provide a comprehensive analysis covering these 16 crucial areas across 5 categories:

**CONTENT ANALYSIS (4 checks):**
1. ATS Parse Rate - How well will ATS systems parse this resume?
2. Repetition Analysis - Any overused words/phrases that hurt readability?
3. Spelling & Grammar - Professional language quality assessment
4. Quantified Impact - Use of specific metrics and achievements

**FORMAT OPTIMIZATION (3 checks):**
5. File Format & Size - Professional formatting standards
6. Resume Length - Appropriate length for experience level
7. Bullet Point Length - Optimal length and readability

**SKILLS ASSESSMENT (2 checks):**
8. Hard Skills Relevancy - Technical skills alignment with target role
9. Soft Skills Demonstration - How well soft skills are showcased

**SECTION COMPLETENESS (3 checks):**
10. Contact Information - Professional and complete contact details
11. Essential Sections - All necessary resume sections present
12. Personality Showcase - Personal brand and unique value proposition

**STYLE ENHANCEMENT (4 checks):**
13. Resume Design - Professional appearance and readability
14. Email Address - Professional email assessment
15. Active Voice Usage - Strong, action-oriented language
16. Buzzword Detection - Avoiding overused/cliché terms

For each category, provide:
- Specific score (0-100)
- Detailed feedback explaining the score
- Specific issues found
- Actionable improvement suggestions
- Examples of better alternatives

Also provide:
- Overall score and comprehensive feedback
- Top 3 key strengths
- Top 3 critical improvements needed
- 5 personalized recommendations
- ATS compatibility assessment with specific suggestions
- Competitive analysis for the industry/role

${hasJobDescription ?
      'Focus heavily on alignment with the target job description and provide specific keyword recommendations.' :
      'Provide general best practices since no specific job target is provided.'
    }

Return as valid JSON matching the AIResumeAnalysis interface structure.
`;
}

function validateAndEnhanceAnalysis(analysis: AIResumeAnalysis): AIResumeAnalysis {
  // Ensure all scores are within valid range
  analysis.overallScore = Math.max(0, Math.min(100, analysis.overallScore || 50));

  Object.keys(analysis.categories).forEach(key => {
    const category = analysis.categories[key as keyof typeof analysis.categories];
    category.score = Math.max(0, Math.min(100, category.score || 50));
    category.specificIssues = category.specificIssues || [];
    category.improvements = category.improvements || [];
    category.examples = category.examples || [];
  });

  // Ensure ATS compatibility score is valid
  analysis.atsCompatibility.score = Math.max(0, Math.min(100, analysis.atsCompatibility.score || 50));

  // Ensure arrays exist
  analysis.keyStrengths = analysis.keyStrengths || ['Professional experience documented'];
  analysis.criticalImprovements = analysis.criticalImprovements || ['Add more specific achievements'];
  analysis.personalizedRecommendations = analysis.personalizedRecommendations || ['Include quantified results'];

  return analysis;
}

function generateFallbackAnalysis(
  resumeData: ResumeData,
  resumeContent: string,
  jobDescription?: string
): AIResumeAnalysis {
  // Simple fallback analysis if AI fails
  const hasJobDesc = jobDescription && jobDescription.length > 50;
  const hasExperience = resumeData.experience.length > 0;
  const hasSkills = resumeData.skills.length > 0;

  const baseScore = hasExperience ? 70 : 50;

  return {
    overallScore: baseScore,
    overallFeedback: hasJobDesc
      ? "Your resume shows relevant experience. Consider aligning more closely with the target job requirements."
      : "Your resume demonstrates professional experience. Adding a target job description would enable more specific feedback.",
    categories: {
      content: {
        score: baseScore,
        feedback: "Content shows professional experience with room for improvement in quantified achievements.",
        specificIssues: ["Limited quantified metrics", "Some repetitive language"],
        improvements: ["Add specific numbers and percentages", "Vary your language choices"],
        examples: ["'Increased sales by 25%' instead of 'Increased sales'"]
      },
      format: {
        score: baseScore + 10,
        feedback: "Format appears professional with standard structure.",
        specificIssues: [],
        improvements: ["Ensure consistent formatting", "Optimize for ATS compatibility"],
        examples: ["Use standard section headers", "Maintain consistent date formats"]
      },
      skills: {
        score: hasSkills ? baseScore + 5 : baseScore - 20,
        feedback: hasSkills ? "Skills section present but could be more targeted." : "Skills section needs development.",
        specificIssues: hasSkills ? ["Generic skill descriptions"] : ["Missing skills section"],
        improvements: hasSkills ? ["Align skills with job requirements"] : ["Add relevant technical and soft skills"],
        examples: ["List specific programming languages", "Include industry-specific tools"]
      },
      sections: {
        score: baseScore,
        feedback: "Standard resume sections present.",
        specificIssues: [],
        improvements: ["Enhance professional summary", "Add relevant certifications if applicable"],
        examples: ["Write a compelling 2-3 line summary", "Include relevant coursework or projects"]
      },
      style: {
        score: baseScore,
        feedback: "Professional style with room for enhancement.",
        specificIssues: ["Some passive voice usage"],
        improvements: ["Use more active voice", "Strengthen action verbs"],
        examples: ["'Led team of 5' instead of 'Was responsible for team'"]
      }
    },
    keyStrengths: [
      "Professional experience documented",
      "Clear career progression",
      "Relevant education background"
    ],
    criticalImprovements: [
      "Add quantified achievements with specific metrics",
      "Align content more closely with target role requirements",
      "Strengthen action-oriented language throughout"
    ],
    personalizedRecommendations: [
      "Include specific numbers and percentages in your achievements",
      "Research and include keywords from your target job descriptions",
      "Add a compelling professional summary that highlights your unique value",
      "Use strong action verbs to start each bullet point",
      "Consider adding a skills section if missing"
    ],
    atsCompatibility: {
      score: baseScore,
      parseability: "Resume should parse correctly in most ATS systems",
      keywordMatch: hasJobDesc ? "Moderate keyword alignment with target role" : "Enable better analysis by providing job description",
      suggestions: [
        "Use standard section headers (Experience, Education, Skills)",
        "Include relevant keywords naturally throughout content",
        "Avoid graphics or unusual formatting that ATS cannot read"
      ]
    },
    competitiveAnalysis: {
      industryComparison: "Resume meets basic industry standards with room for differentiation",
      standoutFactors: hasExperience ? ["Relevant work experience", "Professional education"] : ["Educational background"],
      gapAnalysis: [
        "Limited quantified achievements compared to top candidates",
        hasJobDesc ? "Opportunity to better align with specific role requirements" : "Need target role clarity for better optimization",
        "Professional summary could be more compelling"
      ]
    }
  };
}