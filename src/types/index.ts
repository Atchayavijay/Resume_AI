/**
 * Global type definitions
 */

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  photo?: string;
  summary: string;
  yearsOfExperience?: number;
  nationality?: string;
  dateOfBirth?: string;
  visa?: string;
  passport?: string;
  gender?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
  visible?: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  gpa?: string;
  visible?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  visible?: boolean;
}

export interface JobTarget {
  position: string;
  company: string;
  description?: string;
}

export interface Certificate {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expiryDate?: string;
  certificateId?: string;
  url?: string;
  visible?: boolean;
}

export interface Interest {
  id: string;
  name: string;
  description?: string;
  visible?: boolean;
}

export interface Project {
  id: string;
  title: string;
  role?: string;
  technologies?: string;
  startDate: string;
  endDate: string;
  description?: string;
  link?: string;
  visible?: boolean;
}

export interface Course {
  id: string;
  name: string;
  provider?: string;
  completionDate: string;
  description?: string;
  visible?: boolean;
}

export interface Award {
  id: string;
  title: string;
  organization?: string;
  date: string;
  description?: string;
  url?: string;
  visible?: boolean;
}

export interface Organisation {
  id: string;
  name: string;
  role?: string;
  startDate: string;
  endDate: string;
  description?: string;
  visible?: boolean;
}

export interface Publication {
  id: string;
  title: string;
  type?: string;
  date: string;
  publisher?: string;
  url?: string;
  description?: string;
  visible?: boolean;
}

export interface Reference {
  id: string;
  name: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
  visible?: boolean;
}

export interface Language {
  id: string;
  name: string;
  level: 'native' | 'fluent' | 'intermediate' | 'basic';
  visible?: boolean;
}

export interface Declaration {
  statement: string;
  place?: string;
  date?: string;
  signature?: string;
  visible?: boolean;
}

export interface CustomSection {
  title: string;
  content: string;
}

export interface ResumeDesign {
  templateId?: string;
  languageRegion: {
    language: string;
    dateFormat: string;
    pageFormat: 'A4' | 'Letter';
  };
  layout: {
    columns: 'one' | 'two' | 'mix';
    headerPosition: 'top' | 'left' | 'right';
    columnWidths: {
      left: number;
      right: number;
    };
  };
  spacing: {
    fontSize: number;
    lineHeight: number;
    marginLR: number;
    marginTB: number;
    entrySpacing: number;
  };
  colors: {
    mode: 'basic' | 'advanced';
    accent: string;
    text: string;
    background: string;
    customColors: {
      name?: string;
      jobTitle?: string;
      headings?: string;
      headerIcons?: string;
      dotsBarsBubbles?: string;
      dates?: string;
      linkIcons?: string;
    };
  };
  typography: {
    fontFamily: string;
    headings: {
      style: string;
      capitalization: 'none' | 'capitalize' | 'uppercase';
      size: 's' | 'm' | 'l' | 'xl';
      icons: 'none' | 'outline' | 'filled';
    };
  };
  entryLayout: {
    titleSize: 's' | 'm' | 'l';
    subtitleStyle: 'normal' | 'bold' | 'italic';
    subtitlePlacement: 'same-line' | 'next-line';
    indentBody: boolean;
    listStyle: 'bullet' | 'hyphen';
  };
  footer: {
    showPageNumbers: boolean;
    showEmail: boolean;
    showName: boolean;
  };
  advanced: {
    linkIcon: 'none' | 'icon' | 'external';
    dateLocationOpacity: number;
  };
  personalDetails: {
    align: 'left' | 'center' | 'right';
    arrangement: 'icon' | 'bullet' | 'bar' | 'pipe';
    iconStyle: 'none' | 'circle-filled' | 'rounded-filled' | 'square-filled' | 'circle-outline' | 'rounded-outline' | 'square-outline';
    nameSize: 'xs' | 's' | 'm' | 'l' | 'xl';
    nameBold: boolean;
    showPhoto: boolean;
    photoSize: number;
    photoFormat: 'circle' | 'rounded' | 'square';
    banner?: boolean;
    bannerTextColor?: string;
  };
  sectionSettings: {
    skills: 'grid' | 'level' | 'compact' | 'bubble';
    languages: 'grid' | 'level' | 'compact' | 'bubble' | 'text' | 'dots' | 'bar';
    interests: 'grid' | 'compact' | 'bubble';
    certificates: 'grid' | 'compact' | 'bubble';
    education: {
      order: 'degree-school' | 'school-degree';
    };
    workExperience: {
      order: 'title-employer' | 'employer-title';
      groupPromotions: boolean;
    };
  };
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  softSkills?: Skill[];
  jobTitle: string;
  jobDescription: string;
  jobTarget?: JobTarget;
  certificates?: Certificate[];
  interests?: Interest[];
  projects?: Project[];
  courses?: Course[];
  awards?: Award[];
  organisations?: Organisation[];
  publications?: Publication[];
  references?: Reference[];
  languages?: Language[];
  declaration?: Declaration;
  custom?: CustomSection;
  design: ResumeDesign;
  selectedSections?: string[]; // Sections enabled/added by user
  hiddenSections?: string[]; // Sections hidden from PDF but still in the list
  sectionLabels?: Record<string, string>;
}

export interface ATSAnalysis {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
  categories: {
    technical: { matched: string[]; missing: string[] };
    soft: { matched: string[]; missing: string[] };
    industry: { matched: string[]; missing: string[] };
  };
}

export interface GeneratedResume {
  content: string;
  atsScore: number;
  optimizedContent?: string;
}
