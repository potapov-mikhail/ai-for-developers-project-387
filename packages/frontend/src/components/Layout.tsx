import { NavLink, Outlet } from 'react-router';
import { cn } from '@/lib/utils';

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
          isActive && 'border-border bg-background text-foreground shadow-sm',
        )
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm text-white">
              C
            </span>
            Calendar
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavItem to="/booking">Записаться</NavItem>
            <NavItem to="/events">Предстоящие события</NavItem>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
