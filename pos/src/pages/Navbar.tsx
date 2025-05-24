import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingBag, LogOut, Ticket } from 'lucide-react';

export function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="border-b bg-background">
      <div className="flex h-14 items-center px-4 justify-between">
        <h1 className="text-lg font-semibold">HealthTech POS - {getPageTitle()}</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              0
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>HT</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">HealthTech User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@healthtech.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Ticket className="mr-2 h-4 w-4" />
                <span>Raise Support Ticket</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
} 