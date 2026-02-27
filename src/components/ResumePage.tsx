
import React from 'react';
import { cn } from '@/lib/utils';

interface ResumePageProps {
    pageNumber: number;
    totalNumbers: number;
    children: React.ReactNode;
    width?: string | number;
    height?: string | number;
    scale?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const ResumePage = React.forwardRef<HTMLDivElement, ResumePageProps>(({
    pageNumber,
    totalNumbers,
    children,
    width = '210mm',
    height = '297mm',
    scale = 1,
    className,
    style,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "resume-page shadow-xl relative transition-transform origin-top mx-auto bg-white overflow-hidden",
                className
            )}
            style={{
                width: width,
                height: height,
                minHeight: height,
                paddingTop: 'var(--resume-margin-tb)',
                paddingBottom: 'calc(var(--resume-margin-tb) + 20px + 10px)', // Synced with pagination buffer (20px gap + 10px safety)
                paddingLeft: 'var(--resume-margin-lr)',
                paddingRight: 'var(--resume-margin-lr)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                transform: `scale(${scale})`,
                pageBreakAfter: 'always',
                breakAfter: 'page',
                background: 'white',
                overflow: 'hidden',
                ...style
            }}
            {...props}
        >
            <div className="h-full w-full relative">
                {/* Content Area */}
                {children}

                {/* Page Footer / Number */}
                <div className="absolute bottom-4 right-8 text-[10px] text-slate-300 pointer-events-none hidden">
                    Page {pageNumber} of {totalNumbers}
                </div>
            </div>
        </div>
    );
});

ResumePage.displayName = 'ResumePage';
