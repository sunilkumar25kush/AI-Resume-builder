# Application Flows & Interaction Architecture
## Portfolio Builder Integration for AI Resume Builder

**Document Version:** 1.0.0  
**Status:** Approved System Diagrams  
**Last Updated:** October 24, 2026  

---

## 1. Existing Portfolio Rendering Flow

This diagram illustrates the **verified active rendering pipeline** in `client/src/components/portfolios/`:

```mermaid
flowchart TD
    subgraph StateAndPages["Page & State Layer (Verified)"]
        EditorPage["PortfolioEditorPage.tsx / PublicPortfolioPage.tsx"]
        ZustandStore["usePortfolioStore / Zustand State"]
    end

    subgraph RendererLayer["Rendering Core (Verified)"]
        Renderer["PortfolioRenderer.tsx"]
        Theme["ThemeWrapper.tsx<br/>(Injects CSS Variables & Color Tokens)"]
        RegistryResolver["getPortfolioTemplate(design.template)<br/>in registry.ts"]
    end

    subgraph TemplateRegistry["Allowlist Registry (Verified)"]
        DevPort["DevPortTemplate.tsx (Default)"]
        Creative["ModernCreativeTemplate.tsx"]
        Developer["DeveloperTemplate.tsx"]
        Minimal["MinimalTemplate.tsx"]
    end

    subgraph SectionPipeline["Section Execution (Verified)"]
        SectionOrder["Resolve sectionOrder<br/>['hero', 'about', 'skills', 'projects', ...]"]
        VisibilityFilter["Filter out hiddenSections<br/>from design.sectionVisibility"]
        RenderDOM["Render Isolated Template DOM"]
    end

    EditorPage --> ZustandStore
    ZustandStore --> Renderer
    Renderer --> Theme
    Renderer --> RegistryResolver
    RegistryResolver -->|id: 'devport'| DevPort
    RegistryResolver -->|id: 'creative'| Creative
    RegistryResolver -->|id: 'developer'| Developer
    RegistryResolver -->|id: 'minimal'| Minimal
    RegistryResolver -->|unknown / null| DevPort
    
    DevPort & Creative & Developer & Minimal --> SectionOrder
    SectionOrder --> VisibilityFilter
    VisibilityFilter --> RenderDOM
```

---

## 2. Proposed End-to-End User Journey

This flow shows how a candidate moves seamlessly from an **ATS Resume** to a **Published Web Portfolio**:

```mermaid
journey
    title Candidate Journey: From ATS Resume to Live 3D / Web Portfolio
    section 1. Resume Creation
      Build or upload ATS Resume: 5: Candidate
      Run AI Job Optimization & ATS Scoring: 5: Candidate, Gemini AI
      Download ATS-Friendly PDF for Job Portals: 5: Candidate, Puppeteer
    section 2. 1-Click Portfolio Creation
      Click 'Create Web Portfolio' in Resume Studio: 5: Candidate
      Backend executes automatic data conversion: 5: System (portfolio.service.js)
      Auto-generates unique URL slug (/p/alex-kumar): 5: System
    section 3. Template Selection & Preview
      Explore template categories (3D, Motion, Editorial): 4: Candidate
      Live preview updates with real resume projects: 5: Candidate, Frontend
      Test responsive preview (Mobile / Tablet / Desktop): 4: Candidate
    section 4. Customization & Polish
      Reorder sections (drag & drop): 4: Candidate
      Adjust color theme (Cyberpunk Neon / Emerald): 4: Candidate
      Toggle section visibility: 4: Candidate
    section 5. Publishing & Sharing
      Click 'Publish' to make public: 5: Candidate
      Share live link (gitskins.com/p/alex-kumar) on LinkedIn: 5: Candidate
      Download standalone ZIP or copy GitHub README: 5: Candidate
```

---

## 3. Resume-to-Portfolio Generation Flow

Detailed execution sequence of the **1-Click Conversion Bridge**:

```mermaid
sequenceDiagram
    autonumber
    actor User as Candidate
    participant UI as ResumeEditorPage.tsx
    participant API as portfolio.controller.js
    participant Service as portfolio.service.js
    participant SlugGen as generateUniqueSlug()
    participant DB as MongoDB (Portfolio)
    participant PortUI as PortfolioEditorPage.tsx

    User->>UI: Clicks "Convert to Portfolio"
    UI->>API: POST /api/portfolios/from-resume/:resumeId
    Note over API: Verifies JWT authentication & ownership
    API->>Service: createPortfolioFromResume(userId, resumeId)
    Service->>DB: Query Resume by _id & userId
    DB-->>Service: Returns full Resume Document
    Service->>SlugGen: generateUniqueSlug(fullName)
    SlugGen->>DB: Check if slug exists
    DB-->>SlugGen: Conflict check false
    SlugGen-->>Service: Returns unique slug ("alex-kumar")
    Service->>Service: Map contact, bio, experience, skills, projects
    Service->>DB: Save new Portfolio document (status: Draft)
    DB-->>Service: Saved Document
    Service-->>API: Returns created Portfolio
    API-->>UI: 201 Created (portfolioId, slug)
    UI->>PortUI: Navigate to /portfolios/:portfolioId/edit
    PortUI->>User: Displays live editor with pre-filled content
```

