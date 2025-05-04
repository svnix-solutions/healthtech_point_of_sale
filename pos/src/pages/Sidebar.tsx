import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, ShoppingBag, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  {
    title: 'Orders',
    icon: ShoppingBag,
    href: '/orders',
  },
  {
    title: 'Diagnostics',
    icon: Stethoscope,
    href: '/diagnostics',
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">HealthTech POS</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Overview
            </h2>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Settings
            </h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 