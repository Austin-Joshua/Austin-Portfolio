import type { ProfileData } from '@/types/portfolio';

export const profileData: ProfileData = {
  name: 'Austin Joshua',
  roleLabel: 'Computer Science Engineering Student · Software & AI Developer',
  heroTagline:
    'Building full-stack web applications and AI-driven systems with Python, TypeScript, React, and modern cloud tooling.',
  aboutParagraphs: [
    'I am a third-year B.E. Computer Science and Engineering student at Rajalakshmi Institute of Technology (2024–2028) in Chennai, focused on full-stack software development, Python backend systems, and applied machine learning.',
    'Across hackathon-awarded team projects including AgriFlux, CIVIQ, and ResQ Meal, I have engineered production-oriented web platforms with React, Next.js, TypeScript, Node.js, Go, Spring Boot, and scikit-learn—alongside leading the Infinitus Mathematics Club at RIT.',
  ],
  aboutPendingNotice:
    'Verified personal narrative and academic profile details will be published here prior to release.',
  portrait: {
    src: '/assets/portrait/austin-joshua-cutout.png',
    alt: 'Austin Joshua — Computer Science Engineering student and developer',
    width: 376,
    height: 732,
  },
  resume: {
    url: '/assets/resume/Austin_Joshua_Resume.pdf',
    label: 'Download Résumé',
    sizeLabel: 'PDF',
  },
};
