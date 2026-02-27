/**
 * Resume Content Parser
 * Parses and cleans AI-generated resume content for better display
 */

import type { ResumeData } from './types';

export interface ParsedResumeContent {
  summary: string;
  experience: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
    achievements: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    other: string[];
  };
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    duration: string;
    gpa?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

/**
 * Parse AI-generated resume content into structured sections
 */
export function parseResumeContent(content: string): ParsedResumeContent {
  const sections = splitIntoSections(content);

  return {
    summary: extractSummary(sections),
    experience: extractExperience(sections),
    skills: extractSkills(sections),
    education: extractEducation(sections),
    projects: extractProjects(sections)
  };
}

/**
 * Enhanced function to distribute AI content across resume sections
 */
export function distributeAIContent(aiContent: string, originalData: any): any {
  console.log('=== AI CONTENT DISTRIBUTION START ===');
  console.log('📥 Original AI Content:', aiContent);
  console.log('📦 Original Resume Data:', JSON.stringify(originalData, null, 2));

  const sections = splitIntoSections(aiContent);
  console.log('🔍 Parsed Sections:', Object.keys(sections));
  console.log('📋 Section Details:', sections);

  const updatedData = JSON.parse(JSON.stringify(originalData)); // Deep clone
  console.log('🔄 Starting with cloned data...');

  // Extract and update Professional Summary
  const summary = extractSummary(sections);
  console.log('📝 Extracted Summary:', summary);
  if (summary && summary.length > 20) {
    console.log('✅ Updating summary in personalInfo...');
    updatedData.personalInfo.summary = summary;
  } else {
    console.log('❌ Summary too short or empty, keeping original');
  }

  // Extract and enhance Technical Skills
  const aiSkills = extractSkills(sections);
  console.log('⚡ Extracted Skills:', aiSkills);
  console.log('⚡ Technical Skills Count:', aiSkills.technical.length);
  console.log('⚡ Soft Skills Count:', aiSkills.soft.length);

  if (aiSkills.technical.length > 0 || aiSkills.soft.length > 0) {
    console.log('✅ Processing skills enhancement...');
    // Create skill objects with proper structure
    const enhancedSkills = [
      ...aiSkills.technical.map(skill => ({
        id: Math.random().toString(36).substr(2, 9),
        name: skill
      })),
      ...aiSkills.soft.map(skill => ({
        id: Math.random().toString(36).substr(2, 9),
        name: skill
      }))
    ];

    console.log('🔧 Enhanced Skills Objects:', enhancedSkills);

    // Merge with existing skills, avoiding duplicates
    if (!Array.isArray(updatedData.skills)) {
      updatedData.skills = [];
    }

    const existingSkillNames = new Set(updatedData.skills.map((s: any) => s && s.name ? s.name.toLowerCase() : ''));
    console.log('📋 Existing Skill Names:', Array.from(existingSkillNames));

    const newSkills = enhancedSkills.filter(skill =>
      skill && skill.name && !existingSkillNames.has(skill.name.toLowerCase())
    );

    console.log('🆕 New skills to add:', newSkills);
    console.log('📊 Original skills count:', updatedData.skills.length);
    updatedData.skills = [...updatedData.skills, ...newSkills];
    console.log('📊 Final skills count:', updatedData.skills.length);
  } else {
    console.log('❌ No skills extracted from AI content');
  }

  // Enhance existing experience with AI insights
  const aiExperience = extractExperience(sections);
  console.log('💼 Extracted Experience:', aiExperience);
  console.log('💼 AI Experience Count:', aiExperience.length);

  if (!Array.isArray(updatedData.experience)) {
    updatedData.experience = [];
  }

  console.log('💼 Original Experience Count:', updatedData.experience.length);

  if (aiExperience.length > 0 && updatedData.experience.length > 0) {
    console.log('✅ Processing experience enhancement...');
    // Try to match and enhance existing experience entries
    for (let i = 0; i < Math.min(updatedData.experience.length, aiExperience.length); i++) {
      const original = updatedData.experience[i];
      const enhanced = aiExperience[i];

      if (!original || !enhanced) continue;

      console.log(`🔄 Enhancing experience ${i}:`);

      // Replace achievements with AI-generated ones if they're more detailed
      if (Array.isArray(enhanced.achievements) && enhanced.achievements.length > 0) {
        console.log(`   ✅ Replacing with ${enhanced.achievements.length} enhanced achievements`);
        updatedData.experience[i] = {
          ...original,
          achievements: enhanced.achievements
        };
      }

      // Update description if AI provides a better one
      if (enhanced.description && enhanced.description.length > (original.description || '').length) {
        console.log('   ✅ Updating description with enhanced version');
        updatedData.experience[i].description = enhanced.description;
      }
    }
  }
  else {
    console.log('❌ No experience enhancement possible - AI:', aiExperience.length, 'Original:', updatedData.experience.length);
  }

  console.log('📤 Final Enhanced Data:', JSON.stringify(updatedData, null, 2));
  console.log('=== AI CONTENT DISTRIBUTION END ===');
  return updatedData;
}

