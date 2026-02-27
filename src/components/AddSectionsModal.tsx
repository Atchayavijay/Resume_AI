"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  GraduationCap,
  Briefcase,
  Code,
  Heart,
  FolderOpen,
  BookOpen,
  Award,
  Users,
  Book,
  UserCheck,
  Globe,
  Shield,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSections: string[];
  onAddSection: (sectionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
}

const AddSectionsModal: React.FC<AddSectionsModalProps> = ({
  isOpen,
  onClose,
  selectedSections,
  onAddSection,
  onRemoveSection
}) => {
  const availableSections = [
    { id: 'summary', label: 'Professional Summary', icon: FileText, description: 'Write a professional summary or objective statement that highlights your key qualifications and career goals.' },
    { id: 'education', label: 'Education', icon: GraduationCap, description: 'Show off your primary education, college degrees & exchange semesters.' },
    { id: 'experience', label: 'Professional Experience', icon: Briefcase, description: 'A place to highlight your professional experience - including internships.' },
    { id: 'skills', label: 'Technical Skills', icon: Code, description: 'List your technical skills and expertise in this section.' },
    { id: 'softSkills', label: 'Soft Skills', icon: Users, description: 'Add your interpersonal and soft skills like leadership, communication, teamwork, etc.' },
    { id: 'certificates', label: 'Certificates', icon: FileText, description: 'Drivers licenses and other industry-specific certificates you have belong here.' },
    { id: 'interests', label: 'Interests', icon: Heart, description: 'Do you have interests that align with your career aspiration?' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, description: 'Worked on a particular challenging project in the past? Mention it here.' },
    { id: 'courses', label: 'Courses', icon: BookOpen, description: 'Did you complete MOOCs or an evening course? Show them off in this section.' },
    { id: 'awards', label: 'Awards', icon: Award, description: 'Awards like student competitions or industry accolades belong here.' },
    { id: 'organisations', label: 'Organisations', icon: Users, description: 'If you volunteer or participate in a good cause, why not state it?' },
    { id: 'publications', label: 'Publications', icon: Book, description: 'Academic publications or book releases have a dedicated place here.' },
    { id: 'references', label: 'References', icon: UserCheck, description: 'If you have former colleagues or bosses that vouch for you, list them.' },
    { id: 'languages', label: 'Languages', icon: Globe, description: 'You speak more than one language? Make sure to list them here.' },
    { id: 'declaration', label: 'Declaration', icon: Shield, description: 'You need a declaration with signature?' },
    { id: 'custom', label: 'Custom', icon: Plus, description: 'You didn\'t find what you are looking for? Or you want to combine two sections to save space?' }
  ];

  const handleSectionClick = (sectionId: string) => {
    const isSelected = selectedSections.includes(sectionId);
    if (isSelected) {
      onRemoveSection(sectionId);
    } else {
      onAddSection(sectionId);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1] bg-black/50 backdrop-blur-sm"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full h-full overflow-hidden"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add content</h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-600">Quick start:</span>
                  <button className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>Import Resume</span>
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto h-[calc(100vh-120px)] bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {availableSections.map((section) => {
                  const isSelected = selectedSections.includes(section.id);
                  const Icon = section.icon;

                  return (
                    <motion.div
                      key={section.id}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all duration-200 bg-white",
                        isSelected
                          ? "border-orange-500 bg-orange-50 shadow-sm"
                          : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "flex-shrink-0 p-2 rounded-lg",
                          isSelected ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            "font-semibold text-sm mb-1",
                            isSelected ? "text-orange-700" : "text-gray-900"
                          )}>
                            {section.label}
                          </h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      {section.id === 'custom' && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                          <div className="text-xs text-gray-600">
                            Create your own section
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddSectionsModal;