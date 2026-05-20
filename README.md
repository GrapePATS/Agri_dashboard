# AgriVision AI — PHUETNOI 🌾

ระบบผู้ช่วยอัจฉริยะสำหรับเกษตรกรไทย  
**A mobile-first AI farm management dashboard for Thai farmers.**

Built with React + TypeScript + Vite + Tailwind CSS. Designed for low-tech users on mobile devices (max width 430 px).

---

## Features

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Farm health overview, alerts, yield summary, AI advisor banner |
| Map | `/map` | Interactive SVG farm map — tap zones → zoom into individual trees; satellite layer with health/pest/density overlays |
| Detections | `/detections` | List of AI-detected problems (disease, pest, weed) with severity badges |
| Detection Detail | `/detections/:id` | Full detail for a single detection with bounding box, confidence, and recommendation |
| Yield | `/yield` | Yield estimates, grade breakdown (A/B/C), harvest readiness, market value |
| Reports | `/reports` | Daily / weekly / monthly farm reports with bar charts |
| Tasks | `/tasks` | Farm task list with status tracking (pending → in progress → done) |
| AI Summary | `/ai-summary` | AI-generated farm assessment with key findings and action items |

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.5 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| React Router | 6 | Client-side routing |
| TanStack Query | 5 | Server state & caching |
| Leaflet / react-leaflet | 1.9 / 4.2 | Satellite map layer |
| Supabase JS | 2 | Backend client (ready to connect) |
| Lucide React | 0.344 | Icons |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/GrapePATS/Agri_dashboard.git
cd Agri_dashboard

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Scripts

```bash
npm run build       # Production build → dist/
npm run preview     # Preview production build locally
npm run typecheck   # TypeScript type check (no emit)
npm run lint        # ESLint
```

---

## Project Structure

```
src/
├── App.tsx                  # Root router & app shell (max-w-[430px])
├── main.tsx                 # React entry point
├── index.css                # Global styles + Tailwind base
│
├── pages/                   # One file per route
│   ├── HomePage.tsx
│   ├── MapPage.tsx
│   ├── DetectionsPage.tsx
│   ├── DetectionDetailPage.tsx
│   ├── YieldPage.tsx
│   ├── ReportsPage.tsx
│   ├── TasksPage.tsx
│   └── AIPage.tsx
│
├── components/
│   ├── BottomNav.tsx        # Fixed bottom navigation (4 tabs)
│   ├── Sidebar.tsx          # Slide-in farm selector sidebar
│   ├── ai/                  # AI summary card
│   ├── detections/          # Detection card & severity badge
│   ├── home/                # Home page section components
│   │   ├── FarmHealthSection.tsx
│   │   ├── YieldSummarySection.tsx
│   │   ├── SmartAlertsSection.tsx
│   │   ├── DateFilterSection.tsx
│   │   └── MiniMapSVG.tsx   # Inline SVG mini-map used in home cards
│   ├── map/
│   │   ├── FarmMap.tsx      # Leaflet satellite map
│   │   └── FarmSvgMap.tsx   # SVG farm map with tree-level detail
│   ├── reports/             # Bar chart component
│   └── ui/                  # Shared primitives: Badge, Button, Skeleton, Spinner
│
├── hooks/                   # TanStack Query data hooks
│   ├── useFarmSummary.ts
│   ├── useDetections.ts
│   ├── useDetectionDetail.ts
│   ├── useMapData.ts
│   ├── useYieldSummary.ts
│   ├── useReports.ts
│   ├── useTasks.ts
│   ├── useDroneStatus.ts
│   ├── useAISummary.ts
│   └── useScanHistory.ts
│
└── lib/
    ├── types.ts             # All shared TypeScript interfaces
    ├── mockData.ts          # Static mock data (used by api.ts)
    └── api.ts               # API layer — currently returns mock data with simulated delay
```

---

## Mock Data & API Layer

All data is currently **mocked** in `src/lib/mockData.ts`. The `src/lib/api.ts` file acts as a real API client interface — each function simulates a network delay and returns mock data.

This makes it easy to swap in a real backend later without touching any page or component code.

**To add real data**, replace the function bodies in `src/lib/api.ts`:

```ts
// Before (mock)
export async function fetchFarmSummary(): Promise<FarmSummary> {
  await delay(600);
  return { ...FARM_SUMMARY };
}

// After (real Supabase example)
export async function fetchFarmSummary(): Promise<FarmSummary> {
  const { data, error } = await supabase
    .from('farm_summary')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
```

---

## Connecting Supabase

Supabase is already installed (`@supabase/supabase-js`). To connect:

1. Create a project at [supabase.com](https://supabase.com)
2. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Create a Supabase client (e.g. `src/lib/supabase.ts`):

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

4. Import and use `supabase` inside `src/lib/api.ts` to replace the mock functions.

---

## Key Data Types

All interfaces are defined in `src/lib/types.ts`. The most important ones:

```ts
FarmSummary       // Overall farm health, alerts, zones
Detection         // A single AI detection (disease / pest / weed)
MapData           // Zone polygons + detection markers for the map
YieldSummary      // Yield estimates, grades, harvest readiness
Task              // Farm task with priority and status
AISummary         // AI-generated assessment and action items
SvgZoneMeta       // Zone data for the SVG farm map
SvgTree           // Individual tree data (grade, fruit count, problems)
```

---

## Design Conventions

- **Color**: Green Pea `#1d6233` (primary), Sinbad `#abd8c8` (subtitle), light mint `#e9f6eb` (background)
- **Mobile-first**: Max width 430 px, centered, with `pb-24` bottom padding for the fixed nav
- **Thai + English**: UI labels are in Thai; technical keys stay in English
- **No external UI library**: All components are hand-built with Tailwind — no shadcn, MUI, etc.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push and open a Pull Request

---

## License

Private project — all rights reserved.
