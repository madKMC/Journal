# SoulScriptJournal

A beautiful, secure journaling application built with Next.js, Supabase, and Tailwind CSS designed for your soul's expression and reflection.

## Features

- 📝 Rich text editor for journal entries
- 🎭 Mood tracking with categorized writing prompts
- 🔍 Search and filter entries by mood, date, and content
- 📄 Export entries as PDF
- 🔐 Secure authentication with Supabase
- 📱 Responsive design for all devices
- 🎨 Beautiful, production-ready UI
- ✨ Soul-inspired writing prompts and guidance

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd soulscriptjournal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Run the database migrations in the `supabase/migrations` folder
4. The app will automatically create user profiles and handle authentication

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Important**: Never commit your `.env.local` file to version control. The `.env.example` file shows the required variables without exposing sensitive data.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to set the environment variables in your deployment platform's settings.

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Form Handling**: React Hook Form with Zod validation

## Philosophy

SoulScriptJournal is more than just a journaling app - it's a sacred space for your thoughts, emotions, and spiritual journey. We believe that writing is a powerful tool for self-discovery and healing, and our platform is designed to support your soul's expression in a beautiful, secure environment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.