---

## 4. Template Selection & Customization Flow

Illustrates how template switches, color themes, and dynamic layout mutations occur without data loss:

```mermaid
flowchart TD
    subgraph UserAction["User Customization (Client)"]
        SelectTemplate["Select Template<br/>(e.g. 'ramen-shop' / 'motion-studio')"]
        ChangeTheme["Select Theme<br/>(e.g. 'Cyberpunk Neon', 'Emerald')"]
        ReorderSections["Drag & Drop Section Order<br/>(@dnd-kit/sortable)"]
        ToggleVisibility["Toggle Section Visibility<br/>(Eye icon click)"]
    end

    subgraph ZustandStore["Zustand State Store (stores/portfolios.ts)"]
        UpdateDesign["updateDesign({ template, theme, sectionOrder, sectionVisibility })"]
        DebounceSync["Debounced Auto-Save (500ms)"]
    end

    subgraph MasterRenderer["PortfolioRenderer.tsx"]
        ResolveAllowlist["getPortfolioTemplate(template)"]
        
        subgraph Templates["Template Execution (Code-Split)"]
            T_3D["React.lazy(RamenShopTemplate)<br/>(Three.js WebGL Canvas)"]
            T_Motion["React.lazy(MotionCanvasTemplate)<br/>(Framer Motion Layout)"]
            T_Static["DevPortTemplate / MinimalTemplate<br/>(Immediate Load)"]
        end
        
        ThemeWrapper["ThemeWrapper.tsx<br/>(Sets CSS Custom Properties)"]
        Attribution["AttributionFooter.tsx<br/>(Displays Creator Credits)"]
    end

    subgraph BackendSync["Server Persistence"]
        PatchAPI["PATCH /api/portfolios/:id"]
        MongoUpdate["MongoDB Portfolio.design updated"]
    end

    SelectTemplate & ChangeTheme & ReorderSections & ToggleVisibility --> UpdateDesign
    UpdateDesign --> ThemeWrapper
    ThemeWrapper --> ResolveAllowlist
    ResolveAllowlist -->|3D| T_3D
    ResolveAllowlist -->|Motion| T_Motion
    ResolveAllowlist -->|2D Standard| T_Static
    T_3D & T_Motion & T_Static --> Attribution
    
    UpdateDesign --> DebounceSync
    DebounceSync --> PatchAPI
    PatchAPI --> MongoUpdate
```

---

## 5. Portfolio Publishing & Public Access Flow

Illustrates public URL resolution, caching, access control, and 404 security handling:

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Public Recruiter / Visitor
    participant Browser as Web Browser
    participant Router as React Router (/p/:slug)
    participant PublicPage as PublicPortfolioPage.tsx
    participant API as portfolio.controller.js
    participant DB as MongoDB (Portfolio)

    Visitor->>Browser: Enters https://yourdomain.com/p/alex-kumar
    Browser->>Router: Matches public route pattern /p/:slug
    Router->>PublicPage: Mounts PublicPortfolioPage
    PublicPage->>API: GET /api/portfolios/public/alex-kumar
    Note over API: Rate limit check (max 100 req/15min)
    API->>DB: Query Portfolio by { slug: "alex-kumar", published: true }
    alt Portfolio is Published
        DB-->>API: Returns Portfolio document
        API-->>PublicPage: 200 OK (Cache-Control: public, max-age=60)
        PublicPage->>Browser: Renders portfolio view with attribution footer
    else Portfolio is Draft or Non-Existent
        DB-->>API: Returns null
        API-->>PublicPage: 404 Not Found
        PublicPage->>Browser: Displays friendly "Portfolio Private or Not Found"
    end
