import { ResumeDesign } from './types';

export const DEFAULT_DESIGN: ResumeDesign = {
    languageRegion: {
        language: 'English (UK)',
        dateFormat: 'DD/MM/YYYY',
        pageFormat: 'A4',
    },
    layout: {
        columns: 'one',
        headerPosition: 'top',
        columnWidths: {
            left: 44,
            right: 56,
        },
    },
    spacing: {
        fontSize: 10,
        lineHeight: 1.3,
        marginLR: 18,
        marginTB: 16,
        entrySpacing: 5,
    },
    colors: {
        mode: 'basic',
        accent: '#3b82f6', // blue-500
        text: '#1f2937', // gray-800
        background: '#ffffff',
        customColors: {},
    },
    typography: {
        fontFamily: 'Inter',
        headings: {
            style: 'classic',
            capitalization: 'uppercase',
            size: 'm',
            icons: 'none',
        },
    },
    entryLayout: {
        titleSize: 'm',
        subtitleStyle: 'bold',
        subtitlePlacement: 'next-line',
        indentBody: false,
        listStyle: 'bullet',
    },
    footer: {
        showPageNumbers: false,
        showEmail: true,
        showName: true,
    },
    advanced: {
        linkIcon: 'icon',
        dateLocationOpacity: 0.8,
    },
    personalDetails: {
        align: 'left',
        arrangement: 'icon',
        iconStyle: 'circle-outline',
        nameSize: 'l',
        nameBold: true,
        showPhoto: false,
        photoSize: 100,
        photoFormat: 'circle',
    },
    sectionSettings: {
        skills: 'grid',
        languages: 'grid',
        interests: 'grid',
        certificates: 'grid',
        education: {
            order: 'degree-school',
        },
        workExperience: {
            order: 'title-employer',
            groupPromotions: true,
        },
    },
};
