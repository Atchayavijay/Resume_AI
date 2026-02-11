"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
  Heart,
  FolderOpen,
  BookOpen,
  Award as AwardIcon,
  Users,
  Book,
  UserCheck,
  Globe,
  Shield,
  X,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Sparkles,
  SpellCheck2,
  Minimize2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/RichTextEditor';

import type { ResumeData, PersonalInfo, Experience, Education, Skill, Certificate, Interest, Project, Course, Award, Organisation, Publication, Reference, Language, Declaration, CustomSection } from '@/lib/types';
import { cn, generateId, isValidEmail, isValidPhone, isValidUrl } from '@/lib/utils';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  selectedSections?: string[];
  onOpenSectionsModal?: () => void;
  onSectionsOrderChange?: (newOrder: string[]) => void;
}

type SummaryAssistMode = 'improve' | 'grammar' | 'shorter';

const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange, selectedSections = ['personalInfo', 'experience', 'education', 'skills'], onOpenSectionsModal, onSectionsOrderChange }) => {
  const handleSummaryChange = useCallback((value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        summary: value
      }
    });
  }, [data, onChange]);



  // Experience handlers
  const addExperience = useCallback(() => {
    const newExperience: Experience = {
      id: generateId(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    onChange({
      ...data,
      experience: [...data.experience, newExperience]
    });
  }, [data, onChange]);

  const removeExperience = useCallback((index: number) => {
    const newExperience = data.experience.filter((_, i) => i !== index);
    onChange({
      ...data,
      experience: newExperience
    });
  }, [data, onChange]);

  const handleExperienceChange = useCallback((index: number, field: keyof Experience, value: any) => {
    const newExperience = [...data.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    onChange({
      ...data,
      experience: newExperience
    });
  }, [data, onChange]);

  // ...existing code...
  const [expandedSection, setExpandedSection] = useState<string>('personalInfo');

  // Handle drag end for section reordering
  const handleDragEnd = (result: DropResult) => {


    if (!result.destination) return;
    // Only allow drag for sections after personalInfo
    const sections = Array.from(selectedSections);
    const personalInfoIndex = sections.indexOf('personalInfo');
    // Remove personalInfo from drag logic
    const draggableSections = sections.filter(id => id !== 'personalInfo');
    const [removed] = draggableSections.splice(result.source.index, 1);
    draggableSections.splice(result.destination.index, 0, removed);
    // Rebuild new order: always keep personalInfo first
    const newOrder = ['personalInfo', ...draggableSections];
    if (typeof onSectionsOrderChange === 'function') {
      onSectionsOrderChange(newOrder);
    }
    // Set expanded section to the dropped section
    setExpandedSection(newOrder[result.destination.index + 1]);
  };

  const toggleSection = (sectionId: string) => {

    setExpandedSection(prev => prev === sectionId ? '' : sectionId);
  }

  // Handle personal info changes (declared early so other hooks can reference it)
  const handlePersonalInfoChange = useCallback((field: keyof PersonalInfo, value: string | number) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    });
  }, [data, onChange]);

  const handleSummaryAssist = useCallback((mode: SummaryAssistMode) => {
    const messages: Record<SummaryAssistMode, string> = {
      improve: 'Polishes tone and highlights measurable outcomes.',
      grammar: 'Checks spelling, grammar, and clarity.',
      shorter: 'Tightens sentences while preserving impact.',
    };
    console.log(`Summary assist: ${mode}`);
    // AI assistance logic here
  }, []);

  const removeAchievement = useCallback((expIndex: number, achIndex: number) => {

    const newExperience = [...data.experience];
    newExperience[expIndex].achievements = newExperience[expIndex].achievements.filter((_: string, i: number) => i !== achIndex);
    onChange({
      ...data,
      experience: newExperience
    });
  }, [data, onChange]);


  // Handle certificates changes
  const handleCertificateChange = useCallback((index: number, field: keyof Certificate, value: any) => {

    const newCertificates = [...(data.certificates || [])];
    newCertificates[index] = {
      ...newCertificates[index],
      [field]: value
    };
    onChange({
      ...data,
      certificates: newCertificates
    });
  }, [data, onChange]);


  const addCertificate = useCallback(() => {

    const newCertificate: Certificate = {
      id: generateId(),
      name: '',
      organization: '',
      issueDate: '',
      expiryDate: '',
      certificateId: ''
    };
    onChange({
      ...data,
      certificates: [...(data.certificates || []), newCertificate]
    });
  }, [data, onChange]);


  const removeCertificate = useCallback((index: number) => {

    const newCertificates = (data.certificates || []).filter((_: Certificate, i: number) => i !== index);
    onChange({
      ...data,
      certificates: newCertificates
    });
  }, [data, onChange]);



  // Handle projects changes
  const handleProjectChange = useCallback((index: number, field: keyof Project, value: any) => {

    const newProjects = [...(data.projects || [])];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    onChange({
      ...data,
      projects: newProjects
    });
  }, [data, onChange]);


  const addProject = useCallback(() => {

    const newProject: Project = {
      id: generateId(),
      title: '',
      role: '',
      technologies: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    onChange({
      ...data,
      projects: [...(data.projects || []), newProject]
    });
  }, [data, onChange]);


  const removeProject = useCallback((index: number) => {

    const newProjects = (data.projects || []).filter((_: Project, i: number) => i !== index);
    onChange({
      ...data,
      projects: newProjects
    });
  }, [data, onChange]);


  // Handle courses changes
  const handleCourseChange = useCallback((index: number, field: keyof Course, value: any) => {
    const newCourses = [...(data.courses || [])];
    newCourses[index] = {
      ...newCourses[index],
      [field]: value
    };
    onChange({
      ...data,
      courses: newCourses
    });
  }, [data, onChange]);


  const addCourse = useCallback(() => {
    const newCourse: Course = {
      id: generateId(),
      name: '',
      provider: '',
      completionDate: '',
      description: ''
    };
    onChange({
      ...data,
      courses: [...(data.courses || []), newCourse]
    });
  }, [data, onChange]);


  const removeCourse = useCallback((index: number) => {
    const newCourses = (data.courses || []).filter((_: Course, i: number) => i !== index);
    onChange({
      ...data,
      courses: newCourses
    });
  }, [data, onChange]);

  // Handle awards changes
  const handleAwardChange = useCallback((index: number, field: keyof Award, value: any) => {
    const newAwards = [...(data.awards || [])];
    newAwards[index] = {
      ...newAwards[index],
      [field]: value
    };
    onChange({
      ...data,
      awards: newAwards
    });
  }, [data, onChange]);

  const addAward = useCallback(() => {
    const newAward: Award = {
      id: generateId(),
      title: '',
      organization: '',
      date: '',
      description: ''
    };
    onChange({
      ...data,
      awards: [...(data.awards || []), newAward]
    });
  }, [data, onChange]);

  const removeAward = useCallback((index: number) => {
    const newAwards = (data.awards || []).filter((_: Award, i: number) => i !== index);
    onChange({
      ...data,
      awards: newAwards
    });
  }, [data, onChange]);

  // Handle drag end for section reordering
  // Only keep one handleDragEnd definition (the one above is correct)

  // Removed duplicate toggleSection handler
  const addAchievement = useCallback((expIndex: number) => {
    const newExperience = [...data.experience];
    newExperience[expIndex].achievements.push('');
    onChange({
      ...data,
      experience: newExperience
    });
  }, [data, onChange]);

  const handleAchievementChange = useCallback((expIndex: number, achIndex: number, value: string) => {
    const newExperience = [...data.experience];
    newExperience[expIndex].achievements[achIndex] = value;
    onChange({
      ...data,
      experience: newExperience
    });
  }, [data, onChange]);
  const addEducation = useCallback(() => {
    const newEducation: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      gpa: ''
    };
    onChange({
      ...data,
      education: [...data.education, newEducation]
    });
  }, [data, onChange]);

  const removeEducation = useCallback((index: number) => {
    const newEducation = data.education.filter((_, i) => i !== index);
    onChange({
      ...data,
      education: newEducation
    });
  }, [data, onChange]);

  const handleEducationChange = useCallback((index: number, field: keyof Education, value: string) => {
    const newEducation = [...data.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    onChange({
      ...data,
      education: newEducation
    });
  }, [data, onChange]);
  const addSkill = useCallback(() => {
    const newSkill: Skill = {
      id: generateId(),
      name: ''
    };
    onChange({
      ...data,
      skills: [...data.skills, newSkill]
    });
  }, [data, onChange]);

  const handleSkillChange = useCallback((index: number, field: keyof Skill, value: any) => {
    const newSkills = [...data.skills];
    newSkills[index] = {
      ...newSkills[index],
      [field]: value
    };
    onChange({
      ...data,
      skills: newSkills
    });
  }, [data, onChange]);

  const removeSkill = useCallback((index: number) => {
    const newSkills = data.skills.filter((_, i) => i !== index);
    onChange({
      ...data,
      skills: newSkills
    });
  }, [data, onChange]);

  // Soft Skills handlers
  const addSoftSkill = useCallback(() => {
    const newSkill: Skill = {
      id: generateId(),
      name: ''
    };
    onChange({
      ...data,
      softSkills: [...(data.softSkills || []), newSkill]
    });
  }, [data, onChange]);

  const handleSoftSkillChange = useCallback((index: number, field: keyof Skill, value: string | undefined) => {
    const newSoftSkills = [...(data.softSkills || [])];
    newSoftSkills[index] = {
      ...newSoftSkills[index],
      [field]: value
    };
    onChange({
      ...data,
      softSkills: newSoftSkills
    });
  }, [data, onChange]);

  const removeSoftSkill = useCallback((index: number) => {
    const newSoftSkills = (data.softSkills || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      softSkills: newSoftSkills
    });
  }, [data, onChange]);

  // Interests handlers
  const addInterest = useCallback(() => {
    const newInterest: Interest = {
      id: generateId(),
      name: '',
      description: ''
    };
    onChange({
      ...data,
      interests: [...(data.interests || []), newInterest]
    });
  }, [data, onChange]);

  const removeInterest = useCallback((index: number) => {
    const newInterests = (data.interests || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      interests: newInterests
    });
  }, [data, onChange]);

  const handleInterestChange = useCallback((index: number, field: keyof Interest, value: string) => {
    const newInterests = [...(data.interests || [])];
    newInterests[index] = {
      ...newInterests[index],
      [field]: value
    };
    onChange({
      ...data,
      interests: newInterests
    });
  }, [data, onChange]);

  // Organisation handlers
  const addOrganisation = useCallback(() => {
    const newOrganisation: Organisation = {
      id: generateId(),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    onChange({
      ...data,
      organisations: [...(data.organisations || []), newOrganisation]
    });
  }, [data, onChange]);

  const removeOrganisation = useCallback((index: number) => {
    const newOrganisations = (data.organisations || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      organisations: newOrganisations
    });
  }, [data, onChange]);

  const handleOrganisationChange = useCallback((index: number, field: keyof Organisation, value: string) => {
    const newOrganisations = [...(data.organisations || [])];
    newOrganisations[index] = {
      ...newOrganisations[index],
      [field]: value
    };
    onChange({
      ...data,
      organisations: newOrganisations
    });
  }, [data, onChange]);

  // Publication handlers
  const addPublication = useCallback(() => {
    const newPublication: Publication = {
      id: generateId(),
      title: '',
      type: '',
      date: '',
      publisher: '',
      url: ''
    };
    onChange({
      ...data,
      publications: [...(data.publications || []), newPublication]
    });
  }, [data, onChange]);

  // Removed duplicate removePublication handler

  const handlePublicationChange = useCallback((index: number, field: keyof Publication, value: string) => {
    const newPublications = [...(data.publications || [])];
    newPublications[index] = {
      ...newPublications[index],
      [field]: value
    };
    onChange({
      ...data,
      publications: newPublications
    });
  }, [data, onChange]);

  const removePublication = useCallback((index: number) => {
    const newPublications = (data.publications || []).filter((_: Publication, i: number) => i !== index);
    onChange({
      ...data,
      publications: newPublications
    });
  }, [data, onChange]);

  // Handle references changes
  const handleReferenceChange = useCallback((index: number, field: keyof Reference, value: any) => {
    const newReferences = [...(data.references || [])];
    newReferences[index] = {
      ...newReferences[index],
      [field]: value
    };
    onChange({
      ...data,
      references: newReferences
    });
  }, [data, onChange]);

  const addReference = useCallback(() => {
    const newReference: Reference = {
      id: generateId(),
      name: '',
      position: '',
      company: '',
      email: '',
      phone: ''
    };
    onChange({
      ...data,
      references: [...(data.references || []), newReference]
    });
  }, [data, onChange]);

  const removeReference = useCallback((index: number) => {
    const newReferences = (data.references || []).filter((_: Reference, i: number) => i !== index);
    onChange({
      ...data,
      references: newReferences
    });
  }, [data, onChange]);

  // Handle languages changes
  const handleLanguageChange = useCallback((index: number, field: keyof Language, value: any) => {
    const newLanguages = [...(data.languages || [])];
    newLanguages[index] = {
      ...newLanguages[index],
      [field]: value
    };
    onChange({
      ...data,
      languages: newLanguages
    });
  }, [data, onChange]);

  const addLanguage = useCallback(() => {
    const newLanguage: Language = {
      id: generateId(),
      name: '',
      level: 'intermediate'
    };
    onChange({
      ...data,
      languages: [...(data.languages || []), newLanguage]
    });
  }, [data, onChange]);

  const removeLanguage = useCallback((index: number) => {
    const newLanguages = (data.languages || []).filter((_: Language, i: number) => i !== index);
    onChange({
      ...data,
      languages: newLanguages
    });
  }, [data, onChange]);

  // Handle declaration changes
  const handleDeclarationChange = useCallback((field: keyof Declaration, value: string) => {
    onChange({
      ...data,
      declaration: {
        ...data.declaration,
        [field]: value
      } as Declaration
    });
  }, [data, onChange]);

  // Handle custom section changes
  const handleCustomChange = useCallback((field: keyof CustomSection, value: string) => {
    onChange({
      ...data,
      custom: {
        ...data.custom,
        [field]: value
      } as CustomSection
    });
  }, [data, onChange]);

  const allSections = [
    { id: 'personalInfo', label: 'Personal Information', icon: User, description: 'Basic contact details', category: 'required' },
    { id: 'job', label: 'Job Target', icon: Briefcase, description: 'Desired position & company', category: 'optional' },
    { id: 'experience', label: 'Work Experience', icon: Briefcase, description: 'Professional background', category: 'optional' },
    { id: 'education', label: 'Education', icon: GraduationCap, description: 'Academic qualifications', category: 'optional' },
    { id: 'skills', label: 'Technical Skills', icon: Code, description: 'Technical skills & expertise', category: 'optional' },
    { id: 'softSkills', label: 'Soft Skills', icon: Users, description: 'Interpersonal & soft skills', category: 'optional' },
    { id: 'certificates', label: 'Certificates', icon: FileText, description: 'Professional certificates', category: 'optional' },
    { id: 'interests', label: 'Interests', icon: Heart, description: 'Personal interests', category: 'optional' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, description: 'Project portfolio', category: 'optional' },
    { id: 'courses', label: 'Courses', icon: BookOpen, description: 'Additional courses', category: 'optional' },
    { id: 'awards', label: 'Awards', icon: AwardIcon, description: 'Awards & achievements', category: 'optional' },
    { id: 'organisations', label: 'Organisations', icon: Users, description: 'Volunteer work', category: 'optional' },
    { id: 'publications', label: 'Publications', icon: Book, description: 'Published works', category: 'optional' },
    { id: 'references', label: 'References', icon: UserCheck, description: 'Professional references', category: 'optional' },
    { id: 'languages', label: 'Languages', icon: Globe, description: 'Language skills', category: 'optional' },
    { id: 'declaration', label: 'Declaration', icon: Shield, description: 'Declaration statement', category: 'optional' },
    { id: 'custom', label: 'Custom', icon: Plus, description: 'Custom section', category: 'optional' }
  ];

  // Removed unused variable sections

  // Check if section is completed (basic validation)
  // Removed unused variable isSectionCompleted

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'personalInfo':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="font-medium text-base">Full Name</Label>
                <Input
                  id="fullName"
                  value={data.personalInfo.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePersonalInfoChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  className="bg-background/50 px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="font-medium text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePersonalInfoChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className={cn(
                    "bg-background/50 px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/30",
                    data.personalInfo.email && !isValidEmail(data.personalInfo.email) && "border-destructive"
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="font-medium text-base">Phone</Label>
                <Input
                  id="phone"
                  value={data.personalInfo.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePersonalInfoChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={cn(
                    "bg-background/50 px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/30",
                    data.personalInfo.phone && !isValidPhone(data.personalInfo.phone) && "border-destructive"
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="location" className="font-medium text-base">Location</Label>
                <Input
                  id="location"
                  value={data.personalInfo.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePersonalInfoChange('location', e.target.value)}
                  placeholder="New York, NY"
                  className="bg-background/50 px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="jobTitle" className="font-medium text-base">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={data.jobTitle || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...data, jobTitle: e.target.value })}
                  placeholder="Software Engineer, Full Stack Developer, etc."
                  className="bg-background/50 px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="linkedIn" className="font-medium text-base">LinkedIn (Optional)</Label>
                <Input
                  id="linkedIn"
                  value={data.personalInfo.linkedIn || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePersonalInfoChange('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe"
                  className={cn(
                    "bg-background/50 px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/30",
                    data.personalInfo.linkedIn && !isValidUrl(data.personalInfo.linkedIn) && "border-destructive"
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="website" className="font-medium text-base">Website (Optional)</Label>
                <Input
                  id="website"
                  value={data.personalInfo.website || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePersonalInfoChange('website', e.target.value)}
                  placeholder="https://johndoe.com"
                  className={cn(
                    "bg-background/50 px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/30",
                    data.personalInfo.website && !isValidUrl(data.personalInfo.website) && "border-destructive"
                  )}
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="summary" className="font-medium text-base">Professional Summary</Label>
              <RichTextEditor
                value={data.personalInfo.summary || ''}
                onChange={handleSummaryChange}
                placeholder="Write a professional summary or objective statement that highlights your key qualifications and career goals..."
                minHeight="200px"
                onAssist={handleSummaryAssist}
              />
            </div>

          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Work Experience</h4>
              <Button
                onClick={addExperience}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Experience</span>
              </Button>
            </div>

            {data.experience.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-lg border border-border/50 bg-card/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Experience #{index + 1}</h5>
                  {data.experience.length > 1 && (
                    <Button
                      onClick={() => removeExperience(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExperienceChange(index, 'company', e.target.value)}
                      placeholder="Company Name"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={exp.position}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExperienceChange(index, 'position', e.target.value)}
                      placeholder="Job Title"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <span>End Date</span>
                      <label className="flex items-center space-x-1 text-xs">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExperienceChange(index, 'current', e.target.checked)}
                          className="rounded"
                        />
                        <span>Current</span>
                      </label>
                    </Label>
                    <Input
                      type="month"
                      value={exp.endDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExperienceChange(index, 'endDate', e.target.value)}
                      disabled={exp.current}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={exp.description}
                    onChange={(value) => handleExperienceChange(index, 'description', value)}
                    placeholder="Describe your role and responsibilities..."
                    minHeight="150px"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Key Achievements</Label>
                    <Button
                      onClick={() => addAchievement(index)}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Achievement
                    </Button>
                  </div>
                  {exp.achievements.map((achievement, achIndex) => (
                    <div key={achIndex} className="flex space-x-2">
                      <Input
                        value={achievement}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAchievementChange(index, achIndex, e.target.value)}
                        placeholder="• Achieved 20% increase in sales..."
                        className="bg-background/50"
                      />
                      <Button
                        onClick={() => removeAchievement(index, achIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Education</h4>
              <Button
                onClick={addEducation}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </Button>
            </div>

            {data.education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-lg border border-border/50 bg-card/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Education #{index + 1}</h5>
                  {data.education.length > 1 && (
                    <Button
                      onClick={() => removeEducation(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'institution', e.target.value)}
                      placeholder="University Name"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'field', e.target.value)}
                      placeholder="Computer Science"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2100"
                      value={edu.startYear}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'startYear', e.target.value)}
                      placeholder="2020"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      type="number"
                      min="1900"
                      max="2100"
                      value={edu.endYear}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'endYear', e.target.value)}
                      placeholder="2024"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>GPA (Optional)</Label>
                    <Input
                      value={edu.gpa || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEducationChange(index, 'gpa', e.target.value)}
                      placeholder="3.8"
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Skills & Expertise</h4>
              <Button
                onClick={addSkill}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-lg border border-border/50 bg-card/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Skill #{index + 1}</h5>
                    {data.skills.length > 1 && (
                      <Button
                        onClick={() => removeSkill(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Skill Name</Label>
                    <Input
                      value={skill.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSkillChange(index, 'name', e.target.value)}
                      placeholder="JavaScript, React, Python..."
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Proficiency Level (Optional)</Label>
                    <select
                      value={skill.level || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        handleSkillChange(index, 'level', value === '' ? undefined : value as 'beginner' | 'intermediate' | 'advanced' | 'expert');
                      }}
                      className="w-full p-2 rounded-md border border-border bg-background/50"
                    >
                      <option value="">None</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'softSkills':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Soft Skills</h4>
              <Button
                onClick={addSoftSkill}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Soft Skill</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data.softSkills || []).map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-lg border border-border/50 bg-card/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Soft Skill #{index + 1}</h5>
                    {(data.softSkills || []).length > 1 && (
                      <Button
                        onClick={() => removeSoftSkill(index)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Skill Name</Label>
                    <Input
                      value={skill.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSoftSkillChange(index, 'name', e.target.value)}
                      placeholder="Leadership, Communication, Teamwork..."
                      className="bg-background/50"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'certificates':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Certificates</h4>
              <Button
                onClick={addCertificate}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </Button>
            </div>

            <div className="space-y-4">
              {(data.certificates || []).map((cert, index) => (
                <motion.div
                  key={cert.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Certificate {index + 1}</h5>
                    <Button
                      onClick={() => removeCertificate(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Certificate Name</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) => handleCertificateChange(index, 'name', e.target.value)}
                        placeholder="AWS Cloud Practitioner"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input
                        value={cert.organization}
                        onChange={(e) => handleCertificateChange(index, 'organization', e.target.value)}
                        placeholder="Amazon Web Services"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={cert.issueDate}
                        onChange={(e) => handleCertificateChange(index, 'issueDate', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiry Date (Optional)</Label>
                      <Input
                        type="date"
                        value={cert.expiryDate || ''}
                        onChange={(e) => handleCertificateChange(index, 'expiryDate', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Certificate ID/URL (Optional)</Label>
                      <Input
                        value={cert.certificateId || ''}
                        onChange={(e) => handleCertificateChange(index, 'certificateId', e.target.value)}
                        placeholder="Certificate URL or ID"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Interests</h4>
              <Button
                onClick={addInterest}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Interest</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.interests || []).map((interest, index) => (
                <motion.div
                  key={interest.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Interest {index + 1}</h5>
                    <Button
                      onClick={() => removeInterest(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Interest Name</Label>
                      <Input
                        value={interest.name}
                        onChange={(e) => handleInterestChange(index, 'name', e.target.value)}
                        placeholder="Photography"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        value={interest.description || ''}
                        onChange={(e) => handleInterestChange(index, 'description', e.target.value)}
                        placeholder="Brief description of your interest"
                        className="bg-background/50"
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Projects</h4>
              <Button
                onClick={addProject}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </Button>
            </div>

            <div className="space-y-4">
              {(data.projects || []).map((project, index) => (
                <motion.div
                  key={project.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Project {index + 1}</h5>
                    <Button
                      onClick={() => removeProject(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Title</Label>
                      <Input
                        value={project.title}
                        onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                        placeholder="E-commerce Website"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Your Role</Label>
                      <Input
                        value={project.role || ''}
                        onChange={(e) => handleProjectChange(index, 'role', e.target.value)}
                        placeholder="Full Stack Developer"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="month"
                        value={project.startDate}
                        onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={project.endDate}
                        onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Technologies Used</Label>
                      <Input
                        value={project.technologies || ''}
                        onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                        placeholder="React, Node.js, MongoDB"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <RichTextEditor
                        value={project.description || ''}
                        onChange={(value) => handleProjectChange(index, 'description', value)}
                        placeholder="Describe the project and your achievements"
                        minHeight="150px"
                      />
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Courses</h4>
              <Button
                onClick={addCourse}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Course</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.courses || []).map((course, index) => (
                <motion.div
                  key={course.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Course {index + 1}</h5>
                    <Button
                      onClick={() => removeCourse(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Course Name</Label>
                      <Input
                        value={course.name}
                        onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                        placeholder="Machine Learning Specialization"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Provider/Institution</Label>
                      <Input
                        value={course.provider || ''}
                        onChange={(e) => handleCourseChange(index, 'provider', e.target.value)}
                        placeholder="Coursera, Stanford University"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Completion Date</Label>
                      <Input
                        type="date"
                        value={course.completionDate}
                        onChange={(e) => handleCourseChange(index, 'completionDate', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <RichTextEditor
                        value={course.description || ''}
                        onChange={(value) => handleCourseChange(index, 'description', value)}
                        placeholder="What did you learn?"
                        minHeight="120px"
                      />
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'awards':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Awards</h4>
              <Button
                onClick={addAward}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Award</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.awards || []).map((award, index) => (
                <motion.div
                  key={award.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Award {index + 1}</h5>
                    <Button
                      onClick={() => removeAward(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Award Title</Label>
                      <Input
                        value={award.title}
                        onChange={(e) => handleAwardChange(index, 'title', e.target.value)}
                        placeholder="Employee of the Month"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input
                        value={award.organization || ''}
                        onChange={(e) => handleAwardChange(index, 'organization', e.target.value)}
                        placeholder="Company Name"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date Received</Label>
                      <Input
                        type="date"
                        value={award.date}
                        onChange={(e) => handleAwardChange(index, 'date', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description/Reason</Label>
                      <RichTextEditor
                        value={award.description || ''}
                        onChange={(value) => handleAwardChange(index, 'description', value)}
                        placeholder="Why did you receive this award?"
                        minHeight="120px"
                      />
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'organisations':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Organisations</h4>
              <Button
                onClick={addOrganisation}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Organisation</span>
              </Button>
            </div>

            <div className="space-y-4">
              {(data.organisations || []).map((org, index) => (
                <motion.div
                  key={org.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Organisation {index + 1}</h5>
                    <Button
                      onClick={() => removeOrganisation(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Organisation Name</Label>
                      <Input
                        value={org.name}
                        onChange={(e) => handleOrganisationChange(index, 'name', e.target.value)}
                        placeholder="Red Cross"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Role/Position</Label>
                      <Input
                        value={org.role || ''}
                        onChange={(e) => handleOrganisationChange(index, 'role', e.target.value)}
                        placeholder="Volunteer"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="month"
                        value={org.startDate}
                        onChange={(e) => handleOrganisationChange(index, 'startDate', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={org.endDate}
                        onChange={(e) => handleOrganisationChange(index, 'endDate', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Description/Contribution</Label>
                      <RichTextEditor
                        value={org.description || ''}
                        onChange={(value) => handleOrganisationChange(index, 'description', value)}
                        placeholder="Describe your role and contributions"
                        minHeight="150px"
                      />
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'publications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Publications</h4>
              <Button
                onClick={addPublication}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Publication</span>
              </Button>
            </div>

            <div className="space-y-4">
              {(data.publications || []).map((pub, index) => (
                <motion.div
                  key={pub.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Publication {index + 1}</h5>
                    <Button
                      onClick={() => removePublication(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={pub.title}
                        onChange={(e) => handlePublicationChange(index, 'title', e.target.value)}
                        placeholder="Research Paper Title"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Publication Type</Label>
                      <Input
                        value={pub.type || ''}
                        onChange={(e) => handlePublicationChange(index, 'type', e.target.value)}
                        placeholder="Journal, Conference, Book"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={pub.date}
                        onChange={(e) => handlePublicationChange(index, 'date', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Publisher</Label>
                      <Input
                        value={pub.publisher || ''}
                        onChange={(e) => handlePublicationChange(index, 'publisher', e.target.value)}
                        placeholder="Publisher Name"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>URL/DOI (Optional)</Label>
                      <Input
                        value={pub.url || ''}
                        onChange={(e) => handlePublicationChange(index, 'url', e.target.value)}
                        placeholder="https://doi.org/..."
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Description/Abstract</Label>
                      <RichTextEditor
                        value={pub.description || ''}
                        onChange={(value) => handlePublicationChange(index, 'description', value)}
                        placeholder="Brief description or abstract"
                        minHeight="150px"
                      />
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'references':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">References</h4>
              <Button
                onClick={addReference}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Reference</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(data.references || []).map((ref, index) => (
                <motion.div
                  key={ref.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Reference {index + 1}</h5>
                    <Button
                      onClick={() => removeReference(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={ref.name}
                        onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                        placeholder="John Smith"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Position/Relationship</Label>
                      <Input
                        value={ref.position || ''}
                        onChange={(e) => handleReferenceChange(index, 'position', e.target.value)}
                        placeholder="Former Manager"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Company/Organization</Label>
                      <Input
                        value={ref.company || ''}
                        onChange={(e) => handleReferenceChange(index, 'company', e.target.value)}
                        placeholder="Company Name"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={ref.email || ''}
                        onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                        placeholder="john@company.com"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone (Optional)</Label>
                      <Input
                        type="tel"
                        value={ref.phone || ''}
                        onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Languages</h4>
              <Button
                onClick={addLanguage}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Language</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.languages || []).map((lang, index) => (
                <motion.div
                  key={lang.id}
                  className="p-4 rounded-xl border bg-background/50"
                  layout
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium">Language {index + 1}</h5>
                    <Button
                      onClick={() => removeLanguage(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Language Name</Label>
                      <Input
                        value={lang.name}
                        onChange={(e) => handleLanguageChange(index, 'name', e.target.value)}
                        placeholder="Spanish"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Proficiency Level</Label>
                      <select
                        value={lang.level}
                        onChange={(e) => handleLanguageChange(index, 'level', e.target.value as Language['level'])}
                        className="w-full px-3 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="native">Native</option>
                        <option value="fluent">Fluent</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="basic">Basic</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'declaration':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Declaration</h4>

            <div className="p-4 rounded-xl border bg-background/50 space-y-4">
              <div className="space-y-2">
                <Label>Declaration Statement</Label>
                <RichTextEditor
                  value={data.declaration?.statement || ''}
                  onChange={(value) => handleDeclarationChange('statement', value)}
                  placeholder="I hereby declare that the information provided is true and accurate to the best of my knowledge..."
                  minHeight="150px"
                />
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Place</Label>
                  <Input
                    value={data.declaration?.place || ''}
                    onChange={(e) => handleDeclarationChange('place', e.target.value)}
                    placeholder="New York"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={data.declaration?.date || ''}
                    onChange={(e) => handleDeclarationChange('date', e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Signature (Optional)</Label>
                  <Input
                    value={data.declaration?.signature || ''}
                    onChange={(e) => handleDeclarationChange('signature', e.target.value)}
                    placeholder="Your signature or name"
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Custom Section</h4>

            <div className="p-4 rounded-xl border bg-background/50 space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={data.custom?.title || ''}
                  onChange={(e) => handleCustomChange('title', e.target.value)}
                  placeholder="Additional Information"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  value={data.custom?.content || ''}
                  onChange={(value) => handleCustomChange('content', value)}
                  placeholder="Enter your custom content here..."
                  minHeight="300px"
                />
              </div>

            </div>
          </div>
        );

      default:
        return <div>Section content not found</div>;
    }
  };

  return (
    <div className="h-full">
      <div className="max-w-4xl mx-auto p-4">
        <div className="space-y-2">
          {/* Always render Personal Information first */}
          {(() => {
            const section = {
              id: 'personalInfo',
              label: 'Personal Information',
              icon: User,
              description: 'Basic contact details',
            };
            const isExpanded = expandedSection === section.id;
            return (
              <motion.div
                key={section.id}
                className="glass-card border border-border/30 rounded-xl overflow-hidden"
                layout
              >
                <motion.button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full p-6 text-left transition-all duration-300 relative overflow-hidden group",
                    isExpanded
                      ? "bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border/30"
                      : "bg-glass-light/20 hover:bg-glass-medium/30"
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Disabled drag handle for alignment */}
                      <div
                        className="cursor-not-allowed p-2 mr-2 rounded opacity-40"
                        aria-label="Drag handle (disabled)"
                        style={{ display: 'flex', alignItems: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="4" cy="5" r="1.5" fill="#888" />
                          <circle cx="4" cy="10" r="1.5" fill="#888" />
                          <circle cx="4" cy="15" r="1.5" fill="#888" />
                          <circle cx="10" cy="5" r="1.5" fill="#888" />
                          <circle cx="10" cy="10" r="1.5" fill="#888" />
                          <circle cx="10" cy="15" r="1.5" fill="#888" />
                        </svg>
                      </div>
                      <section.icon className={cn("w-6 h-6 mr-2", isExpanded ? "text-primary" : "text-muted-foreground")} />
                      <div>
                        <h3 className={cn(
                          "font-semibold text-lg transition-colors",
                          isExpanded ? "text-primary" : "text-foreground"
                        )}>
                          {section.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground flex items-center justify-center" style={{ minWidth: 24, minHeight: 24 }}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: 'block', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                      >
                        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </motion.button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0">
                        {renderSectionContent(section.id)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })()}

          {/* Drag-and-drop for the rest of the selected sections in order, skipping personalInfo */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections-droppable">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {selectedSections.filter(id => id !== 'personalInfo').map((sectionId, index) => {
                    const section = allSections.find(s => s.id === sectionId);
                    if (!section) return null;
                    const isExpanded = expandedSection === sectionId;
                    const Icon = section.icon;
                    return (
                      <Draggable key={sectionId} draggableId={sectionId} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={cn(
                              "glass-card border border-border/30 rounded-xl overflow-hidden mb-2",
                              dragSnapshot.isDragging ? "shadow-lg bg-primary/10" : ""
                            )}
                          >
                            <motion.div layout>
                              <motion.button
                                onClick={() => toggleSection(sectionId)}
                                className={cn(
                                  "w-full p-6 text-left transition-all duration-300 relative overflow-hidden group",
                                  isExpanded
                                    ? "bg-gradient-to-r from-primary/20 to-accent/20 border-b border-border/30"
                                    : "bg-glass-light/20 hover:bg-glass-medium/30"
                                )}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    {/* Drag handle icon before heading */}
                                    <div
                                      {...dragProvided.dragHandleProps}
                                      role="button"
                                      tabIndex={0}
                                      className="cursor-grab active:cursor-grabbing p-2 mr-2 rounded hover:bg-primary/10"
                                      aria-label="Drag to reorder section"
                                      style={{ display: 'flex', alignItems: 'center' }}
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
                                    >
                                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <circle cx="4" cy="5" r="1.5" fill="#888" />
                                        <circle cx="4" cy="10" r="1.5" fill="#888" />
                                        <circle cx="4" cy="15" r="1.5" fill="#888" />
                                        <circle cx="10" cy="5" r="1.5" fill="#888" />
                                        <circle cx="10" cy="10" r="1.5" fill="#888" />
                                        <circle cx="10" cy="15" r="1.5" fill="#888" />
                                      </svg>
                                    </div>
                                    <Icon className={cn("w-6 h-6 mr-2", isExpanded ? "text-primary" : "text-muted-foreground")} />
                                    <div>
                                      <h3 className={cn(
                                        "font-semibold text-lg transition-colors",
                                        isExpanded ? "text-primary" : "text-foreground"
                                      )}>
                                        {section.label}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">{section.description}</p>
                                    </div>
                                  </div>
                                  <span className="text-muted-foreground flex items-center justify-center" style={{ minWidth: 24, minHeight: 24 }}>
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      style={{ display: 'block', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                                    >
                                      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                </div>
                              </motion.button>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                  >
                                    <div className="p-6 pt-0">
                                      {renderSectionContent(sectionId)}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Sections Button */}
          {onOpenSectionsModal && (
            <motion.div
              className="glass-card border border-dashed border-border/50 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <button
                onClick={onOpenSectionsModal}
                className="w-full p-6 text-left transition-all duration-300 hover:bg-primary/5 flex items-center justify-center space-x-3"
              >
                <Plus className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Add Sections</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
  // ...existing code...

}
export default ResumeForm;