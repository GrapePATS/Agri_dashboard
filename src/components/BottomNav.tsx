import { NavLink, useLocation } from 'react-router-dom';
import { Home, BrainCircuit, ClipboardList } from 'lucide-react';

const tabs = [
  { path: '/', label: 'หน้าแรก', Icon: Home },
  { path: '/ai-summary', label: 'AI', Icon: BrainCircuit },
  { path: '/tasks', label: 'งานที่ต้องทำ', Icon: ClipboardList },
];

export function BottomNav() {
  const location = useLocation();

  // Hide bottom nav on deep-link pages (accessed from home cards)
  const hideOnPaths = ['/map', '/detections', '/reports', '/yield'];
  const shouldHide =
    hideOnPaths.some((p) => location.pathname === p) ||
    location.pathname.startsWith('/detections/');
  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-stone-200 z-50">
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
                className={isActive ? 'text-green-700' : 'text-stone-400'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] font-medium leading-tight ${isActive ? 'text-green-700' : 'text-stone-400'}`}
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
