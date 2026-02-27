import type { ResumeData } from '@/lib/types';
import { DEFAULT_DESIGN } from '@/lib/defaults';

const makeId = (prefix = '') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const jaganrajResume: ResumeData = {
    personalInfo: {
        fullName: 'Jaganraj M',
        email: 'jaganraj.m31@gmail.com',
        phone: '+91 9087498096',
        location: 'Chennai , Tamil Nadu',
        linkedIn: 'linkedin.com/in/jaganrajmuthu',
        website: 'https://jaganrajmuthu.netlify.app/',
        summary:
            'Motivated Full-Stack Developer with hands-on experience building scalable web applications using AngularJS, Spring Boot, MySQL, and MongoDB. Completed 3 comprehensive full-stack projects demonstrating proficiency in CRUD operations, REST API integration, and responsive UI design. Strong foundation in the software development lifecycle (SDLC) with the ability to transform requirements into functional applications. Eager to contribute technical skills and problem-solving abilities to a dynamic development team while continuing to grow as a professional developer.',
        yearsOfExperience: 1
    },
    experience: [
        {
            id: 'exp_1',
            company: 'LevelUp360 – Industry Simulation Program',
            position: 'Frontend Developer Intern',
            startDate: '2025-06',
            endDate: '2025-08',
            current: false,
            description: 'Techackode June 2025 – August 2025',
            achievements: [
                'Completed an intensive, industry-oriented internship focused on real-world software development, UI engineering, and modern deployment workflows.',
                'Designed and developed responsive web interfaces using HTML5, CSS3, JavaScript, and Bootstrap, ensuring cross-browser compatibility.',
                'Converted Figma UI designs into pixel-perfect, functional web pages while maintaining design accuracy and responsive behavior across devices.',
                'Worked in a simulated client environment, analyzing project requirements, planning component architecture, and delivering client-aligned solutions.',
                'Managed development tasks using Jira, following Agile methodologies and sprint workflows for organized project delivery.',
                'Utilized Git and GitHub for version control, code collaboration, and clean commit management across team projects.',
                'Deployed production-ready websites using Netlify, Vercel, and Render with CI/CD integration.',
                'Practiced AI-augmented development workflows to enhance coding efficiency and UI quality.'
            ]
        }
    ],
    education: [
        {
            id: 'edu_1',
            institution: 'Kings Engineering College',
            degree: 'Bachlore of in Information Technology',
            field: 'Information Technology',
            startYear: '2022',
            endYear: '2026',
            gpa: '7.5'
        }
    ],
    skills: [
        { id: 'skill_1', name: 'Java', level: 'intermediate' },
        { id: 'skill_2', name: 'Springboot', level: 'intermediate' },
        { id: 'skill_3', name: 'HTML5, CSS3, JAVA SCRIPT', level: 'intermediate' },
        { id: 'skill_4', name: 'MYSQL', level: 'intermediate' },
        { id: 'skill_5', name: 'MONGODB', level: 'beginner' },
        { id: 'skill_6', name: 'ANGULAR JS', level: 'beginner' }
    ],
    certificates: [
        {
            id: 'cert_1',
            name: 'HTML,CSS',
            organization: 'Udemy',
            issueDate: '2025-12',
            expiryDate: ''
        },
        {
            id: 'cert_2',
            name: 'Java Fullstack',
            organization: 'Techacademy',
            issueDate: '2025-08',
            expiryDate: ''
        }
    ],
    softSkills: [
        { id: 'soft_1', name: 'During my college days, I organized a technical event as part of a symposium.', level: 'advanced' },
        { id: 'soft_2', name: 'I am a quick learner with strong problem analysis skills.', level: 'advanced' }
    ],
    custom: {
        title: 'Technical Skills',
        content: ''
    },
    projects: [
        {
            id: 'proj_1',
            title: 'Gignity – Part-Time Job Matching Platform',
            role: 'Spring Boot, MongoDB, REST APIs',
            startDate: '2025-09',
            endDate: '',
            description: '<ul><li>Architected and deployed a full-stack job-matching platform connecting students with part-time opportunities using <strong>Spring Boot microservices and MongoDB</strong> for scalable data management.</li><li>Engineered a secure <strong>authentication system and role-based access control</strong>, enabling community-driven job postings with structured verification workflows.</li><li>Implemented advanced filtering and search functionality to match student preferences with job requirements, improving user experience and job discovery efficiency by 40%.</li></ul>'
        },
        {
            id: 'proj_2',
            title: 'Smart Parking Management System',
            role: 'React, Node.js, Express, MongoDB',
            startDate: '2026-01',
            endDate: '2026-02',
            description: '<ul><li>Developed a comprehensive parking management solution with real-time slot availability tracking and automated booking system.</li><li>Integrated IoT sensors (ESP32/ESP8266) with ultrasonic sensors for vehicle detection and status updates.</li><li>Built RESTful APIs for seamless communication between frontend, backend, and IoT devices.</li></ul>'
        },
        {
            id: 'proj_3',
            title: 'Resume AI Builder',
            role: 'Next.js, TypeScript, TailwindCSS, AI Integration',
            startDate: '2026-02',
            endDate: '',
            description: '<ul><li>Created an intelligent resume builder with AI-powered content suggestions and ATS optimization.</li><li>Implemented multi-page layout support with dynamic pagination for various resume formats.</li><li>Designed responsive templates with customizable themes and real-time preview functionality.</li></ul>'
        }
    ],
    jobTitle: 'Full-Stack Developer',
    jobDescription: '',
    design: {
        ...DEFAULT_DESIGN,
        templateId: 'jaganraj',
        personalDetails: {
            ...DEFAULT_DESIGN.personalDetails,
        }
    }
};

export default jaganrajResume;
