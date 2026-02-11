/**
 * ATS (Applicant Tracking System) Analysis Service
 */

import type { ATSAnalysis, ResumeData } from '@/types';
import { config } from '@/config';

export function analyzeATSCompatibility(
  resumeContent: string,
  jobDescription: string,
  resumeData: ResumeData
): ATSAnalysis {
  const fullResumeContent = buildFullResumeContent(resumeContent, resumeData);

  const jobKeywords = extractKeywordsWithCategories(jobDescription.toLowerCase());
  const resumeKeywords = extractKeywordsWithCategories(fullResumeContent.toLowerCase());

  const technicalMatches = findMatches(jobKeywords.technical, resumeKeywords.technical);
  const softMatches = findMatches(jobKeywords.soft, resumeKeywords.soft);
  const industryMatches = findMatches(jobKeywords.industry, resumeKeywords.industry);

  const baseScore = calculateBaseScore(technicalMatches, softMatches, industryMatches, jobKeywords);
  const bonusScore = calculateBonusScore(resumeData, fullResumeContent);
  const finalScore = Math.min(100, Math.max(0, baseScore + bonusScore));

  const recommendations = generateRecommendations(finalScore, {
    technical: technicalMatches,
    soft: softMatches,
    industry: industryMatches
  });

  return {
    score: finalScore,
    matchedKeywords: [
      ...technicalMatches.matched,
      ...softMatches.matched,
      ...industryMatches.matched
    ],
    missingKeywords: [
      ...technicalMatches.missing,
      ...softMatches.missing,
      ...industryMatches.missing
    ],
    recommendations,
    categories: {
      technical: technicalMatches,
      soft: softMatches,
      industry: industryMatches
    }
  };
}

function buildFullResumeContent(resumeContent: string, resumeData: ResumeData): string {
  const parts = [resumeContent];

  resumeData.experience?.forEach(exp => {
    parts.push(exp.position, exp.company, exp.description);
    parts.push(...exp.achievements);
  });

  resumeData.education?.forEach(edu => {
    parts.push(edu.degree, edu.field, edu.institution);
  });

  resumeData.skills?.forEach(skill => {
    parts.push(skill.name);
  });

  if (resumeData.personalInfo) {
    parts.push(resumeData.personalInfo.summary || '');
  }

  return parts.filter(part => part && part.length > 0).join(' ');
}

function calculateBaseScore(
  technicalMatches: { matched: string[]; missing: string[] },
  softMatches: { matched: string[]; missing: string[] },
  industryMatches: { matched: string[]; missing: string[] },
  jobKeywords: { technical: string[]; soft: string[]; industry: string[] }
): number {
  const technicalWeight = 0.5;
  const industryWeight = 0.3;
  const softWeight = 0.2;

  const technicalScore = jobKeywords.technical.length > 0
    ? (technicalMatches.matched.length / jobKeywords.technical.length) * 100
    : 100;

  const industryScore = jobKeywords.industry.length > 0
    ? (industryMatches.matched.length / jobKeywords.industry.length) * 100
    : 100;

  const softScore = jobKeywords.soft.length > 0
    ? (softMatches.matched.length / jobKeywords.soft.length) * 100
    : 100;

  return Math.round(
    (technicalScore * technicalWeight) +
    (industryScore * industryWeight) +
    (softScore * softWeight)
  );
}

function calculateBonusScore(resumeData: ResumeData, fullContent: string): number {
  let bonus = 0;

  const quantifiedPattern = /\d+%|\d+\s*(million|thousand|k|m|percent|years?|months?)/gi;
  const quantifiedMatches = fullContent.match(quantifiedPattern) || [];
  bonus += Math.min(10, quantifiedMatches.length * 2);

  const actionVerbs = ['developed', 'implemented', 'optimized', 'led', 'managed', 'created', 'improved', 'increased', 'achieved', 'delivered'];
  const actionVerbMatches = actionVerbs.filter(verb =>
    fullContent.toLowerCase().includes(verb)
  ).length;
  bonus += Math.min(10, actionVerbMatches);

  if (resumeData.experience?.length) bonus += Math.min(5, resumeData.experience.length * 2);
  if (resumeData.skills?.length && resumeData.skills.length >= 8) bonus += 5;
  if (resumeData.education?.length) bonus += 3;

  return bonus;
}

