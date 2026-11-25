import type { ProjectItem } from '@/types/portfolio';

export const projectsData: readonly ProjectItem[] = [
  {
    slug: 'agriflux',
    indexCode: 'P-01',
    title: 'AgriFlux',
    category: 'ai-ml',
    categoryLabel: 'AI & ML',
    summary:
      'AI-driven agricultural intelligence and autonomous irrigation platform delivering crop insights and data-backed recommendations for smallholder farmers.',
    role: 'Full-Stack & AI Developer (Team TechNova)',
    stack: ['React', 'TypeScript', 'Node.js', 'Python', 'MongoDB', 'Docker', 'GitHub Actions'],
    skillIds: ['react', 'typescript', 'nodejs', 'python', 'mongodb', 'docker', 'git', 'github-actions'],
    problem:
      'Smallholder farms and agricultural cooperatives lack unified decision tools connecting field telemetry, environmental datasets, and actionable irrigation/crop guidance.',
    approach:
      'Built a React + TypeScript frontend integrated with a Node.js/Express and Python backend backed by MongoDB, container packaging with Docker, and automated CI/CD checks via GitHub Actions.',
    outcomes: ['Best Performance Award — Techathon 2K26'],
    links: {
      github: 'https://github.com/Austin-Joshua/AgriFlux',
      live: 'https://agri-flux-sandy.vercel.app',
    },
  },
  {
    slug: 'civiq',
    indexCode: 'P-02',
    title: 'CIVIQ',
    category: 'software-engineering',
    categoryLabel: 'Software Engineering',
    summary:
      'Municipal waste-management operations platform unifying smart-bin tracking, collection routing, zone alerts, and field team workflows.',
    role: 'Full-Stack Developer (Team TechNova)',
    stack: ['Next.js', 'React', 'TypeScript', 'Go', 'MongoDB', 'Tailwind CSS'],
    skillIds: ['nextjs', 'react', 'typescript', 'go', 'mongodb', 'tailwind'],
    problem:
      'Municipal sanitation teams need coordinated visibility across zone sensors, pickup routing, and field resolution statuses without brittle ad-hoc spreadsheets.',
    approach:
      'Architected a Next.js App Router TypeScript dashboard proxying `/api/*` requests to a Go (Gin) REST API service with JWT auth and MongoDB persistence.',
    outcomes: ['Best Prototype Award — Code of Thrones (National, 120 teams)'],
    links: {
      github: 'https://github.com/Austin-Joshua/CIVIQ',
      live: 'https://civiq-frontend.vercel.app',
    },
  },
  {
    slug: 'resq-meal',
    indexCode: 'P-03',
    title: 'ResQ Meal',
    category: 'software-engineering',
    categoryLabel: 'Software Engineering',
    summary:
      'Real-time food-redistribution platform matching surplus restaurant meals with nearby NGOs and volunteers using live delivery coordination.',
    role: 'Full-Stack Developer (Team TechNova)',
    stack: ['React', 'TypeScript', 'Spring Boot', 'Java', 'MySQL', 'Socket.IO', 'Docker'],
    skillIds: ['react', 'typescript', 'springboot', 'java', 'mysql', 'socketio', 'docker'],
    problem:
      'Perishable surplus food from restaurants often expires before charities and volunteers can discover, claim, and coordinate safe pickup windows.',
    approach:
      'Implemented surplus listing, location- and capacity-aware matching, multilingual support, and live Socket.IO event notifications backed by Spring Boot, MySQL, and Docker Compose.',
    outcomes: ['Impact Ignite Award — INNOCLASH \'26 (International)'],
    links: {
      github: 'https://github.com/Austin-Joshua/ResQ_Meal',
      live: null,
    },
  },
  {
    slug: 'rit-digital-twin',
    indexCode: 'P-04',
    title: 'RIT Digital Twin',
    category: 'interactive-3d',
    categoryLabel: 'Interactive 3D',
    summary:
      'Spatial campus digital twin and ERP planning dashboard with explicit simulation sourcing across buildings, timetables, occupancy estimates, and alerts.',
    role: 'Developer',
    stack: ['React', 'JavaScript', 'Three.js', 'Spring Boot', 'Java', 'MySQL'],
    skillIds: ['react', 'javascript', 'threejs', 'springboot', 'java', 'mysql'],
    problem:
      'Campus operations staff require a unified spatial view connecting classroom schedules, capacity estimates, and operational alerts with transparent source attribution.',
    approach:
      'Built an interactive spatial frontend with React, Three.js, and Leaflet backed by a Spring Boot and MySQL API enforcing explicit simulation vs. historical data labels.',
    links: {
      github: 'https://github.com/Austin-Joshua/RIT-Digital-Twin',
      live: 'https://digital-twin-lemon.vercel.app',
    },
  },
  {
    slug: 'neuroram',
    indexCode: 'P-05',
    title: 'NeuroRAM',
    category: 'ai-ml',
    categoryLabel: 'AI & ML',
    summary:
      'Predictive system memory telemetry tool combining live RAM/swap monitoring, historical logging, and scikit-learn forecasting in a FastAPI + React dashboard.',
    role: 'Author',
    stack: ['Python', 'FastAPI', 'scikit-learn', 'Pandas', 'NumPy', 'React'],
    skillIds: ['python', 'fastapi', 'sklearn', 'pandas', 'numpy', 'react'],
    problem:
      'Standard OS monitors inspect instantaneous memory consumption without historical telemetry forecasting or risk scoring before swap pressure degrades responsiveness.',
    approach:
      'Combined Python system telemetry collection, SQLite time-series storage, and RandomForest regression via scikit-learn exposed through FastAPI endpoints.',
    links: {
      github: 'https://github.com/Austin-Joshua/NeuroRAM',
      live: null,
    },
  },
];
