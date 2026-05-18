import { NavLink, useLocation } from 'react-router-dom';
import { Home, BrainCircuit, ClipboardList } from 'lucide-react';

const tabs = [
  { path: '/', label: 'หน้าแรก', Icon: Home },
  { path: '/ai-summary', label: 'AI', Icon: BrainCircuit },
  { path: '/tasks', label: 'งานที่ต้องทำ', Icon: ClipboardList },
];

interface BottomNavProps {
  hidden?: boolean;
}

export function BottomNav({ hidden = false }: BottomNavProps) {
  const location = useLocation();

  // hidden prop: return null so component is fully unmounted (no DOM node,
  // no z-index participation, no touch-event leakage through overlays)
  if (hidden) return null;

  return (
    // z-40 so backdrops (z-50) and sheets (z-60) render above it
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[#d2e5d3] z-40">
      <div className="flex items-stretch h-16">
        {tabs.map(({ path, label, Icon }) => {
          const isActive =
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors"
            >
              <Icon
                size={22}
                className={isActive ? 'text-[#1d6233]' : 'text-stone-400'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] font-medium leading-tight ${isActive ? 'text-[#1d6233]' : 'text-stone-400'}`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