function extractKeywordsWithCategories(text: string) {
  const allKeywords = extractKeywords(text);

  const technicalPatterns = [
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala',
    'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'spring', 'laravel', 'next.js', 'nestjs', 'svelte', 'fastapi',
    'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'dynamodb', 'cassandra', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd', 'terraform', 'ansible', 'circleci', 'github actions',
    'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum', 'jira', 'github', 'gitlab', 'webpack', 'vite', 'redux',
    'artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'llm', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
  ];

  const softSkillPatterns = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative',
    'project management', 'time management', 'adaptability', 'collaboration', 'mentoring',
    'presentation', 'negotiation', 'strategic thinking', 'decision making', 'innovation',
    'emotional intelligence', 'conflict resolution', 'critical thinking', 'stakeholder management',
    'cross-functional', 'remote work', 'self-starter', 'detail-oriented', 'interpersonal skills'
  ];

  const technical = allKeywords.filter(keyword =>
    technicalPatterns.some(pattern => {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return keyword.includes(pattern) || pattern.includes(keyword) ||
        keyword.match(new RegExp(`\\b${escapedPattern}\\b`, 'i'));
    })
  );

  const soft = allKeywords.filter(keyword =>
    softSkillPatterns.some(pattern => {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return keyword.includes(pattern) || pattern.includes(keyword) ||
        keyword.match(new RegExp(`\\b${escapedPattern}\\b`, 'i'));
    })
  );

  const industry = allKeywords.filter(keyword =>
    !technical.includes(keyword) && !soft.includes(keyword) && keyword.length > 3
  );

  return { technical, soft, industry };
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'you', 'your', 'our', 'we', 'us', 'they', 'them', 'their', 'his', 'her', 'its', 'my', 'me',
    'work', 'working', 'experience', 'years', 'year', 'job', 'role', 'position', 'company', 'team'
  ]);

  const words = text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word.toLowerCase()))
    .map(word => word.toLowerCase());

  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
    const threeWordPhrase = words[i + 2] ? `${words[i]} ${words[i + 1]} ${words[i + 2]}` : null;
    if (twoWordPhrase.length > 6) phrases.push(twoWordPhrase);
    if (threeWordPhrase && threeWordPhrase.length > 10) phrases.push(threeWordPhrase);
  }

  return [...new Set([...words, ...phrases])];
}

function findMatches(jobKeywords: string[], resumeKeywords: string[]) {
  const matched: string[] = [];
  const missing: string[] = [];

  jobKeywords.forEach(jobKeyword => {
    const isMatched = resumeKeywords.some(resumeKeyword =>
      resumeKeyword.includes(jobKeyword) ||
      jobKeyword.includes(resumeKeyword) ||
      calculateSimilarity(jobKeyword, resumeKeyword) > 0.8
    );
    if (isMatched) matched.push(jobKeyword);
    else missing.push(jobKeyword);
  });

  return { matched, missing };
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }
  return matrix[str2.length][str1.length];
}

function generateRecommendations(
  score: number,
  categories: { technical: { missing: string[] }; soft: { missing: string[] }; industry: { missing: string[] } }
): string[] {
  const recommendations: string[] = [];

  if (score < config.ats.minKeywordMatch) {
    recommendations.push(`Your ATS score is ${score}%. Aim for ${config.ats.minKeywordMatch}% or higher.`);
  }

  if (categories.technical.missing.length > 0) {
    recommendations.push(`Add technical skills: ${categories.technical.missing.slice(0, 5).join(', ')}`);
  }
  if (categories.soft.missing.length > 0) {
    recommendations.push(`Include soft skills: ${categories.soft.missing.slice(0, 3).join(', ')}`);
  }
  if (categories.industry.missing.length > 0) {
    recommendations.push(`Incorporate industry terms: ${categories.industry.missing.slice(0, 3).join(', ')}`);
  }

  if (score >= 80) {
    recommendations.push('Excellent keyword match! Your resume should perform well in ATS systems.');
  } else if (score >= 60) {
    recommendations.push('Good keyword coverage. Consider adding a few more relevant terms.');
  } else {
    recommendations.push('Low keyword match. Review the job description and incorporate more relevant terms.');
  }

  return recommendations;
}

export function getATSScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getATSScoreStatus(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}
