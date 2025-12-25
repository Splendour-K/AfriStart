# AfriStart - Connect. Collaborate. Build Africa's Future.

AfriStart is a web application that helps African university students find co-founders, build accountability, and access practical resources to transform their startup ideas into successful businesses.

## 🚀 Features

- **User Authentication**: Secure signup/login with Supabase (email/password + Google OAuth)
- **Profile Management**: Complete profile with skills, interests, and social links
- **Co-founder Discovery**: Smart matching algorithm based on skills, interests, and goals
- **Real-time Messaging**: Chat with your connections using Supabase Realtime
- **Skill Endorsements**: Get endorsed by connections for your skills (LinkedIn-style)
- **Startup Ideas**: Share and discover startup ideas from the community
- **Dashboard**: Track your connections, matches, and startup progress
- **Onboarding Flow**: Guided setup for new users

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Backend**: Supabase (Authentication + PostgreSQL Database)
- **State Management**: React Query + Context API
- **Routing**: React Router DOM

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works!)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd AfriStart
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Go to **Settings > API** to get your project URL and anon key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 4. Enable Google OAuth (Optional)

1. Go to **Authentication > Providers** in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📁 Project Structure

```
src/
├── components/
│   ├── home/          # Landing page components
│   ├── layout/        # Header, Footer
│   ├── ui/            # shadcn/ui components
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx  # Authentication state management
├── hooks/             # Custom React hooks
├── lib/
│   ├── supabase.ts    # Supabase client + types
│   └── utils.ts       # Utility functions
├── pages/
│   ├── Index.tsx      # Landing page
│   ├── Login.tsx      # Login page
│   ├── Signup.tsx     # Registration page
│   ├── Onboarding.tsx # Profile setup wizard
│   ├── Dashboard.tsx  # Main dashboard
│   ├── Discover.tsx   # Find co-founders
│   ├── Profile.tsx    # User profile management
│   ├── ForgotPassword.tsx
│   └── ResetPassword.tsx
└── App.tsx            # Main app with routing
```

## 🗃️ Database Schema

The Supabase database includes:

- **profiles**: User profiles with skills, interests, university
- **connections**: Co-founder connection requests
- **startup_ideas**: User startup ideas and projects
- **messages**: Direct messaging between users
- **goals**: Accountability goals and milestones
- **resources**: Shared startup resources

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access/modify their own data
- Profiles are publicly viewable for discovery

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🚀 Deployment (Vercel)

### Option 1: One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Splendour-K/AfriStart)

### Option 2: Manual Deploy

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
4. Deploy!

### Environment Variables for Production

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for African student entrepreneurs
