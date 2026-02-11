
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
            className={cn("bg-white shadow-xl relative transition-transform origin-top mx-auto mb-8", className)}
            style={{
                width,
                height,
                transform: `scale(${scale})`,
                ...style
            }}
            {...props}
        >
            <div className="h-full w-full relative">
                {/* Content Area */}
                {children}

                {/* Page Footer / Number */}
                <div className="absolute bottom-4 right-8 text-[10px] text-slate-300 pointer-events-none print:hidden">
                    Page {pageNumber} of {totalNumbers}
                </div>
            </div>
        </div>
    );
});

ResumePage.displayName = 'ResumePage';
