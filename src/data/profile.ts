import type { ProfileData } from '@/types/portfolio';

export const profileData: ProfileData = {
  name: 'Austin Joshua',
  roleLabel: 'Software Engineer & AI Systems Developer',
  heroTagline:
    'Building intelligent systems at the intersection of software engineering, machine learning, and interactive 3D craft.',
  aboutParagraphs: [
    'I am a software engineer with a passion for crafting intelligent, high-performance systems. My work spans full-stack development, AI/ML pipelines, and interactive 3D experiences.',
    'I thrive at the intersection of rigorous engineering and creative problem-solving — turning complex technical challenges into polished, user-centred products.',
  ],
  aboutPendingNotice:
    'Verified personal narrative and academic profile details will be published here prior to release.',
  portrait: {
    src: '/assets/portrait/austin-joshua.jpg',
    alt: 'Austin Joshua — Software Engineer',
    width: 760,
    height: 1013,
  },
  resume: {
    url: '/assets/resume/Austin_Joshua_Resume.pdf',
    label: 'Download Résumé',
    sizeLabel: 'PDF',
  },
};