```

---

## 6. Standalone Portfolio ZIP Export Flow

Shows how the backend packages complete offline web applications:

```mermaid
sequenceDiagram
    autonumber
    actor User as Candidate
    participant UI as PortfolioExportToolbar.tsx
    participant API as portfolio.controller.js
    participant Exporter as portfolioExport.service.js
    participant Archiver as Archiver Library (^8.0.0)
    participant ClientDL as Browser Download Manager

    User->>UI: Clicks "Download Standalone Site (ZIP)"
    UI->>API: GET /api/portfolios/:id/export
    Note over API: Verifies user is portfolio owner
    API->>Exporter: exportPortfolioZip(portfolioId, userId)
    Exporter->>Exporter: Fetch portfolio document & generate standalone index.html
    Exporter->>Exporter: Inline CSS custom properties & scoped styles
    Exporter->>Exporter: Embed standalone client scripts & 3D WebGL runtime
    Exporter->>Exporter: Generate deployment README.md (GitHub Pages / Vercel guide)
    Exporter->>Archiver: Create archive stream (format: 'zip')
    Archiver->>Archiver: Append index.html, assets/, and README.md
    Archiver->>Archiver: Finalize compression
    Exporter-->>API: Piped ZIP stream
    API-->>UI: 200 OK (Content-Type: application/zip)
    UI->>ClientDL: Triggers save file: "alex-kumar-portfolio.zip"
    ClientDL-->>User: File downloaded to local drive
```

---

## 7. High-Level System Architecture Diagram

```mermaid
graph TB
    subgraph ClientWorkspace["AI Resume Builder Client (client/)"]
        subgraph UIComponents["User Interface (React 19 + Tailwind v4)"]
            Navbar["Global Header & Navigation"]
            ResumeStudio["Resume Studio (11 ATS Templates)"]
            PortStudio["Portfolio Studio (Split View Editor)"]
            PublicViewer["Public Portfolio Viewer (/p/:slug)"]
        end

        subgraph StoreLayer["State Management"]
            AuthStore["auth.store.ts"]
            ResumeStore["resumes.store.ts"]
            PortStore["portfolios.store.ts"]
        end

        subgraph TemplateSystem["Portfolio Templates Engine"]
            PortRenderer["PortfolioRenderer.tsx"]
            ThemeSys["ThemeWrapper.tsx (Color Tokens)"]
            Allowlist["registry.ts (Compile-time Dispatcher)"]
            
            subgraph TemplateFiles["Registered Templates"]
                T_DevPort["DevPort (Cosmic Dark)"]
                T_Creative["Modern Creative (3D Indigo)"]
                T_Minimal["Minimal (Executive Monochrome)"]
                T_Ramen["Ramen Shop (Proposed 3D WebGL)"]
                T_Motion["Motion Canvas (Proposed Kinetic)"]
                T_OSS["Open-Source (Proposed GitSkins)"]
            end
        end
    end

    subgraph ServerWorkspace["Backend API (server/)"]
        ExpressRouter["Express 5 REST Router"]
        AuthMid["auth.middleware.js (JWT Verification)"]
        RateLimit["express-rate-limit (Public Route Protection)"]

        subgraph CoreServices["Backend Services"]
            ResumeSvc["resume.service.js (Parsing & CRUD)"]
            PortSvc["portfolio.service.js (Data Bridge & Slugs)"]
            GeminiSvc["gemini.service.js (Gemini 2.5 Flash)"]
            PuppeteerSvc["pdfExport.service.js (Pixel-Perfect A4)"]
            ArchiverSvc["portfolioExport.service.js (Offline ZIP)"]
        end

        MongooseModels["Mongoose ODM Models (User, Resume, Portfolio, JD)"]
    end

    subgraph Infrastructure["Data & External Services"]
        MongoDB[(MongoDB 7.0 Atlas)]
        Cloudinary["Cloudinary (Profile Photos & Project Media)"]
        GeminiAPI["Google Gemini Generative Language API"]
        ExternalWidgets["SkillIcons & GitHub Readme Stats APIs"]
    end

    Navbar --> ResumeStudio
    Navbar --> PortStudio
    ResumeStudio --> ResumeStore
    PortStudio --> PortStore
    PublicViewer --> PortStore
    
    PortStudio --> PortRenderer
    PortRenderer --> ThemeSys
    ThemeSys --> Allowlist
    Allowlist --> T_DevPort & T_Creative & T_Minimal & T_Ramen & T_Motion & T_OSS
    T_OSS -.-> ExternalWidgets

    ResumeStore -.-> ExpressRouter
    PortStore -.-> ExpressRouter
    
    ExpressRouter --> AuthMid
    ExpressRouter --> RateLimit
    AuthMid --> ResumeSvc & PortSvc
    RateLimit --> PortSvc
    
    ResumeSvc --> GeminiSvc
    ResumeSvc --> PuppeteerSvc
    PortSvc --> ArchiverSvc
    
    ResumeSvc & PortSvc --> MongooseModels
    MongooseModels --> MongoDB
    PortSvc -.-> Cloudinary
    GeminiSvc -.-> GeminiAPI
```

---

*Application flows and architectural diagrams complete. Fully aligned with verified codebase structure.*
