/**
 * Groq AI Service - Resume generation
 */

import Groq from 'groq-sdk';
import { config } from '@/config';
import type { ResumeData, GeneratedResume } from '@/types';

const groq = new Groq({ apiKey: config.ai.apiKey });

export async function generateResumeContent(resumeData: ResumeData): Promise<GeneratedResume> {
  if (!config.ai.apiKey) throw new Error('GROQ_API_KEY is not configured');

  const modelsToTry = ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'gemma2-9b-it', 'mixtral-8x7b-32768'];
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const prompt = createResumePrompt(resumeData);
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: `You are an expert resume writer and ATS optimization specialist. Create comprehensive, ATS-optimized resume content with clear section headers. Focus on achieving 95+ ATS score through strategic keyword usage, quantified achievements, and proper formatting. Structure your response with clear sections for Professional Summary, Skills, and enhanced Experience descriptions.` },
          { role: 'user', content: prompt }
        ],
        model,
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Failed to generate resume content');

      const atsScore = calculateBasicATSScore(resumeData, content);
      return { content, atsScore };
    } catch (error: unknown) {
      lastError = error;
      const msg = (error as Error)?.message || '';
      if (msg.includes('decommissioned') || msg.includes('model')) continue;
      throw error;
    }
  }
  throw new Error('Failed to generate resume content. All models unavailable.');
}

function createResumePrompt(data: ResumeData): string {
  return `
You are an elite resume strategist and former Google recruiter with 30+ years of experience. Your goal is to transform the user's raw input into a top 1% resume that triggers Applicant Tracking System (ATS) algorithms and captivates hiring managers.

Input Processing Instructions:
- Analyze the candidate's career trajectory, identifying the "narrative arc"
- Extract industry-specific keywords from the target role with high weight
- Identify transferable skills if the candidate is pivoting careers
- Discard irrelevant duties; focus purely on *impact* and *outcomes*

Content Generation Standards (The "Premium" Standard):

1. Professional Summary (The "Hook"):
   - No fluff. No "hard-working individual looking for opportunities."
   - Formula: [Adjective] [Current Role] with [Years] years of experience in [Core Skill 1] and [Core Skill 2]. Proven track record of [Major Achievement]. Expert in [Niche Domain].
   - Must include 3-4 hard keywords from the job description.

2. Experience Section (The "Proof"):
   - Use the Google X-Y-Z Formula: "Accomplished [X] as measured by [Y], by doing [Z]"
   - Every bullet point MUST start with a strong power verb (e.g., Architected, Spearheaded, Engineered, NOT "Helped" or "Worked on").
   - QUANTIFY everything. If exact numbers are missing, estimate reasonable ranges (e.g., "managed team of 5+", "reduced latency by ~20%").
   - Remove all periods at the end of bullet points to maintain modern style.
   - Max 5 bullet points per role.

3. Skills Section:
   - Group into logical categories (Languages, Frameworks, Tools, Soft Skills).
   - Only list skills relevant to the target role.

Formatting Rules:
- Use clean, professional unicode characters for bullets if needed (•).
- Ensure dates are strictly MM/YYYY or YYYY.
- No first-person pronouns (I, me, my) in the experience section.

Humanization & Tone:
- Tone: Confident, Professional, Results-Oriented, yet Authentic.
- Avoid robotic repetition of the same verbs.
- Eliminate buzzwords like "synergy", "rockstar", "ninja".

Critical ATS Requirements:
- Ensure the output is strictly text-based and parseable.
- Maintain standard section headers (Experience, Education, Skills).

PROVIDE THE RESPONSE IN MARKDOWN FORMAT with clear "## Section" headers.

Candidate Data:
${JSON.stringify(data, null, 2)}
`;
}

function calculateBasicATSScore(data: ResumeData, content: string): number {
  const jobKeywords = extractKeywords((data.jobDescription || '').toLowerCase());
  const resumeKeywords = extractKeywords(content.toLowerCase());
  const matched = jobKeywords.filter(k => resumeKeywords.some(r => r.includes(k) || k.includes(r)));
  return Math.min(95, Math.max(0, jobKeywords.length ? Math.round((matched.length / jobKeywords.length) * 100) : 0));
}

function extractKeywords(text: string): string[] {
  const common = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','must','can']);
  return [...new Set(text.replace(/[^\w\s]/g,' ').split(/\s+/).filter(w=>w.length>2&&!common.has(w)&&!/^\d+$/.test(w)))];
}

export async function optimizeResumeForATS(resumeData: ResumeData, missingKeywords: string[]): Promise<string> {
  if (!config.ai.apiKey) throw new Error('GROQ_API_KEY is not configured');

  const prompt = `Optimize this resume to naturally include these ATS keywords: ${missingKeywords.join(', ')}\n\nResume:\n${JSON.stringify(resumeData, null, 2)}\n\nReturn optimized content as clean text.`;

  const modelsToTry = ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'gemma2-9b-it', 'mixtral-8x7b-32768'];
  for (const model of modelsToTry) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an ATS optimization expert. Include missing keywords naturally.' },
          { role: 'user', content: prompt }
        ],
        model,
        max_tokens: config.ai.maxTokens,
        temperature: 0.5,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error: unknown) {
      const msg = (error as Error)?.message || '';
      if (msg.includes('decommissioned') || msg.includes('model')) continue;
      throw error;
    }
  }
  throw new Error('Failed to optimize resume.');
}
