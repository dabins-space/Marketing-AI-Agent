# Marketing AI Agent

AI-powered marketing strategy and calendar management tool built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🤖 AI-powered marketing strategy recommendations
- 📅 Calendar integration with Google Calendar
- 📊 Marketing analytics and insights
- 🎯 Customizable action plans
- 📱 Responsive design for mobile and desktop
- ⚡ Real-time chat interface with AI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Marketing-AI-Agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
vercel --prod
```

## Environment Variables

Copy `env.example` to `.env.local` and configure the following variables:

- `NEXT_PUBLIC_APP_URL` - Your app URL
- `NEXT_PUBLIC_APP_NAME` - Your app name
- Additional API keys and configuration as needed

For production deployment on Vercel, set these variables in the Vercel dashboard under Settings > Environment Variables.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── ChatSection.tsx   # Chat interface
│   ├── CalendarSection.tsx # Calendar view
│   └── StrategyModal.tsx # Strategy selection modal
├── public/               # Static assets
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

