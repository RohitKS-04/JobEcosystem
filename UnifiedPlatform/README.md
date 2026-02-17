# Job Ecosystem Platform

Unified platform combining:
- **Placement Readiness Platform** - JD analysis, ATS scoring, interview prep
- **AI Resume Builder** - Resume creation with templates and ATS scoring
- **Job Notification Tracker** - Job application tracking and management

## Quick Start

### 1. Install Dependencies
```bash
cd UnifiedPlatform
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 3. Build for Production
```bash
npm run build
```

## Deploy to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Vite configuration
5. Click "Deploy"

## Project Structure
```
UnifiedPlatform/
├── src/
│   ├── layouts/          # Shared layouts
│   ├── pages/            # Route pages
│   ├── components/       # Reusable components
│   └── styles/           # Global styles
├── public/               # Static assets
└── dist/                 # Build output
```

## Tech Stack
- React 18
- TypeScript
- Vite
- React Router v6
- Tailwind CSS
- Lucide React (icons)
