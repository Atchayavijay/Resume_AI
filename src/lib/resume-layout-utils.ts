
import { ResumeData } from './types';
import type { ResumeDesign } from './types';

/** Sections that go in the sidebar for two-column / mix layouts */
const SIDEBAR_SECTIONS = ['skills', 'languages', 'interests', 'certificates'];

export interface DistributedBlocks {
  main: ResumeBlock[];
  sidebar: ResumeBlock[];
}

export type BlockType =
    | 'header'
    | 'section-title'
    | 'section-item'
    | 'section-group' // For grouped items like skills
    | 'spacer';

export interface ResumeBlock {
    id: string;
    type: BlockType;
    sectionId: string;
    content?: any; // The data needed to render this block
}

// Helper to generate a unique ID
const generateId = (prefix: string, index?: number) => `${prefix}-${index ?? Math.random().toString(36).substr(2, 9)}`;

export const flattenResumeData = (data: ResumeData, selectedSections: string[]): ResumeBlock[] => {
    const blocks: ResumeBlock[] = [];

    // 1. Personal Info (Header)
    // We treat the main header as one block for now, or split it if needed. 
    // Usually, the personalized info header stays at the top of the first page.
    // We'll mark it as a special block.
    if (selectedSections.includes('personalInfo')) {
        blocks.push({
            id: 'personal-info',
            type: 'header',
            sectionId: 'personalInfo',
            content: data.personalInfo
        });
    }

    // Helper to add standard sections
    const addSection = (sectionId: string) => {
        // Spacer before every section except the first one (handled by renderer logic usually, but consistent spacing helps)
        // blocks.push({ id: `spacer-${sectionId}`, type: 'spacer', sectionId });

        switch (sectionId) {
            case 'summary':
            case 'job':
                if (data.personalInfo.summary) {
                    blocks.push({
                        id: 'summary-title',
                        type: 'section-title',
                        sectionId: 'summary',
                        content: 'Professional Summary' // Or dynamic based on job title
                    });
                    blocks.push({
                        id: 'summary-content',
                        type: 'section-item',
                        sectionId: 'summary',
                        content: data.personalInfo.summary
                    });
                }
                break;

            case 'experience':
                if (data.experience?.length) {
                    blocks.push({ id: 'experience-title', type: 'section-title', sectionId: 'experience', content: 'Work Experience' });
                    data.experience.forEach((exp, idx) => {
                        blocks.push({
                            id: `experience-${exp.id || idx}`,
                            type: 'section-item',
                            sectionId: 'experience',
                            content: exp
                        });
                    });
                }
                break;

            case 'education':
                if (data.education?.length) {
                    blocks.push({ id: 'education-title', type: 'section-title', sectionId: 'education', content: 'Education' });
                    data.education.forEach((edu, idx) => {
                        blocks.push({
                            id: `education-${edu.id || idx}`,
                            type: 'section-item',
                            sectionId: 'education',
                            content: edu
                        });
                    });
                }
                break;

            case 'projects':
                if (data.projects?.length) {
                    blocks.push({ id: 'projects-title', type: 'section-title', sectionId: 'projects', content: 'Projects' });
                    data.projects.forEach((proj, idx) => {
                        blocks.push({
                            id: `projects-${proj.id || idx}`,
                            type: 'section-item',
                            sectionId: 'projects',
                            content: proj
                        });
                    });
                }
                break;

            case 'skills':
                if (data.skills?.length) {
                    blocks.push({ id: 'skills-title', type: 'section-title', sectionId: 'skills', content: 'Technical Skills' });
                    // Skills are often a grid or list. If grid, we might want to keep them together or split row by row.
                    // For now, treat the whole list as one block if it's small, or split if needed.
                    // Let's treat it as one block for simplicity unless we want to split categories.
                    blocks.push({
                        id: 'skills-content',
                        type: 'section-group',
                        sectionId: 'skills',
                        content: data.skills
                    });
                }
                break;

            case 'softSkills':
                if (data.softSkills?.length) {
                    blocks.push({ id: 'softSkills-title', type: 'section-title', sectionId: 'softSkills', content: 'Soft Skills' });
                    blocks.push({
                        id: 'softSkills-content',
                        type: 'section-group',
                        sectionId: 'softSkills',
                        content: data.softSkills
                    });
                }
                break;

            case 'certificates':
                if (data.certificates?.length) {
                    blocks.push({ id: 'certificates-title', type: 'section-title', sectionId: 'certificates', content: 'Certifications' });
                    data.certificates.forEach((cert, idx) => {
                        blocks.push({
                            id: `certificates-${cert.id || idx}`,
                            type: 'section-item',
                            sectionId: 'certificates',
                            content: cert
                        });
                    });
                }
                break;

            case 'languages':
                if (data.languages?.length) {
                    blocks.push({ id: 'languages-title', type: 'section-title', sectionId: 'languages', content: 'Languages' });
                    blocks.push({
                        id: 'languages-content',
                        type: 'section-group',
                        sectionId: 'languages',
                        content: data.languages
                    });
                }
                break;

            case 'interests':
                if (data.interests?.length) {
                    blocks.push({ id: 'interests-title', type: 'section-title', sectionId: 'interests', content: 'Interests' });
                    blocks.push({
                        id: 'interests-content',
                        type: 'section-group',
                        sectionId: 'interests',
                        content: data.interests
                    });
                }
                break;

            case 'awards':
                if (data.awards?.length) {
                    blocks.push({ id: 'awards-title', type: 'section-title', sectionId: 'awards', content: 'Honors & Awards' });
                    data.awards.forEach((award, idx) => {
                        blocks.push({
                            id: `awards-${award.id || idx}`,
                            type: 'section-item',
                            sectionId: 'awards',
                            content: award
                        });
                    });
                }
                break;

            case 'organisations':
                if (data.organisations?.length) {
                    blocks.push({ id: 'organisations-title', type: 'section-title', sectionId: 'organisations', content: 'Organizations' });
                    data.organisations.forEach((org, idx) => {
                        blocks.push({
                            id: `organisations-${org.id || idx}`,
                            type: 'section-item',
                            sectionId: 'organisations',
                            content: org
                        });
                    });
                }
                break;

            case 'publications':
                if (data.publications?.length) {
                    blocks.push({ id: 'publications-title', type: 'section-title', sectionId: 'publications', content: 'Publications' });
                    data.publications.forEach((pub, idx) => {
                        blocks.push({
                            id: `publications-${pub.id || idx}`,
                            type: 'section-item',
                            sectionId: 'publications',
                            content: pub
                        });
                    });
                }
                break;

            case 'references':
                if (data.references?.length) {
                    blocks.push({ id: 'references-title', type: 'section-title', sectionId: 'references', content: 'References' });
                    // References are often a grid. content holds all.
                    blocks.push({
                        id: 'references-content',
                        type: 'section-group',
                        sectionId: 'references',
                        content: data.references
                    });
                }
                break;

            case 'declaration':
                if (data.declaration?.statement) {
                    blocks.push({
                        id: 'declaration-content',
                        type: 'section-group',
                        sectionId: 'declaration',
                        content: data.declaration
                    })
                }
                break;

            case 'custom':
                if (data.custom?.title && data.custom?.content) {
                    blocks.push({ id: 'custom-title', type: 'section-title', sectionId: 'custom', content: data.custom.title });
                    blocks.push({
                        id: 'custom-content',
                        type: 'section-item',
                        sectionId: 'custom',
                        content: data.custom.content
                    });
                }
                break;
        }
    };

    selectedSections.forEach(sectionId => {
        if (sectionId !== 'personalInfo') { // personalInfo is handled first normally
            addSection(sectionId);
        }
    });

    return blocks;
};

/**
 * Distribute blocks into main and sidebar columns based on layout.
 * - one column + top header: all blocks in main
 * - two/mix + left/right: header and SIDEBAR_SECTIONS in sidebar, rest in main
 */
export function distributeBlocksByLayout(
  blocks: ResumeBlock[],
  layout: ResumeDesign['layout']
): DistributedBlocks {
  if (layout.columns === 'one') {
    return { main: blocks, sidebar: [] };
  }

  const headerInSidebar = layout.headerPosition === 'left' || layout.headerPosition === 'right';
  const sidebar: ResumeBlock[] = [];
  const main: ResumeBlock[] = [];

  for (const block of blocks) {
    const isHeader = block.sectionId === 'personalInfo';
    const isSidebarSection = SIDEBAR_SECTIONS.includes(block.sectionId);

    if (isHeader && headerInSidebar) {
      sidebar.push(block);
    } else if (isSidebarSection) {
      sidebar.push(block);
    } else {
      main.push(block);
    }
  }

  return { main, sidebar };
}
