import type { AchievementItem } from '@/types/portfolio';

/**
 * Verified achievement & credential milestones backed directly by
 * public/assets/resume/Austin_Joshua_Resume.pdf and src/data/projects.ts.
 */
export const achievementsData: readonly AchievementItem[] = [
  {
    id: 'techathon-2k26',
    title: 'Best Performance Award — Techathon 2K26',
    issuer: 'Techathon 2K26 (Team TechNova)',
    date: '2026',
    context:
      'Recognized for AgriFlux, an AI-driven agriculture and crop intelligence platform built with React, TypeScript, Node.js, Python, and GitHub Actions.',
    accent: 'gold',
    verificationUrl: 'https://github.com/Austin-Joshua/AgriFlux',
  },
  {
    id: 'code-of-thrones',
    title: 'Best Prototype Award — Code of Thrones',
    issuer: 'Code of Thrones National Competition (120 teams)',
    date: 'National · 120 teams',
    context:
      'Awarded for CIVIQ, a municipal waste-management and routing operations platform built with Next.js, Go (Gin), and MongoDB.',
    accent: 'copper',
    verificationUrl: 'https://github.com/Austin-Joshua/CIVIQ',
  },
  {
    id: 'innoclash-26',
    title: "Impact Ignite Award — INNOCLASH '26",
    issuer: "INNOCLASH '26 (International)",
    date: '2026',
    context:
      'Honored for ResQ Meal, a real-time food-redistribution platform matching surplus meals with NGOs via React, TypeScript, Spring Boot, MySQL, and Socket.IO.',
    accent: 'primary',
    verificationUrl: 'https://github.com/Austin-Joshua/ResQ_Meal',
  },
];
