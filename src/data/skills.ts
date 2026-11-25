import type { SkillCategory } from '@/types/portfolio';

export const skillsData: readonly SkillCategory[] = [
  {
    id: 'languages-databases',
    label: 'Languages & Databases',
    description: 'Core languages and databases verified across coursework, résumé, and shipped repositories.',
    items: [
      { id: 'python', name: 'Python' },
      { id: 'typescript', name: 'TypeScript' },
      { id: 'javascript', name: 'JavaScript' },
      { id: 'java', name: 'Java' },
      { id: 'go', name: 'Go' },
      { id: 'mysql', name: 'MySQL' },
      { id: 'mongodb', name: 'MongoDB' },
    ],
  },
  {
    id: 'frameworks-ui',
    label: 'Frameworks & Web',
    description: 'Frontend, real-time, and spatial web frameworks used across production repositories.',
    items: [
      { id: 'react', name: 'React' },
      { id: 'nextjs', name: 'Next.js' },
      { id: 'nodejs', name: 'Node.js' },
      { id: 'springboot', name: 'Spring Boot' },
      { id: 'fastapi', name: 'FastAPI' },
      { id: 'threejs', name: 'Three.js' },
      { id: 'tailwind', name: 'Tailwind CSS' },
    ],
  },
  {
    id: 'ai-data',
    label: 'AI & Data Libraries',
    description: 'Python data analysis and classical machine learning libraries backed by project code.',
    items: [
      { id: 'sklearn', name: 'scikit-learn' },
      { id: 'pandas', name: 'Pandas' },
      { id: 'numpy', name: 'NumPy' },
    ],
  },
  {
    id: 'tools-infra',
    label: 'Tools & Infrastructure',
    description: 'Version control, containerization, and CI/CD automation tools.',
    items: [
      { id: 'git', name: 'Git' },
      { id: 'docker', name: 'Docker' },
      { id: 'github-actions', name: 'GitHub Actions' },
      { id: 'socketio', name: 'Socket.IO' },
    ],
  },
];
