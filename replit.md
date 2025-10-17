# HealthMate Sahaya

## Overview
HealthMate Sahaya is a multilingual health management application built with React, TypeScript, Vite, and shadcn/ui components. The application provides health assistance features including:

- Multi-language support (English, Hindi, Kannada, Tamil, Bengali, Telugu)
- User profile setup
- Dashboard with health management features
- Prescription upload and scanning
- Wellness tips
- Voice assistant
- Medicine tracking and reminders

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **AI/ML**: Google Gemini Vision for prescription reading, Hugging Face Transformers

### Directory Structure
```
/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Dashboard.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── PrescriptionUpload.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── VoiceAssistant.tsx
│   │   └── WellnessTips.tsx
│   ├── contexts/         # React contexts
│   │   └── LanguageContext.tsx
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   │   ├── geminiVision.ts  # Gemini Vision for prescription analysis
│   │   └── utils.ts
│   ├── pages/           # Page components
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/              # Static assets
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies

```

## Development Setup

### Environment Configuration
- **Dev Server**: Runs on port 5000 with host 0.0.0.0 for Replit compatibility
- **HMR**: Configured for Replit's proxy environment (clientPort: 443)
- **Path Alias**: `@/` maps to `./src/`

### Running Locally
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

## Recent Changes
- **2025-10-16**: Enhanced Gemini Vision Analysis
  - Significantly improved prescription and medical report analysis
  - Enhanced extraction capabilities:
    - Complete medicine details: name, generic name, dosage, strength, frequency, timing
    - Food timing (before/after/with food)
    - Duration and special instructions
    - Medicine purpose and usage guidelines
  - Added support for:
    - Doctor and clinic information extraction
    - Diagnosis/condition detection
    - Lab test recommendations
    - Follow-up appointment dates
    - Special instructions and warnings
  - Improved simplification with:
    - Patient-friendly language and explanations
    - Helpful tips and reminders
    - Emoji-based visual organization
    - Step-by-step medicine guidance
  - Uses Gemini 2.5 Pro with structured JSON schema for accurate data extraction

- **2025-10-16**: Gemini Vision Integration
  - Integrated Google Gemini Vision API for prescription reading
  - Replaced mock OCR with real AI-powered prescription analysis
  - Added automatic text extraction, simplification, and medicine parsing
  - Configured GEMINI_API_KEY in Replit Secrets
  - Created `src/lib/geminiVision.ts` utility for prescription analysis

- **2025-10-16**: Initial Replit setup
  - Configured Vite for Replit environment (port 5000, host 0.0.0.0)
  - Set up development workflow
  - Installed all dependencies
  - Verified application runs successfully

## User Preferences
- None set yet

## Notes
- The application uses Lovable component tagger in development mode
- TypeScript strict mode is enabled
- The app supports legacy browsers through Vite's build configuration
