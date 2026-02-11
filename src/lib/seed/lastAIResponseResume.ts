import type { ResumeData } from '@/lib/types';
import { DEFAULT_DESIGN } from '@/lib/defaults';

const lastAIResponseResume: ResumeData = {
  personalInfo: {
    fullName: 'Pushparaj E',
    email: 'pushparajraje52141@gmail.com',
    phone: '+91 7603881811',
    location: 'Chennai, India',
    linkedIn: '',
    website: '',
    summary:
      'Highly motivated Fullstack Developer with 1 year of experience building scalable web applications using the MERN stack (Node.js, React, Express). Experienced in API design, performance optimization, and Agile development. Seeking a Fullstack Developer role to apply technical skills and deliver measurable business impact.',
    yearsOfExperience: 1
  },
  experience: [
    {
      id: 'exp_urbancode',
      company: 'Urbancode',
      position: 'Full Stack Developer',
      startDate: '2024-06',
      endDate: '2025-06',
      current: false,
      description:
        'Full Stack Developer specializing in MERN stack development. Co-founder of Zenaxa, delivering solutions in app development, web development, video editing, and graphic designing.',
      achievements: [
        'Developed and optimized 5 production web applications using the MERN stack, improving application performance by ~25% and reducing development time by ~20%.',
        'Built the Zen Lead Management System and ZEN CRM to streamline enquiry-to-placement tracking; implemented end-to-end features (frontend, backend, DB) and integrated Twilio for communications.',
        'Implemented backend performance optimizations and database tuning, reducing query latency by up to ~40% on targeted endpoints.',
        'Collaborated with cross-functional teams using Agile methodologies to design, test, and deploy features; consistently met delivery timelines and improved team throughput.',
        'Led code reviews and mentored junior developers, improving code quality and reducing bug rates.'
      ]
    },
    {
      id: 'exp_lssc',
      company: 'Leather Sector Skill Council (LSSC)',
      position: 'Intern (Backend Developer)',
      startDate: '2023-01',
      endDate: '2024-12',
      current: false,
      description:
        'Backend development intern contributing to Scale LMS (v1.0) — a learning management system for the leather industry.',
      achievements: [
        'Built Scale LMS software (v1.0) for education management using Node.js and Express.',
        'Developed REST APIs with Node.js and integrated Firebase authentication for secure user access.',
        'Enhanced system reliability and usability, leading to wider adoption by internal teams.',
        'Improved database workflows and contributed to system performance optimizations.'
      ]
    }
  ],
  education: [
    {
      id: 'edu_kings',
      institution: 'Kings Engineering College',
      degree: 'B.E. Computer Science and Engineering',
      field: 'Computer Science',
      startYear: '2021',
      endYear: '2025',
      gpa: '8.5'
    }
  ],
  skills: [
    { id: 'skill_js', name: 'JavaScript', level: 'advanced' },
    { id: 'skill_node', name: 'Node.js', level: 'advanced' },
    { id: 'skill_react', name: 'React', level: 'advanced' },
    { id: 'skill_express', name: 'Express', level: 'advanced' },
    { id: 'skill_pg', name: 'PostgreSQL', level: 'intermediate' },
    { id: 'skill_mongo', name: 'MongoDB', level: 'intermediate' },
    { id: 'skill_rest', name: 'REST APIs', level: 'advanced' },
    { id: 'skill_graphql', name: 'GraphQL', level: 'intermediate' },
    { id: 'skill_ts', name: 'TypeScript', level: 'intermediate' },
    { id: 'skill_firebase', name: 'Firebase', level: 'intermediate' },
    { id: 'skill_docker', name: 'Docker', level: 'intermediate' },
    { id: 'skill_git', name: 'Git', level: 'advanced' },
    { id: 'skill_redux', name: 'Redux Toolkit', level: 'intermediate' },
    { id: 'skill_vite', name: 'Vite', level: 'intermediate' },
    { id: 'skill_premiere', name: 'Adobe Premiere Pro', level: 'intermediate' },
    { id: 'skill_problem', name: 'Problem solving', level: 'advanced' },
    { id: 'skill_team', name: 'Team collaboration', level: 'advanced' },
    { id: 'skill_mentoring', name: 'Mentoring', level: 'intermediate' },
    { id: 'skill_time', name: 'Time management', level: 'advanced' }
  ],
  jobTitle: 'Fullstack Developer',
  jobDescription: '',
  jobTarget: { position: 'Fullstack Developer', company: 'Google', description: '' },
  design: DEFAULT_DESIGN
};

export default lastAIResponseResume;
