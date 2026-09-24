'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    roleCode?: string;
  };
}

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getRoleLabel(roleCode?: string): string {
  const labels: Record<string, string> = {
    user: 'User',
    admin: 'Admin',
    developer: 'Developer',
  };
  return roleCode ? labels[roleCode] || roleCode : '';
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-10 w-10 rounded-full hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {user.roleCode && (
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {getRoleLabel(user.roleCode)}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
