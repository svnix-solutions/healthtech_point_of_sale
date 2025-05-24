import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, ShoppingBag, Stethoscope, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Appointments',
    icon: Calendar,
    href: '/appointments',
  },
  // {
  //   title: 'Orders',
  //   icon: ShoppingBag,
  //   href: '/orders',
  // },
  {
    title: 'Diagnostic Order',
    icon: ClipboardList,
    href: '/diagnostic-order',
  },
  {
    title: 'Diagnostics',
    icon: Stethoscope,
    href: '/diagnostics',
  },
];

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} border-r bg-background transition-all duration-300 relative`}>
      <div className="flex h-14 items-center border-b px-2 justify-between">
        {!isCollapsed && <h2 className="text-lg font-semibold">HealthTech POS</h2>}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-6 z-50 bg-background border rounded-full h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="space-y-2 py-2">
          <div className="px-1 py-1">
            {!isCollapsed && (
              <h2 className="mb-1 px-2 text-lg font-semibold tracking-tight">
                Overview
              </h2>
            )}
            <div className="space-y-0.5">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${isCollapsed ? 'px-1' : 'px-2'}`}
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-2'} h-4 w-4`} />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="px-1 py-1">
            {!isCollapsed && (
              <h2 className="mb-1 px-2 text-lg font-semibold tracking-tight">
                Settings
              </h2>
            )}
            <div className="space-y-0.5">
              <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'px-1' : 'px-2'}`}>
                <LayoutDashboard className={`${isCollapsed ? 'mx-auto' : 'mr-2'} h-4 w-4`} />
                {!isCollapsed && 'Profile'}
              </Button>
              <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'px-1' : 'px-2'}`}>
                <LayoutDashboard className={`${isCollapsed ? 'mx-auto' : 'mr-2'} h-4 w-4`} />
                {!isCollapsed && 'Settings'}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 