# AdminFlow: User/Team Management System (Prototype)

A comprehensive system for managing users and teams with approval workflows, GitHub and Slack integration, and annual information updates.

## Features

- **User Registration and Approval Workflow**: New users register and administrators approve requests
- **Team Management**: Create and manage teams with public/private visibility
- **External Integrations**: Automatic sync with GitHub organizations and Slack workspaces
- **Annual Updates**: Send yearly requests for users to update their information

## Tech Stack

- **Frontend**: React with Next.js, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js
- **Email**: Mailgun integration
- **External APIs**: GitHub API, Slack API

## Demo Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (optional for full functionality)

### Quick Start for Presentation/Demo

The system is configured to run in demo mode without requiring actual API keys:

1. **Clone the repository and install dependencies**

```bash
git clone https://github.com/your-username/adminflow.git
cd adminflow
bun install
```

2. **Run database migrations (if using a real PostgreSQL database)**

```bash
bunx prisma migrate dev
```

If you just want to run the demo without a database, you can generate the Prisma client:

```bash
bunx prisma generate
```

3. **Start the development server**

```bash
bun run dev
```

4. **Access the application**

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Admin User**:
  - Email: admin@demo.com
  - Password: admin123

- **Regular User**:
  - Email: user@demo.com
  - Password: user123

## Demo Mode

The application is configured to run in "demo mode" which means:

- External integrations (GitHub, Slack, Email) will log actions to the console rather than making API calls
- Predefined users are available for testing
- All functionality can be demonstrated without actual API keys

## Key Demo Flows

1. **User Registration Process**:
   - Navigate to `/register`
   - Fill and submit the registration form
   - Log in as admin and approve the registration
   - Observe the GitHub/Slack integration logs in the console

2. **Team Management**:
   - Log in as admin
   - Create a new team
   - Add members to the team
   - View the public team display

3. **Annual Update Request**:
   - Log in as admin
   - Send annual update requests
   - View the update statistics

## Production Deployment

For a production deployment, you would need to:

1. Set up actual API keys for GitHub, Slack, and Mailgun
2. Configure a PostgreSQL database
3. Set up proper authentication with NextAuth providers
4. Deploy to a hosting service (Vercel, Netlify, etc.)

## License

MIT
