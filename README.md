# CECSA Control de Plagas | Technical Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer--Motion-663399?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

A high-performance, SEO-optimized, and premium web application built for **CECSA Control de Plagas**, a specialized pest control company based in Barcelona. This platform follows a "Sanitary Premium Clean" design philosophy, focusing on technical authority, trust, and conversion.

## 🚀 Key Features

- **Technical SEO Engine**: Advanced metadata management with `react-helmet-async`, automated `sitemap.xml` generation, and semantic HTML5 architecture.
- **Multilingual Architecture**: Fully internationalized with `react-i18next`, supporting Catalan (Primary), Spanish, and English.
- **Performance Optimized**: Leverages Vite's modern build pipeline, React Suspense for lazy-loaded components, and selective code splitting to achieve near-perfect Lighthouse scores.
- **Micro-Animations**: Smooth, professional transitions and interactive elements using `framer-motion` to enhance user engagement.
- **Responsive "Liquid" Layout**: Mobile-first design with specific optimizations for landscape orientations and ultra-wide displays.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4.
- **Routing**: React Router v6 with dynamic SEO canonicals.
- **State Management**: Redux Toolkit for complex UI states.
- **Icons**: Lucide React for consistent, accessible iconography.
- **Internalization**: i18next with browser language detection and fallback logic.

## 📐 Design Philosophy: "Sanitary Premium Clean"

The UI was designed to reflect CECSA's "Ethical and Conscious" approach to pest control:
- **Authority**: Use of corporate blue (`#0080bb`) and clinical white spaces.
- **Transparency**: Clear, technical protocols and high-resolution species identification grids.
- **Trust**: Integration of official certifications (ROESB, ISO 9001) and real testimonials.

## 📁 Project Structure

```bash
├── frontend/
│   ├── src/
│   │   ├── components/  # Modular UI elements
│   │   ├── pages/       # High-performance SPA routes
│   │   ├── locales/     # i18n translation bundles
│   │   └── store/       # Redux logic
│   └── public/          # Static assets & SEO files
├── backend/             # Django-based service auditor (Syncing logic)
└── scripts/             # Automation and maintenance tools
```

## 📈 SEO Performance

This project implements a robust SEO strategy:
- **Dynamic Meta Tags**: Unique titles and descriptions for every sector and service page.
- **Schema.org Integration**: JSON-LD structured data for LocalBusiness and Services.
- **Canonicalization**: Automated logic to prevent duplicate content indexing issues.

---

*This project is part of a high-end technical solution for the sanitary sector in Catalonia.*