/**
 * Clean and format AI content for display
 */
export function cleanAIContent(content: string): string {
  if (!content) return '';

  // Remove markdown headers and extra formatting
  let cleaned = content
    // Remove title sections and separators
    .replace(/\*\*[^*]+Resume\*\*.*?={5,}/g, '')
    .replace(/={3,}/g, '')
    .replace(/\-{3,}/g, '')

    // Clean up contact information section
    .replace(/\*\*Contact Information:\*\*[\s\S]*?(?=\*\*|$)/, '')

    // Clean up notes and metadata
    .replace(/Note:[\s\S]*?(?=\*\*|$)/, '')
    .replace(/\*\*Changes Made:\*\*[\s\S]*$/, '')

    // Clean up formatting
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\* \*\*(.*?)\*\*/g, '• $1') // Convert list items
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .replace(/^\s+|\s+$/g, '') // Trim whitespace

    // Extract just the professional summary if it exists
    .replace(/.*?Professional Summary.*?:.*?\n([\s\S]*?)(?=\n\*\*|$)/, '$1')
    .trim();

  return cleaned;
}

/**
 * Extract professional summary from AI content
 */
export function extractProfessionalSummary(content: string): string {
  if (!content) return '';

  // Look for professional summary section
  const summaryMatch = content.match(/(?:Professional Summary|Summary).*?:.*?\n([\s\S]*?)(?=\n(?:\*\*|[A-Z][^:]*:|$))/);
  if (summaryMatch) {
    return cleanText(summaryMatch[1]);
  }

  // If no explicit summary section, try to extract the first meaningful paragraph
  const lines = content.split('\n').filter(line => line.trim());
  const meaningfulLines = lines.filter(line =>
    !line.includes('=') &&
    !line.includes('*') &&
    !line.includes('Contact') &&
    !line.includes('Resume') &&
    line.length > 50 &&
    !line.includes('Note:') &&
    !line.includes('Changes Made:')
  );

  return meaningfulLines[0] ? cleanText(meaningfulLines[0]) : '';
}

/**
 * Split content into sections
 */
function splitIntoSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionHeaders = [
    'Professional Summary',
    'Summary',
    'Experience',
    'Work Experience',
    'Professional Experience',
    'Enhanced Experience',
    'Education',
    'Skills',
    'Technical Skills',
    'Soft Skills',
    'Projects',
    'Certifications'
  ];

  console.log('🔍 Splitting content into sections...');
  console.log('📄 Raw content length:', content.length);

  let currentSection = '';
  let currentContent = '';

  const lines = content.split('\n');
  console.log('📊 Total lines to process:', lines.length);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check for section headers with **text:** format or ### format
    const matchedHeader = sectionHeaders.find(header => {
      const headerPatterns = [
        `**${header}:**`,
        `**${header}**`,
        `### ${header}`,
        `## ${header}`,
        `# ${header}`,
        header + ':'
      ];

      const isMatch = headerPatterns.some(pattern =>
        trimmedLine.toLowerCase().includes(pattern.toLowerCase()) ||
        trimmedLine.toLowerCase() === header.toLowerCase() + ':'
      );

      if (isMatch) {
        console.log(`✅ Found section header: "${header}" in line ${i}: "${trimmedLine}"`);
      }

      return isMatch;
    });

    if (matchedHeader) {
      // Save previous section
      if (currentSection && currentContent.trim()) {
        sections[currentSection] = currentContent.trim();
        console.log(`💾 Saved section "${currentSection}" with ${currentContent.trim().length} characters`);
      }

      // Start new section
      currentSection = matchedHeader;
      currentContent = '';
      console.log(`🆕 Starting new section: "${currentSection}"`);
    } else if (currentSection) {
      currentContent += line + '\n';
    } else if (trimmedLine.length > 50 && !currentSection) {
      // If no section header found but content exists, treat as summary
      currentSection = 'Professional Summary';
      currentContent = line + '\n';
      console.log(`📝 No section found, treating as Professional Summary: "${trimmedLine.substring(0, 50)}..."`);
    }
  }

  // Save the last section
  if (currentSection && currentContent.trim()) {
    sections[currentSection] = currentContent.trim();
    console.log(`💾 Saved final section "${currentSection}" with ${currentContent.trim().length} characters`);
  }

  console.log('📋 Final sections found:', Object.keys(sections));
  console.log('📊 Section details:');
  Object.entries(sections).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value.length} chars - "${value.substring(0, 100)}..."`);
  });

  return sections;
}

/**
 * Extract summary from sections
 */
function extractSummary(sections: Record<string, string>): string {
  const summaryKeys = ['Professional Summary', 'Summary'];

  for (const key of summaryKeys) {
    if (sections[key]) {
      return cleanText(sections[key]);
    }
  }

  return '';
}

/**
 * Extract experience from sections
 */
function extractExperience(sections: Record<string, string>): ParsedResumeContent['experience'] {
  console.log('💼 Extracting experience from sections...');
  console.log('📋 Available sections:', Object.keys(sections));

  const experienceKeys = ['Experience', 'Work Experience', 'Professional Experience', 'Enhanced Experience'];
  const experience: ParsedResumeContent['experience'] = [];

  for (const key of experienceKeys) {
    if (sections[key]) {
      console.log(`💼 Found experience section: ${key}`);
      const content = sections[key];
      console.log(`📄 Experience content: ${content.substring(0, 300)}...`);

      // Handle the AI format: ### Position at Company (dates)
      const entries = content.split(/###/).filter(entry => entry.trim());

      console.log(`📊 Found ${entries.length} experience entries`);

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        console.log(`🔍 Processing entry ${i}: ${entry.substring(0, 100)}...`);

        const experienceItem = parseExperienceEntry(entry);
        if (experienceItem) {
          console.log(`✅ Parsed experience: ${experienceItem.position} at ${experienceItem.company}`);
          experience.push(experienceItem);
        } else {
          console.log(`❌ Failed to parse entry ${i}`);
        }
      }
    }
  }

  console.log(`💼 Total experience items extracted: ${experience.length}`);
  return experience;
}

/**
 * Enhanced experience entry parser
 */
function parseExperienceEntry(entry: string): ParsedResumeContent['experience'][0] | null {
  const lines = entry.split('\n').filter(line => line.trim());
  if (lines.length === 0) return null;

  console.log(`🔍 Parsing experience entry with ${lines.length} lines`);

  // Look for title line in format: "Fullstack Developer at LSSC (2024-09 - 2025-10)"
  const titleLine = lines.find(line =>
    line.includes(' at ') && (line.includes('(') || line.includes('2024') || line.includes('2025'))
  );

  let position = 'Enhanced Position';
  let company = 'Enhanced Company';
  let duration = '';

  if (titleLine) {
    console.log(`📋 Found title line: ${titleLine}`);

    // Extract position and company from "Position at Company"
    const atMatch = titleLine.match(/(.+?)\s+at\s+(.+?)(?:\s*\(|$)/);
    if (atMatch) {
      position = atMatch[1].trim().replace(/###\s*/, '');
      company = atMatch[2].trim();
    }

    // Extract duration from parentheses
    const durationMatch = titleLine.match(/\(([^)]+)\)/);
    if (durationMatch) {
      duration = durationMatch[1];
    }

    console.log(`👤 Position: ${position}, Company: ${company}, Duration: ${duration}`);
  }

  // Extract achievements from bullet points
  const achievements: string[] = [];
  lines.forEach(line => {
    const trimmed = line.trim();
    // Look for lines starting with * or bullet points
    if (trimmed.startsWith('*') || trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const achievement = trimmed.replace(/^[*•-]\s*\*?\*?/, '').trim();
      if (achievement && achievement.length > 10) {
        achievements.push(achievement);
        console.log(`🏆 Found achievement: ${achievement.substring(0, 60)}...`);
      }
    }
  });

  // Get description from non-bullet content
  const description = lines
    .filter(line => !line.includes(' at ') && !line.startsWith('*') && !line.startsWith('•') && !line.startsWith('-'))
    .join(' ')
    .trim() || 'Enhanced role with improved responsibilities';

  const result = {
    position,
    company,
    duration,
    description,
    achievements
  };

  console.log(`✅ Parsed experience item:`, result);
  return result;
}

/**
 * Extract skills from sections with better categorization
 */
function extractSkills(sections: Record<string, string>): ParsedResumeContent['skills'] {
  console.log('⚡ Extracting skills from sections...');
  console.log('📋 Available sections:', Object.keys(sections));

  const technicalSection = sections['Technical Skills'] || sections['Skills'] || '';
  const softSection = sections['Soft Skills'] || '';

  console.log('🔧 Technical Skills Section:', technicalSection.substring(0, 200));
  console.log('🤝 Soft Skills Section:', softSection.substring(0, 200));

  const skills: { technical: string[]; soft: string[]; other: string[] } = {
    technical: [],
    soft: [],
    other: []
  };

  // Extract technical skills
  if (technicalSection) {
    // Handle comma-separated format: "JavaScript, Node.js, React, Express..."
    const techSkills = technicalSection
      .split(/[,;]/)
      .map(skill => skill.trim())
      .filter(skill => skill && skill.length > 1 && !skill.includes('**') && !skill.includes(':'));

    console.log('🔧 Extracted technical skills:', techSkills);
    skills.technical = techSkills;
  }

  // Extract soft skills
  if (softSection) {
    // Handle comma-separated format: "Problem-solving abilities, Excellent communication..."
    const softSkills = softSection
      .split(/[,;]/)
      .map(skill => skill.trim())
      .filter(skill => skill && skill.length > 1 && !skill.includes('**') && !skill.includes(':'));

    console.log('🤝 Extracted soft skills:', softSkills);
    skills.soft = softSkills;
  }

  // If no specific sections found, try to extract from general skills section
  if (skills.technical.length === 0 && skills.soft.length === 0) {
    console.log('🔍 No specific sections found, checking general content...');

    const allContent = Object.values(sections).join('\n');

    // Look for technical skills patterns
    const techMatches = allContent.match(/(?:Technical Skills?|Programming|Languages?).*?:.*?([^\n*]+)/gi);
    if (techMatches) {
      techMatches.forEach(match => {
        const skillList = match.replace(/.*?:\s*/, '').split(/[,;]/).map(s => s.trim()).filter(s => s);
        skills.technical.push(...skillList);
      });
    }

    // Look for soft skills patterns
    const softMatches = allContent.match(/(?:Soft Skills?).*?:.*?([^\n*]+)/gi);
    if (softMatches) {
      softMatches.forEach(match => {
        const skillList = match.replace(/.*?:\s*/, '').split(/[,;]/).map(s => s.trim()).filter(s => s);
        skills.soft.push(...skillList);
      });
    }
  }

  console.log('⚡ Final extracted skills:');
  console.log('  - Technical:', skills.technical.length, skills.technical);
  console.log('  - Soft:', skills.soft.length, skills.soft);

  return skills;
}

/**
 * Check if skill is technical
 */
function isTechnical(skill: string): boolean {
  const techKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'express', 'sql', 'html', 'css',
    'git', 'docker', 'aws', 'api', 'database', 'framework', 'programming'
  ];

  return techKeywords.some(keyword =>
    skill.toLowerCase().includes(keyword)
  );
}

/**
 * Check if skill is soft skill
 */
function isSoftSkill(skill: string): boolean {
  const softKeywords = [
    'communication', 'leadership', 'teamwork', 'problem solving', 'analytical',
    'management', 'collaboration', 'adaptability', 'creative', 'presentation'
  ];

  return softKeywords.some(keyword =>
    skill.toLowerCase().includes(keyword)
  );
}

/**
 * Extract education from sections
 */
function extractEducation(sections: Record<string, string>): ParsedResumeContent['education'] {
  return [];
}

/**
 * Extract projects from sections
 */
function extractProjects(sections: Record<string, string>): ParsedResumeContent['projects'] {
  return [];
}

/**
 * Clean and format text
 */
function cleanText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/^\*\s*/, '') // Remove leading asterisks
    .replace(/\n\s*\n/g, '\n') // Remove excessive line breaks
    .trim();
}

/**
 * Check if content is AI-generated (has AI formatting)
 */
export function isAIGeneratedContent(content: string): boolean {
  const aiIndicators = [
    'Professional Summary',
    'Technical Skills',
    'Soft Skills',
    'Experience',
    'Enhanced',
    '**',
    '###',
    'Contact Information',
    '===',
    '---',
    'Changes Made:',
    'Note:',
    'ATS-friendly',
    'optimized to match'
  ];

  // If content is longer than 200 chars or has any AI indicators, treat as AI-generated
  return content.length > 200 || aiIndicators.some(indicator => content.includes(indicator));
}