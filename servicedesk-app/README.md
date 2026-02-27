# GOLI ServiceDesk - React Application

A modern IT Service Management Platform built with React, Vite, and Tailwind CSS.

## Features

- **Login System** - Secure authentication with remember me functionality
- **Dashboard** - Real-time ticket monitoring, KPI metrics, and analytics
- **Request Management** - Service request tracking with priority classification
- **Technician Assignment** - Auto-assignment engine with workload balancing
- **SLA Management** - Service level monitoring, escalations, and approvals
- **Communication Hub** - Guest notifications and feedback management
- **Financial Tracking** - Service pricing and collection management
- **Ticket Intake** - Service catalog with template-based ticket creation
- **Admin Settings** - User management, roles, and system configuration

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router 7** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd react-servicedesk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
react-servicedesk/
├── public/
│   └── logoa.png          # Application logo
├── src/
│   ├── components/        # Reusable components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── SidebarToggle.jsx
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── ServiceDeskLanding.jsx
│   │   ├── DashboardSectionA.jsx
│   │   ├── Request.jsx
│   │   ├── SectionB.jsx
│   │   ├── SectionC.jsx
│   │   ├── SectionD.jsx
│   │   ├── SectionE.jsx
│   │   ├── TicketIntake.jsx
│   │   └── AdminSettings.jsx
│   ├── App.jsx            # Main app with routes
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles with Tailwind
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Login | Login page |
| `/servicedesk` | ServiceDeskLanding | Main dashboard with My View |
| `/dashboard` | DashboardSectionA | Business Intelligence Dashboard |
| `/requests` | Request | Request Management |
| `/section-b` | SectionB | Assignment & Execution |
| `/section-c` | SectionC | Service Levels & Controls |
| `/section-d` | SectionD | Communication & Guest Experience |
| `/section-e` | SectionE | Financial & Closure |
| `/ticket-intake` | TicketIntake | Service Catalog |
| `/admin` | AdminSettings | Admin & Settings |

## Login

Use any email and password to login (demo mode enabled).

## License

© 2025 GOLI. All rights reserved.
