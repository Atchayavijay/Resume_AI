# Resume AI Builder - Professional Resume Creation Tool

A comprehensive, enterprise-level resume builder with AI-powered content generation, real-time ATS analysis, and professional export options.

## ✨ Features

### 🤖 AI-Powered Generation
- **Groq Integration**: Uses Mixtral-8x7b model for intelligent resume content generation
- **Context-Aware**: Generates content based on job target, experience, and skills
- **Professional Optimization**: Automatically optimizes content for ATS compatibility

### 📊 ATS Analysis & Scoring
- **Real-time Analysis**: Live ATS compatibility scoring as you type
- **Keyword Matching**: Advanced keyword analysis with categorization
- **Improvement Recommendations**: Actionable suggestions for better ATS performance
- **Progress Visualization**: Animated progress bars and detailed breakdowns

### 🎨 Professional Templates
- **Multiple Styles**: Classic, Modern, and Minimalist templates
- **Live Preview**: Real-time preview updates as you edit
- **Responsive Design**: Perfect formatting across all devices
- **Professional Typography**: Carefully chosen fonts and spacing

### 📱 Export Options
- **PDF Export**: High-quality PDF generation with professional formatting
- **DOCX Export**: Microsoft Word format for further editing
- **Print-Ready**: Optimized for printing and digital sharing

### 💾 Smart Features
- **Auto-Save**: Automatic progress saving with localStorage
- **Form Validation**: Comprehensive input validation and error handling
- **Mobile Responsive**: Full mobile and tablet support
- **Accessibility**: WCAG compliant with keyboard navigation

## 🛠 Technology Stack

### Frontend
- **Next.js 14**: App Router with React Server Components
- **TypeScript**: Strict typing for better development experience
- **Tailwind CSS v4**: Modern styling with custom design system
- **Framer Motion**: Smooth animations and transitions
- **shadcn/ui**: High-quality, accessible UI components

### AI & Analysis
- **Groq SDK**: AI-powered content generation
- **Custom ATS Engine**: Advanced keyword analysis and scoring
- **Natural Language Processing**: Smart content optimization

### Export Libraries
- **jsPDF**: PDF generation with custom layouts
- **docx**: Microsoft Word document creation
- **html2canvas**: HTML to image conversion

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager
- Groq API key (for AI features)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "D:\Resume Builder\resume-ai"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting Your Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

## 📖 Usage Guide

### 1. Personal Information
- Fill in your basic contact details
- Add a professional summary (or let AI generate one)
- Specify years of experience

### 2. Job Target
- Enter the position you're applying for
- Add the company name
- Paste the job description for AI optimization

### 3. Experience Section
- Add your work history with detailed descriptions
- Include quantifiable achievements
- Use action verbs and industry keywords

### 4. Education
- Add your educational background
- Include relevant certifications
- Mention GPA if impressive (3.5+)

### 5. Skills
- Categorize skills as Technical, Soft, or Language
- Include skill level (Beginner to Expert)
- Focus on job-relevant skills

### 6. AI Generation
- Click "Generate AI" to create optimized content
- AI will analyze your data and job target
- Generated content will automatically update your resume

### 7. ATS Analysis
- Switch to "ATS Score" tab to see your compatibility
- Review keyword matches and missing terms
- Follow recommendations to improve your score

### 8. Export
- Choose between PDF and DOCX formats
- PDF for job applications and online submissions
- DOCX for further customization

## 🎯 Best Practices

### For Better ATS Scores
1. **Use Job Keywords**: Include exact terms from the job description
2. **Quantify Achievements**: Use numbers, percentages, and metrics
3. **Standard Formatting**: Avoid tables, graphics, and complex layouts
4. **Relevant Skills**: Focus on skills mentioned in the job posting
5. **Action Verbs**: Start bullet points with strong action words

### For Professional Presentation
1. **Consistency**: Maintain consistent formatting throughout
2. **White Space**: Use appropriate spacing for readability
3. **Professional Email**: Use a professional email address
4. **Proofread**: Check for spelling and grammar errors
5. **Relevance**: Tailor content to the specific job/industry

## 📁 Project Structure

```
resume-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes (auth, resumes, generate, export-pdf, analyze-resume)
│   │   ├── builder/            # Resume builder page
│   │   ├── generate/           # AI generation page
│   │   ├── templates/          # Template selection page
│   │   ├── login/ signup/      # Auth pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── landing/            # Landing page sections (Hero, Features, FAQ, etc.)
│   │   ├── AIResumeChecker.tsx # AI-powered ATS analysis
│   │   ├── ExportButtons.tsx   # PDF/DOCX export
│   │   ├── ResumeForm.tsx      # Multi-section resume form
│   │   ├── ResumePreview.tsx   # Live preview with templates
│   │   └── ...
│   ├── contexts/               # React contexts (AuthContext)
│   ├── hooks/                  # Custom hooks (useResumePagination)
│   └── lib/
│       ├── auth/               # JWT, cookies, validation, rate-limit
│       ├── seed/               # Sample resume data
│       ├── ats.ts              # ATS analysis engine
│       ├── config.ts           # App configuration
│       ├── groq.ts             # AI (Groq) integration
│       ├── mongodb.ts          # Database connection
│       ├── templates.ts        # Resume template presets
│       ├── template-design-spec.ts
│       ├── types.ts            # TypeScript definitions
│       └── utils.ts            # Helpers
├── public/                     # Static assets
├── package.json
└── README.md
```

## 🔧 Configuration

### AI Model Settings
The application uses Groq's Mixtral-8x7b model, configured in `lib/config.ts`:
- Temperature: 0.7 (balanced creativity/consistency)
- Max tokens: 1000 (sufficient for resume content)
- Top-p: 0.9 (focused response generation)

### ATS Analysis
Custom ATS engine analyzes:
- Keyword density and placement
- Industry-specific terminology
- Action verb usage
- Skills alignment
- Format compatibility

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The application can be deployed on any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Azure Static Web Apps

## 🔒 Privacy & Security

- **Local Storage**: Resume data is stored locally in your browser
- **No Data Collection**: We don't collect or store your personal information
- **Secure API**: AI requests are processed securely through encrypted connections
- **Export Privacy**: Generated documents remain on your device

## 🤝 Contributing

This is a complete, production-ready application. For customizations:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is provided as-is for educational and professional use.

## 🆘 Troubleshooting

### Common Issues

**AI Generation Not Working**
- Check your Groq API key in `.env.local`
- Verify you have internet connection
- Ensure you've filled in required fields

**Export Issues**
- Make sure you have content in your resume
- Try refreshing the page and trying again
- Check browser console for specific errors

**Styling Issues**
- Clear browser cache and hard refresh
- Ensure all dependencies are installed
- Check for any console errors

### Getting Help

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are properly installed
4. Try clearing browser cache and localStorage

## 🌟 Features Coming Soon

- Dark/Light theme toggle
- Additional export formats
- Template customization
- Multi-language support
- Advanced AI optimization
- Resume scoring analytics

---

**Built with ❤️ using Next.js 14, TypeScript, and AI**

For technical support or questions, please check the troubleshooting section above.
