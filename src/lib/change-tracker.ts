/**
 * Change Tracker for Resume AI Enhancements
 * Tracks and highlights differences between original and AI-enhanced content
 */

import type { ResumeData } from './types';

export interface ChangeHighlight {
  type: 'added' | 'modified' | 'removed';
  section: string;
  field: string;
  original: string;
  enhanced: string;
  description: string;
}

export interface ChangesSummary {
  highlights: ChangeHighlight[];
  totalChanges: number;
  sectionsModified: string[];
  changesBySection: Record<string, number>;
}

/**
 * Compare original and enhanced resume data to track changes
 */
export function trackResumeChanges(
  original: ResumeData, 
  enhanced: ResumeData
): ChangesSummary {
  const highlights: ChangeHighlight[] = [];
  const sectionsModified = new Set<string>();
  const changesBySection: Record<string, number> = {};

  // Track Personal Info changes
  const personalChanges = trackPersonalInfoChanges(original.personalInfo, enhanced.personalInfo);
  highlights.push(...personalChanges);
  if (personalChanges.length > 0) {
    sectionsModified.add('Personal Information');
    changesBySection['Personal Information'] = personalChanges.length;
  }

  // Track Experience changes
  const experienceChanges = trackExperienceChanges(original.experience, enhanced.experience);
  highlights.push(...experienceChanges);
  if (experienceChanges.length > 0) {
    sectionsModified.add('Experience');
    changesBySection['Experience'] = experienceChanges.length;
  }

  // Track Skills changes
  const skillsChanges = trackSkillsChanges(original.skills, enhanced.skills);
  highlights.push(...skillsChanges);
  if (skillsChanges.length > 0) {
    sectionsModified.add('Skills');
    changesBySection['Skills'] = skillsChanges.length;
  }

  // Track Education changes
  const educationChanges = trackEducationChanges(original.education, enhanced.education);
  highlights.push(...educationChanges);
  if (educationChanges.length > 0) {
    sectionsModified.add('Education');
    changesBySection['Education'] = educationChanges.length;
  }

  return {
    highlights,
    totalChanges: highlights.length,
    sectionsModified: Array.from(sectionsModified),
    changesBySection
  };
}

/**
 * Track changes in personal information
 */
function trackPersonalInfoChanges(original: any, enhanced: any): ChangeHighlight[] {
  const changes: ChangeHighlight[] = [];

  // Check summary changes
  if (original.summary !== enhanced.summary) {
    changes.push({
      type: enhanced.summary && !original.summary ? 'added' : 'modified',
      section: 'Personal Information',
      field: 'Professional Summary',
      original: original.summary || '',
      enhanced: enhanced.summary || '',
      description: enhanced.summary && !original.summary 
        ? 'AI generated a new professional summary'
        : 'AI enhanced your professional summary'
    });
  }

  return changes;
}

/**
 * Track changes in experience section
 */
function trackExperienceChanges(original: any[], enhanced: any[]): ChangeHighlight[] {
  const changes: ChangeHighlight[] = [];

  // Compare each experience entry
  for (let i = 0; i < Math.max(original.length, enhanced.length); i++) {
    const origExp = original[i];
    const enhExp = enhanced[i];

    if (!origExp && enhExp) {
      // New experience added
      changes.push({
        type: 'added',
        section: 'Experience',
        field: `${enhExp.position} at ${enhExp.company}`,
        original: '',
        enhanced: enhExp.description,
        description: 'AI added new work experience'
      });
    } else if (origExp && enhExp) {
      // Check description changes
      if (origExp.description !== enhExp.description) {
        changes.push({
          type: 'modified',
          section: 'Experience',
          field: `${origExp.position} at ${origExp.company} - Description`,
          original: origExp.description,
          enhanced: enhExp.description,
          description: 'AI enhanced job description'
        });
      }

      // Check achievements changes
      const origAchievements = origExp.achievements || [];
      const enhAchievements = enhExp.achievements || [];
      
      if (origAchievements.length !== enhAchievements.length || 
          !arraysEqual(origAchievements, enhAchievements)) {
        changes.push({
          type: enhAchievements.length > origAchievements.length ? 'added' : 'modified',
          section: 'Experience',
          field: `${origExp.position} at ${origExp.company} - Achievements`,
          original: origAchievements.join('; '),
          enhanced: enhAchievements.join('; '),
          description: enhAchievements.length > origAchievements.length 
            ? `AI added ${enhAchievements.length - origAchievements.length} new achievement(s)`
            : 'AI enhanced your achievements'
        });
      }
    }
  }

  return changes;
}

/**
 * Track changes in skills section
 */
function trackSkillsChanges(original: any[], enhanced: any[]): ChangeHighlight[] {
  const changes: ChangeHighlight[] = [];

  const origSkills = original.map(s => s.name.toLowerCase());
  const enhSkills = enhanced.map(s => s.name.toLowerCase());

  // Find new skills
  const newSkills = enhanced.filter(skill => 
    !origSkills.includes(skill.name.toLowerCase())
  );

  if (newSkills.length > 0) {
    changes.push({
      type: 'added',
      section: 'Skills',
      field: 'Technical & Soft Skills',
      original: original.map(s => s.name).join(', '),
      enhanced: enhanced.map(s => s.name).join(', '),
      description: `AI added ${newSkills.length} new skill(s): ${newSkills.map(s => s.name).join(', ')}`
    });
  }

  return changes;
}

/**
 * Track changes in education section
 */
function trackEducationChanges(original: any[], enhanced: any[]): ChangeHighlight[] {
  const changes: ChangeHighlight[] = [];

  // Check if new education entries were added
  if (enhanced.length > original.length) {
    const newEntries = enhanced.slice(original.length);
    newEntries.forEach(entry => {
      changes.push({
        type: 'added',
        section: 'Education',
        field: `${entry.degree} from ${entry.institution}`,
        original: '',
        enhanced: `${entry.degree} in ${entry.field} from ${entry.institution}`,
        description: 'AI added new education entry'
      });
    });
  }

  return changes;
}

/**
 * Generate highlighted text showing differences
 */
export function generateHighlightedText(original: string, enhanced: string): {
  html: string;
  hasChanges: boolean;
} {
  if (original === enhanced) {
    return { html: enhanced, hasChanges: false };
  }

  // Simple highlighting - in a real implementation, you'd use a proper diff algorithm
  const words = enhanced.split(' ');
  const originalWords = original.split(' ');
  
  let highlightedHtml = '';
  let hasChanges = false;

  words.forEach((word, index) => {
    if (index < originalWords.length && word === originalWords[index]) {
      highlightedHtml += word + ' ';
    } else {
      highlightedHtml += `<mark class="bg-green-200 dark:bg-green-800 px-1 rounded">${word}</mark> `;
      hasChanges = true;
    }
  });

  return { html: highlightedHtml.trim(), hasChanges };
}

/**
 * Utility function to compare arrays
 */
function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Generate a human-readable summary of changes
 */
export function generateChangesSummary(changes: ChangesSummary): string {
  if (changes.totalChanges === 0) {
    return "No changes were made to your resume.";
  }

  const summary = [`AI made ${changes.totalChanges} enhancement(s) across ${changes.sectionsModified.length} section(s):`];
  
  changes.sectionsModified.forEach(section => {
    const count = changes.changesBySection[section];
    summary.push(`• ${section}: ${count} change(s)`);
  });

  return summary.join('\n');
}