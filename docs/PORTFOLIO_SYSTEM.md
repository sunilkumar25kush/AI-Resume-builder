# Portfolio Builder Architecture & Design System

## Overview
The AI Resume & Portfolio Builder provides a modern, responsive, and data-driven portfolio generation system. Candidates can convert existing parsed resume data into production-ready web portfolios or design their own from scratch.

## Active Templates Architecture
Following the template optimization, the system maintains 6 core templates designed for diverse professional aesthetics:

| Template ID | Name | Target Persona | Key Design Features |
| :--- | :--- | :--- | :--- |
| `spotlight` | **Spotlight** | Frontend/Full-Stack, Tech Leads | Obsidian & Crimson palette, hanging portrait with halo sway, connected SVG expertise tree, live metrics |
| `poster` | **Poster Brutalist** | Architects, Visual Artists, Creatives | Monochrome typography, dynamic `vw` headline sizing, infinite marquee ticker ribbon, 4-column staggered cards |
| `devport` | **DevPort** | Cloud Devs, Software Engineers | Cosmic dark aesthetic, orbital avatar ring, tech badge grid, floating experience card |
| `creative` | **Modern 3D** | Product Designers, Modern Creators | Midnight indigo theme, 3D avatar spotlight, electric purple gradient, glassmorphic surfaces |
| `developer` | **Developer** | Backend, Systems Architects | Terminal CLI accents, GitHub repository highlights, monospace code syntax |
| `minimal` | **Minimalist** | Executives, Technical Writers | Refined whitespace, single-column reading, distraction-free typography |

## Theme Isolation & Token Propagation
Templates execute inside `ThemeWrapper`, which isolates CSS variables (`--portfolio-primary`, `--portfolio-font`, `--portfolio-theme`) from the parent application CSS to prevent style leaks.

## Data Normalization Pipeline
1. **Resume Input**: Raw or parsed resume data is passed to `adaptResumeToPortfolio()`.
2. **Field Normalization**: Contact details, social profiles, skills, work history, projects, and education are normalized.
3. **Template Fallbacks**: Missing optional fields (e.g., certifications, avatars) are gracefully hidden without layout collapse.
