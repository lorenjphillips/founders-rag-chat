import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export function GoogleAuth() {
  const { user, isSignedIn, isLoading, signIn, signOut } = useGoogleAuth();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Button onClick={signIn} variant="outline" size="sm" className="gap-2">
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback>
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block font-medium">
            {user?.name || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}