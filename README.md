# metodic.education

Free educational wiki for session leaders. This site serves as an SEO honeypot that captures managers searching for meeting problems and bridges them to [metodic.io](https://metodic.io) for full session design.

## Strategy

- **Target:** Managers searching Google for problems like "team won't make decisions" or "silent meetings"
- **Content:** Problem pages with panic scripts (copy-paste solutions) + method explainers
- **Conversion:** Deep links to metodic.io recipes and session builder

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Iconify (Carbon icons)
- **Database:** Supabase (shared with metodic.io)
- **Deployment:** Vercel

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── problems/          # Problem pages (SEO focus)
│   │   ├── [slug]/        # Individual problem pages
│   │   └── page.tsx       # Problems index
│   ├── methods/           # Method pages
│   │   ├── [slug]/        # Individual method pages
│   │   └── page.tsx       # Methods index
│   ├── frameworks/        # Learning framework pages
│   └── page.tsx           # Homepage
├── components/
│   ├── layout/            # Navbar, Footer
│   └── ui/                # shadcn/ui components
└── lib/
    ├── supabase.ts        # Supabase client
    └── utils.ts           # Utilities
```

## Content Types

### Problems
Each problem page includes:
- **Panic Script:** Copy-paste text for immediate use
- **Symptoms:** How to recognize the problem
- **Root Causes:** Why this happens
- **Related Methods:** Techniques that help
- **CTA:** Link to metodic.io recipe

### Methods
Each method page includes:
- **When to Use:** Context for the method
- **Step-by-Step:** Instructions to facilitate
- **Tips:** Facilitator advice
- **Variations:** Alternative approaches

## Deployment

Configured for Vercel deployment with:
- Domain: metodic.education
- Environment variables set in Vercel dashboard

## Related Projects

- [metodic.io](https://metodic.io) - Main SaaS product
