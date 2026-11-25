import type { SkillCategory } from '@/types/portfolio';

export const skillsData: readonly SkillCategory[] = [
  {
    id: 'languages',
    label: 'Languages',
    description: 'Programming languages used across projects.',
    items: [
      { id: 'python', name: 'Python' },
      { id: 'typescript', name: 'TypeScript' },
      { id: 'javascript', name: 'JavaScript' },
      { id: 'java', name: 'Java' },
      { id: 'cpp', name: 'C++' },
      { id: 'sql', name: 'SQL' },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    description: 'UI frameworks, 3D graphics and design systems.',
    items: [
      { id: 'react', name: 'React' },
      { id: 'threejs', name: 'Three.js' },
      { id: 'r3f', name: 'React Three Fiber' },
      { id: 'tailwind', name: 'Tailwind CSS' },
      { id: 'vite', name: 'Vite' },
      { id: 'gsap', name: 'GSAP' },
    ],
  },
  {
    id: 'ai-ml',
    label: 'AI & ML',
    description: 'Machine learning frameworks and AI tooling.',
    items: [
      { id: 'pytorch', name: 'PyTorch' },
      { id: 'tensorflow', name: 'TensorFlow' },
      { id: 'sklearn', name: 'scikit-learn' },
      { id: 'transformers', name: 'HuggingFace Transformers' },
      { id: 'langchain', name: 'LangChain' },
      { id: 'openai', name: 'OpenAI API' },
    ],
  },
  {
    id: 'backend-infra',
    label: 'Backend & Infra',
    description: 'Server-side, cloud and DevOps tooling.',
    items: [
      { id: 'nodejs', name: 'Node.js' },
      { id: 'fastapi', name: 'FastAPI' },
      { id: 'docker', name: 'Docker' },
      { id: 'git', name: 'Git' },
      { id: 'postgresql', name: 'PostgreSQL' },
      { id: 'firebase', name: 'Firebase' },
    ],
  },
];
