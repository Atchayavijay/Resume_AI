# Netlify Deployment Guide

This guide will help you deploy the Resume AI Builder to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://www.netlify.com))
2. A GitHub/GitLab/Bitbucket account (for connecting your repository)
3. A Groq API key (get one from [console.groq.com](https://console.groq.com))

## Important Notes

⚠️ **Puppeteer Limitation**: Netlify Functions have limitations with Puppeteer. The PDF export feature may need to be adjusted or use an alternative service. Consider using:
- A separate PDF generation service (like PDFShift, HTMLtoPDF API)
- Client-side PDF generation (jsPDF/html2canvas)
- Or deploy Puppeteer-dependent features to a different platform (Vercel, Railway, etc.)

## Deployment Steps

### Method 1: Deploy via Netlify UI (Recommended for First Time)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider and select your repository

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `20` (set in Environment variables)

4. **Set Environment Variables**
   In the Netlify dashboard, go to Site settings → Environment variables and add:
   ```
   GROQ_API_KEY=your_actual_groq_api_key
   NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify in your project**
   ```bash
   netlify init
   ```
   - Follow the prompts to connect to an existing site or create a new one
   - Choose your build command: `npm run build`
   - Choose your publish directory: `.next`

4. **Set Environment Variables**
   ```bash
   netlify env:set GROQ_API_KEY "your_actual_groq_api_key"
   netlify env:set NEXT_PUBLIC_APP_URL "https://your-site-name.netlify.app"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Method 3: Deploy via GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=.next
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Post-Deployment Configuration

### 1. Update API Routes (if needed)

If Puppeteer doesn't work on Netlify, you may need to:
- Use a third-party PDF service
- Switch to client-side PDF generation
- Deploy PDF generation to a separate service

### 2. Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### 3. Enable HTTPS

Netlify automatically provides HTTPS certificates via Let's Encrypt. No action needed.

## Troubleshooting

### Build Fails

1. **Check Node version**: Ensure you're using Node 20
2. **Check environment variables**: Make sure `GROQ_API_KEY` is set
3. **Check build logs**: Look for specific error messages in Netlify dashboard

### API Routes Not Working

1. Ensure `output: "export"` is commented out in `next.config.ts`
2. Verify `@netlify/plugin-nextjs` is installed (it's configured in `netlify.toml`)
3. Check that API routes are in `src/app/api/` directory

### PDF Export Issues

If Puppeteer fails on Netlify:
1. Consider using a PDF generation service
2. Or use client-side PDF generation (already implemented as fallback)
3. Check Netlify Function logs for specific errors

### Environment Variables Not Working

1. Make sure variables are set in Netlify dashboard (not just `.env.local`)
2. Redeploy after adding new environment variables
3. Use `NEXT_PUBLIC_` prefix for client-side variables

## Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## Support

If you encounter issues:
1. Check Netlify build logs
2. Review Next.js documentation
3. Check Netlify status page for service issues


