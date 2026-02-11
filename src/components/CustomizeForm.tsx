"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Globe,
    Layout,
    Maximize,
    Type,
    Palette,
    User,
    ChevronDown,
    ChevronRight,
    Monitor,
    Smartphone,
    Check,
    RotateCcw,
    Sliders,
    MousePointer2,
    Settings2,
    ListFilter,
    Table
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeDesign, ResumeData } from '@/lib/types';
import { DEFAULT_DESIGN } from '@/lib/defaults';
import { TEMPLATES, type Template } from '@/lib/templates';

interface CustomizeFormProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

const CustomizeForm: React.FC<CustomizeFormProps> = ({ data, onChange }) => {
    const design = data.design || DEFAULT_DESIGN;
    const [activeTab, setActiveTab] = useState('layout');

    const updateDesign = (section: keyof ResumeDesign, subField: string, value: any) => {
        const newDesign = {
            ...design,
            [section]: {
                ...(design[section] as any),
                [subField]: value
            }
        };
        onChange({ ...data, design: newDesign });
    };

    const updateSubDesign = (section: keyof ResumeDesign, subSection: string, field: string, value: any) => {
        const newDesign = {
            ...design,
            [section]: {
                ...(design[section] as any),
                [subSection]: {
                    ...(design[section] as any)[subSection],
                    [field]: value
                }
            }
        };
        onChange({ ...data, design: newDesign });
    };

    const resetToDefault = () => {
        if (confirm('Reset all design customizations to default?')) {
            onChange({ ...data, design: DEFAULT_DESIGN });
        }
    };

    const applyTemplate = (template: Template) => {
        onChange({ ...data, design: template.design });
    };

    const TemplateThumbnail = ({ template, isActive }: { template: Template; isActive: boolean }) => {
        const d = template.design;
        const isTwoCol = d.layout.columns === 'two' || d.layout.columns === 'mix';
        return (
            <div
                className={cn(
                    "flex-shrink-0 w-20 h-24 rounded-lg border-2 overflow-hidden cursor-pointer transition-all flex flex-col",
                    isActive ? "border-primary ring-2 ring-primary/30" : "border-slate-200 hover:border-slate-300"
                )}
                onClick={() => applyTemplate(template)}
            >
                <div className="h-1 shrink-0" style={{ backgroundColor: d.colors.accent }} />
                <div className="flex-1 p-1 flex flex-col gap-0.5" style={{ fontFamily: d.typography.fontFamily }}>
                    <div className="text-[8px] font-bold truncate" style={{ color: d.colors.text }}>{template.name}</div>
                    {isTwoCol ? (
                        <div className="flex gap-0.5 flex-1 min-h-0">
                            <div className="w-1/3 rounded-sm shrink-0" style={{ backgroundColor: `${d.colors.accent}25` }} />
                            <div className="flex-1 space-y-0.5">
                                <div className="h-0.5 rounded bg-slate-200 w-full" />
                                <div className="h-0.5 rounded bg-slate-200 w-4/5" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-0.5 flex-1">
                            <div className="h-0.5 rounded bg-slate-200 w-full" />
                            <div className="h-0.5 rounded bg-slate-200 w-4/5" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const currentTemplateId = TEMPLATES.find((t) =>
        JSON.stringify(t.design) === JSON.stringify(design)
    )?.id;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold gradient-text">Design Customization</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefault}
                    className="h-8 rounded-lg text-xs gap-1.5 glass-button"
                >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                </Button>
            </div>

            <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Change template
                </Label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {TEMPLATES.map((template) => (
                        <TemplateThumbnail
                            key={template.id}
                            template={template}
                            isActive={currentTemplateId === template.id}
                        />
                    ))}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-6 h-12 p-1 bg-slate-100/50 backdrop-blur-sm rounded-xl mb-8 border border-white/20 shadow-sm">
                    {[
                        { id: 'layout', label: 'Lay', icon: <Layout className="w-3.5 h-3.5" /> },
                        { id: 'spacing', label: 'Spa', icon: <Maximize className="w-3.5 h-3.5" /> },
                        { id: 'typeface', label: 'Type', icon: <Type className="w-3.5 h-3.5" /> },
                        { id: 'colors', label: 'Color', icon: <Palette className="w-3.5 h-3.5" /> },
                        { id: 'footer', label: 'Foot', icon: <Settings2 className="w-3.5 h-3.5" /> },
                        { id: 'global', label: 'Glob', icon: <Sliders className="w-3.5 h-3.5" /> }
                    ].map((t) => (
                        <TabsTrigger
                            key={t.id}
                            value={t.id}
                            className="rounded-lg text-[10px] font-bold uppercase transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:border data-[state=active]:shadow-sm flex flex-col items-center justify-center gap-0.5"
                        >
                            {t.icon}
                            <span className="hidden sm:inline">{t.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {activeTab === 'layout' && (
                            <TabsContent key="layout" value="layout" className="space-y-6 mt-0 outline-none">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Page Format</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['A4', 'Letter'].map((format) => (
                                                <button
                                                    key={format}
                                                    onClick={() => updateDesign('languageRegion', 'pageFormat', format)}
                                                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${design.languageRegion.pageFormat === format
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {format}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Columns</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'one', label: 'One', icon: <div className="w-4 h-3 bg-current opacity-20" /> },
                                                { id: 'two', label: 'Two', icon: <div className="w-4 h-3 flex gap-0.5"><div className="w-1.5 h-full bg-current opacity-20" /><div className="w-1.5 h-full bg-current opacity-20" /></div> },
                                                { id: 'mix', label: 'Mix', icon: <div className="w-4 h-3 flex flex-col gap-0.5"><div className="w-full h-1 bg-current opacity-20" /><div className="flex gap-0.5 w-full h-1.5"><div className="w-1/2 h-full bg-current opacity-20" /><div className="w-1/2 h-full bg-current opacity-20" /></div></div> }
                                            ].map((col) => (
                                                <button
                                                    key={col.id}
                                                    onClick={() => updateDesign('layout', 'columns', col.id)}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${design.layout.columns === col.id
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {col.icon}
                                                    <span className="text-[10px] font-bold uppercase">{col.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Header Position</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'top', label: 'Top' },
                                                { id: 'left', label: 'Left' },
                                                { id: 'right', label: 'Right' }
                                            ].map((pos) => (
                                                <motion.button
                                                    key={pos.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => updateDesign('layout', 'headerPosition', pos.id)}
                                                    className={`px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${design.layout.headerPosition === pos.id
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {pos.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {(design.layout.columns === 'two' || design.layout.columns === 'mix') && (
                                        <div className="space-y-4 pt-2 border-t border-slate-100">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Left Column Width</Label>
                                                <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{design.layout.columnWidths.left}%</span>
                                            </div>
                                            <input
                                                type="range" min="20" max="60" step="1"
                                                value={design.layout.columnWidths.left}
                                                onChange={(e) => {
                                                    const left = parseInt(e.target.value);
                                                    updateDesign('layout', 'columnWidths', { left, right: 100 - left });
                                                }}
                                                className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        )}

                        {/* Spacing Section */}
                        {activeTab === 'spacing' && (
                            <TabsContent value="spacing" forceMount className="space-y-6 mt-0 outline-none">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font Size</Label>
                                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{design.spacing.fontSize}pt</span>
                                        </div>
                                        <input
                                            type="range" min="8" max="14" step="0.5"
                                            value={design.spacing.fontSize}
                                            onChange={(e) => updateDesign('spacing', 'fontSize', parseFloat(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Line Height</Label>
                                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{design.spacing.lineHeight}</span>
                                        </div>
                                        <input
                                            type="range" min="1.0" max="2.0" step="0.1"
                                            value={design.spacing.lineHeight}
                                            onChange={(e) => updateDesign('spacing', 'lineHeight', parseFloat(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Side Margins</Label>
                                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{design.spacing.marginLR}mm</span>
                                        </div>
                                        <input
                                            type="range" min="5" max="30" step="1"
                                            value={design.spacing.marginLR}
                                            onChange={(e) => updateDesign('spacing', 'marginLR', parseInt(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entry Spacing</Label>
                                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{design.spacing.entrySpacing}px</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="20" step="1"
                                            value={design.spacing.entrySpacing}
                                            onChange={(e) => updateDesign('spacing', 'entrySpacing', parseInt(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vertical Margins</Label>
                                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">{design.spacing.marginTB}mm</span>
                                        </div>
                                        <input
                                            type="range" min="5" max="30" step="1"
                                            value={design.spacing.marginTB}
                                            onChange={(e) => updateDesign('spacing', 'marginTB', parseInt(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        )}

                        {/* Typography Section */}
                        {activeTab === 'typeface' && (
                            <TabsContent value="typeface" forceMount className="space-y-6 mt-0 outline-none">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font Family</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2">
                                            {[
                                                'Inter',
                                                'Roboto',
                                                'Open Sans',
                                                'Lato',
                                                'Poppins',
                                                'Montserrat',
                                                'EB Garamond',
                                                'Playfair Display',
                                                'Merriweather',
                                                'Source Sans Pro',
                                                'Raleway',
                                                'Crimson Text',
                                                'Libre Baskerville',
                                                'Lora',
                                                'PT Serif',
                                                'Roboto Slab',
                                                'Work Sans',
                                                'Nunito',
                                                'Ubuntu',
                                                'Oswald',
                                                'Georgia',
                                                'Times New Roman',
                                                'Arial',
                                                'Calibri'
                                            ].map((font) => (
                                                <button
                                                    key={font}
                                                    onClick={() => updateDesign('typography', 'fontFamily', font)}
                                                    className={`px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${design.typography.fontFamily === font
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                                        }`}
                                                    style={{ fontFamily: font }}
                                                >
                                                    {font}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heading Style</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'none', label: 'None' },
                                                { id: 'capitalize', label: 'Cap' },
                                                { id: 'uppercase', label: 'UPPER' }
                                            ].map((style) => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => updateSubDesign('typography', 'headings', 'capitalization', style.id)}
                                                    className={`px-3 py-2 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${design.typography.headings.capitalization === style.id
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {style.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heading Size</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['s', 'm', 'l', 'xl'].map((sz) => (
                                                <button
                                                    key={sz}
                                                    onClick={() => updateSubDesign('typography', 'headings', 'size', sz)}
                                                    className={`px-2 py-2 rounded-xl border-2 text-xs font-bold uppercase transition-all ${design.typography.headings.size === sz
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {sz}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Section Icons</Label>
                                        <div className="flex gap-1">
                                            {['none', 'outline', 'filled'].map((st) => (
                                                <Button
                                                    key={st}
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        "h-7 text-[10px] capitalize px-2 border-2 transition-all",
                                                        design.typography.headings.icons === st ? "border-primary text-primary bg-primary/5 font-bold shadow-sm" : "text-slate-500"
                                                    )}
                                                    onClick={() => updateSubDesign('typography', 'headings', 'icons', st)}
                                                >
                                                    {st}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        )}

                        {/* Colors Section */}
                        {activeTab === 'colors' && (
                            <TabsContent value="colors" forceMount className="space-y-6 mt-0 outline-none">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accent Color</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                '#3b82f6', // blue
                                                '#10b981', // emerald
                                                '#f59e0b', // amber
                                                '#ef4444', // red
                                                '#8b5cf6', // violet
                                                '#ec4899', // pink
                                                '#0f172a', // slate-900
                                                '#64748b', // slate-500
                                            ].map((color) => (
                                                <motion.button
                                                    key={color}
                                                    whileHover={{ scale: 1.15 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => updateDesign('colors', 'accent', color)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full border-2 transition-all shadow-sm",
                                                        design.colors.accent === color
                                                            ? 'border-white ring-2 ring-primary scale-110 shadow-lg'
                                                            : 'border-transparent'
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {design.colors.accent === color && <Check className="w-5 h-5 text-white mx-auto shadow-sm" />}
                                                </motion.button>
                                            ))}
                                            <motion.div
                                                whileHover={{ scale: 1.15 }}
                                                className="relative w-10 h-10 rounded-full border-2 border-slate-200 overflow-hidden cursor-pointer group shadow-sm bg-white"
                                            >
                                                <input
                                                    type="color"
                                                    value={design.colors.accent}
                                                    onChange={(e) => updateDesign('colors', 'accent', e.target.value)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Palette className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Text Color</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {['#111827', '#374151', '#4b5563', '#6b7280'].map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => updateDesign('colors', 'text', color)}
                                                    className={`w-10 h-10 rounded-full border-2 transition-all ${design.colors.text === color
                                                        ? 'border-white ring-2 ring-slate-800 scale-110 shadow-md'
                                                        : 'border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        )}
                        {/* Footer Section */}
                        {activeTab === 'footer' && (
                            <TabsContent value="footer" forceMount className="space-y-6 mt-0 outline-none">
                                <div className="space-y-4">
                                    {[
                                        { id: 'showPageNumbers', label: 'Page Numbers' },
                                        { id: 'showEmail', label: 'Contact Email' },
                                        { id: 'showName', label: 'Name in Footer' }
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 glass-card rounded-xl">
                                            <Label className="text-xs font-medium text-slate-600">{item.label}</Label>
                                            <input
                                                type="checkbox"
                                                checked={(design.footer as any)[item.id]}
                                                onChange={(e) => updateDesign('footer', item.id, e.target.checked)}
                                                className="w-4 h-4 accent-primary"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        )}

                        {/* Global Section */}
                        {activeTab === 'global' && (
                            <TabsContent value="global" forceMount className="space-y-6 mt-0 outline-none">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Format</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {['MM/YYYY', 'DD/MM/YYYY', 'MMM YYYY', 'Month YYYY'].map((fmt) => (
                                                <button
                                                    key={fmt}
                                                    onClick={() => updateDesign('languageRegion', 'dateFormat', fmt)}
                                                    className={`px-4 py-2 rounded-xl border-2 text-xs transition-all ${design.languageRegion.dateFormat === fmt
                                                        ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Utility Opacity</Label>
                                            <span className="text-xs font-bold text-primary">{design.advanced.dateLocationOpacity}</span>
                                        </div>
                                        <input
                                            type="range" min="0.3" max="1.0" step="0.1"
                                            value={design.advanced.dateLocationOpacity}
                                            onChange={(e) => updateDesign('advanced', 'dateLocationOpacity', parseFloat(e.target.value))}
                                            className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            {/* Entry Layout & Personal Details Accordion */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Details & Elements</h4>

                <DesignAccordionItem
                    icon={<User className="w-4 h-4" />}
                    title="Personal Details"
                    description="Align, arrangement, and icons"
                >
                    <div className="space-y-5 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Alignment</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {['left', 'center', 'right'].map((align) => (
                                    <Button
                                        key={align}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "capitalize h-8 text-xs rounded-lg transition-all border-2",
                                            design.personalDetails.align === align ? "border-primary text-primary bg-primary/5 shadow-sm font-bold" : "text-slate-400 font-medium"
                                        )}
                                        onClickCapture={() => updateDesign('personalDetails', 'align', align)}
                                    >
                                        {align}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Name Size</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {['s', 'm', 'l', 'xl'].map((sz) => (
                                    <Button
                                        key={sz}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "uppercase h-8 text-xs rounded-lg transition-all border-2",
                                            design.personalDetails.nameSize === sz ? "border-primary text-primary bg-primary/5 shadow-sm font-bold" : "text-slate-400 font-medium"
                                        )}
                                        onClickCapture={() => updateDesign('personalDetails', 'nameSize', sz)}
                                    >
                                        {sz}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Contact Icons</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'none', label: 'None' },
                                    { id: 'circle-filled', label: 'Circle Filled' },
                                    { id: 'rounded-filled', label: 'Rounded Filled' },
                                    { id: 'square-filled', label: 'Square Filled' },
                                    { id: 'circle-outline', label: 'Circle Outline' },
                                    { id: 'rounded-outline', label: 'Rounded Outline' },
                                    { id: 'square-outline', label: 'Square Outline' }
                                ].map((st) => (
                                    <Button
                                        key={st.id}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "capitalize h-8 text-[10px] px-1 rounded-lg transition-all border-2",
                                            design.personalDetails.iconStyle === st.id ? "border-primary text-primary bg-primary/5 shadow-sm font-bold" : "text-slate-400 font-medium"
                                        )}
                                        onClickCapture={() => updateDesign('personalDetails', 'iconStyle', st.id)}
                                    >
                                        {st.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Bold Name</Label>
                            <input
                                type="checkbox"
                                checked={design.personalDetails.nameBold}
                                onChange={(e) => updateDesign('personalDetails', 'nameBold', e.target.checked)}
                                className="w-4 h-4 accent-primary"
                            />
                        </div>
                    </div>
                </DesignAccordionItem>

                <DesignAccordionItem
                    icon={<Sliders className="w-4 h-4" />}
                    title="Experience & Education"
                    description="Ordering and grouping"
                >
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Work Layout</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'title-employer', label: 'Title - Employer' },
                                    { id: 'employer-title', label: 'Employer - Title' }
                                ].map((item) => (
                                    <Button
                                        key={item.id}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "justify-start h-8 text-[10px] transition-all border-2",
                                            design.sectionSettings.workExperience.order === item.id ? "border-primary text-primary bg-primary/5 shadow-sm font-bold" : "text-slate-400 font-medium"
                                        )}
                                        onClickCapture={() => updateSubDesign('sectionSettings', 'workExperience', 'order', item.id)}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Group Promotions</Label>
                            <input
                                type="checkbox"
                                checked={design.sectionSettings.workExperience.groupPromotions}
                                onChange={(e) => updateSubDesign('sectionSettings', 'workExperience', 'groupPromotions', e.target.checked)}
                                className="w-4 h-4 accent-primary"
                            />
                        </div>
                    </div>
                </DesignAccordionItem>

                <DesignAccordionItem
                    icon={<Check className="w-4 h-4" />}
                    title="Skills & Sections"
                    description="Display styles for skills"
                >
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Skills Style</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['grid', 'bubble', 'compact', 'level'].map((style) => (
                                    <Button
                                        key={style}
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "capitalize h-8 text-xs rounded-lg transition-all border-2",
                                            design.sectionSettings.skills === style ? "border-primary text-primary bg-primary/5 shadow-sm font-bold" : "text-slate-400 font-medium"
                                        )}
                                        onClickCapture={() => updateDesign('sectionSettings', 'skills', style)}
                                    >
                                        {style}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </DesignAccordionItem>
            </div>
        </div>
    );
};

interface DesignAccordionItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}

const DesignAccordionItem: React.FC<DesignAccordionItemProps> = ({ icon, title, description, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="glass-card rounded-2xl border-white/40 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isOpen ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                    )}>
                        {icon}
                    </div>
                    <div className="text-left">
                        <span className={cn(
                            "block text-sm font-bold transition-colors",
                            isOpen ? "text-primary" : "text-slate-800"
                        )}>{title}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{description}</span>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 border-t border-slate-100/50">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomizeForm;
