"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Zap, 
  Plus, 
  Edit, 
  Minus,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChangesSummary, ChangeHighlight } from '@/lib/change-tracker';
import type { ResumeData } from '@/lib/types';

interface ChangesVisualizationProps {
  changes: ChangesSummary | null;
  originalData: ResumeData;
  enhancedData: ResumeData;
  visible: boolean;
  onToggleVisibility: () => void;
}

export default function ChangesVisualization({
  changes,
  originalData,
  enhancedData,
  visible,
  onToggleVisibility
}: ChangesVisualizationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!changes) {
    return null;
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getChangeIcon = (type: ChangeHighlight['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'modified':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-600" />;
    }
  };

  const getChangeColor = (type: ChangeHighlight['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'modified':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'removed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  // Group changes by section
  const changesBySection = changes.highlights.reduce((acc, change) => {
    if (!acc[change.section]) {
      acc[change.section] = [];
    }
    acc[change.section].push(change);
    return acc;
  }, {} as Record<string, ChangeHighlight[]>);

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={onToggleVisibility}
        className="w-full flex items-center gap-2"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {visible ? 'Hide' : 'Show'} AI Changes
        {changes.totalChanges > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {changes.totalChanges} changes
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {changes.totalChanges === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No changes were made to your resume content.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      AI Enhancement Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>{changes.totalChanges}</strong> enhancement(s) made across{' '}
                        <strong>{changes.sectionsModified.length}</strong> section(s)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {changes.sectionsModified.map(section => (
                          <Badge key={section} variant="outline">
                            {section} ({changes.changesBySection[section]})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Changes */}
                <div className="space-y-3">
                  {Object.entries(changesBySection).map(([section, sectionChanges]) => (
                    <Card key={section}>
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleSection(section)}
                      >
                        <CardTitle className="flex items-center justify-between text-base">
                          <span className="flex items-center gap-2">
                            {expandedSections.has(section) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            {section}
                          </span>
                          <Badge variant="secondary">
                            {sectionChanges.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      
                      <AnimatePresence>
                        {expandedSections.has(section) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <CardContent>
                              <div className="space-y-4">
                                {sectionChanges.map((change, index) => (
                                  <div key={index} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                    <div className="flex items-start gap-2">
                                      {getChangeIcon(change.type)}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">
                                            {change.field}
                                          </span>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${getChangeColor(change.type)}`}
                                          >
                                            {change.type}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {change.description}
                                        </p>
                                        
                                        {/* Before/After comparison */}
                                        {change.original && (
                                          <div className="space-y-2">
                                            <div className="bg-red-50 dark:bg-red-950 p-2 rounded text-xs">
                                              <span className="font-medium text-red-700 dark:text-red-300">Before:</span>
                                              <p className="mt-1 text-red-600 dark:text-red-400">
                                                {change.original.substring(0, 200)}
                                                {change.original.length > 200 ? '...' : ''}
                                              </p>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-950 p-2 rounded text-xs">
                                              <span className="font-medium text-green-700 dark:text-green-300">After:</span>
                                              <p className="mt-1 text-green-600 dark:text-green-400">
                                                {change.enhanced.substring(0, 200)}
                                                {change.enhanced.length > 200 ? '...' : ''}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}