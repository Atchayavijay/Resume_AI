'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Plus,
    MoreVertical,
    Trash2,
    Edit3,
    Eye,
    Search,
    LayoutGrid,
    List,
    Clock,
    ChevronRight,
    X,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { TEMPLATES, type Template } from '@/lib/templates';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Resume {
    id: string;
    personalInfo: {
        fullName: string;
    };
    jobTitle: string;
    updatedAt: string;
    createdAt: string;
    design?: {
        templateId?: string;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
            router.refresh();
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
    };

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await apiClient('/api/resumes');
            if (response.ok) {
                const data = await response.json();
                // Newest first is already handled by API sorting usually, but let's be sure
                setResumes(data.sort((a: Resume, b: Resume) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                ));
            }
        } catch (error) {
            console.error('Failed to fetch resumes:', error);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResume = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;

        try {
            const response = await apiClient(`/api/resumes?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setResumes(resumes.filter(r => r.id !== id));
                toast.success('Resume deleted successfully');
            } else {
                toast.error('Failed to delete resume');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('An error occurred');
        }
    };

    const filteredResumes = resumes.filter(r =>
        r.personalInfo?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
            {/* Dashboard Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="gradient-primary p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight hidden sm:block">
                                Resume<span className="gradient-text">AI</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-lg">
                                Resumes
                            </Link>
                            <Link href="/templates" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                Templates
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">
                                {user?.email}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                        >
                            Sign out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My Resumes</h1>
                        <p className="text-slate-500">Create, manage and track your job applications</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search resumes..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                        <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Loading your resumes...</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "flex flex-col gap-4"
                    }>
                        {/* New Resume Card */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowTemplateModal(true)}
                            className={viewMode === 'grid'
                                ? "group relative aspect-[210/297] bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-orange-400 hover:bg-orange-50 transition-all overflow-hidden"
                                : "group bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 flex items-center justify-center gap-3 hover:border-orange-400 hover:bg-orange-50 transition-all font-semibold"
                            }
                        >
                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-orange-100 transition-colors shadow-sm">
                                <Plus className="h-8 w-8 text-slate-400 group-hover:text-orange-600 transition-colors" />
                            </div>
                            <span className="text-slate-500 font-bold group-hover:text-orange-700 transition-colors">
                                New Resume
                            </span>

                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.button>

                        {/* Resume List */}
                        <AnimatePresence mode="popLayout">
                            {filteredResumes.map((resume, idx) => (
                                <ResumeCard
                                    key={resume.id}
                                    resume={resume}
                                    viewMode={viewMode}
                                    onDelete={() => handleDeleteResume(resume.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Empty State when no resumes match search */}
                {!loading && filteredResumes.length === 0 && searchQuery && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm mt-6">
                        <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-1">No resumes found</h3>
                        <p className="text-slate-500">Try adjusting your search query</p>
                    </div>
                )}
            </main>

            {/* Template Modal */}
            <AnimatePresence>
                {showTemplateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowTemplateModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Choose a Template</h2>
                                    <p className="text-slate-500">Start with a professionally designed layout</p>
                                </div>
                                <button
                                    onClick={() => setShowTemplateModal(false)}
                                    className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-full transition-all"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 bg-white">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {TEMPLATES.map((template) => (
                                        <TemplateOption
                                            key={template.id}
                                            template={template}
                                            onSelect={(tid) => {
                                                router.push(`/builder?template=${tid}`);
                                                setShowTemplateModal(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ResumeCard({ resume, viewMode, onDelete }: { resume: Resume, viewMode: 'grid' | 'list', onDelete: () => void }) {
    const router = useRouter();

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-lg hover:border-orange-200 transition-all"
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 truncate">
                            {resume.personalInfo?.fullName || 'Untitled Resume'}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-medium text-slate-700">{resume.jobTitle || 'No Title'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <Clock className="h-3 w-3" />
                            Edited {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                        onClick={() => router.push(`/builder?id=${resume.id}`)}
                    >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/builder?id=${resume.id}`)}>
                                <Edit3 className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 cursor-pointer" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col aspect-[210/330]"
        >
            {/* Resume Thumbnail Preview Mockup */}
            <div
                className="relative flex-1 bg-slate-50 group-hover:bg-slate-100 transition-colors flex flex-col p-4 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/builder?id=${resume.id}`)}
            >
                <div className="bg-white h-full w-full rounded-sm shadow-sm p-4 flex flex-col gap-2 overflow-hidden ring-1 ring-slate-200">
                    <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                    <div className="h-2 w-1/2 bg-slate-50 rounded-full" />
                    <div className="mt-4 space-y-2">
                        <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                        <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                        <div className="h-1.5 w-3/4 bg-slate-50 rounded-full" />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="w-1/3 space-y-1">
                            <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                            <div className="h-1.5 w-3/4 bg-slate-50 rounded-full" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                            <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button className="gradient-primary shadow-lg scale-90 group-hover:scale-100 transition-all">
                        Open in Builder
                    </Button>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                            {resume.personalInfo?.fullName || 'Untitled Resume'}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mb-1">
                            {resume.jobTitle || 'No Title'}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            <Clock className="h-3 w-3" />
                            {new Date(resume.updatedAt).toLocaleDateString()}
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-slate-50 rounded-full transition-colors">
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push(`/builder?id=${resume.id}`)}>
                                <Edit3 className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 cursor-pointer" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.div>
    );
}

function TemplateOption({ template, onSelect }: { template: Template, onSelect: (id: string) => void }) {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="group flex flex-col gap-3"
        >
            <div
                className="relative aspect-[210/297] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer group/card"
                onClick={() => onSelect(template.id)}
            >
                {/* Simplified Template Preview */}
                <div className="absolute inset-0 bg-white m-3 rounded-sm shadow-sm flex flex-col overflow-hidden">
                    {template.design.personalDetails?.banner ? (
                        <div className="p-2 mb-1 flex flex-col gap-1 min-h-[40px]" style={{ backgroundColor: template.design.colors.accent }}>
                            <div className="h-1.5 w-10 bg-white/40 rounded-full" />
                            <div className="h-0.5 w-14 bg-white/20 rounded-full" />
                        </div>
                    ) : (
                        <div className="p-2 pb-1 border-b" style={{ borderColor: `${template.design.colors.accent}20` }}>
                            <div className="h-1 w-1 shrink-0 mb-1" style={{ backgroundColor: template.design.colors.accent }} />
                            <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
                        </div>
                    )}

                    <div className="flex-1 p-2 flex gap-1.5">
                        {template.design.layout.columns !== 'one' ? (
                            <>
                                <div className="w-1/4 h-full bg-slate-50/50 rounded-sm p-1 flex flex-col gap-1">
                                    <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                                    <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                                    <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                                    <div className="h-0.5 w-3/4 bg-slate-100 rounded-full" />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 space-y-1">
                                <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                                <div className="h-0.5 w-full bg-slate-100 rounded-full" />
                                <div className="h-0.5 w-3/4 bg-slate-100 rounded-full" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute inset-0 bg-orange-600/0 group-hover/card:bg-orange-600/5 transition-all flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                    <Button className="gradient-primary scale-90 group-hover/card:scale-100 transition-all">
                        Pick This
                    </Button>
                </div>
            </div>

            <div className="px-1">
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors uppercase tracking-tight">{template.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{template.description}</p>
            </div>
        </motion.div>
    );
}
