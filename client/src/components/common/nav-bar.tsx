import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useUser } from "@/hooks/use-user";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import { GHANA_COLORS } from "@/lib/constants";

export function NavBar() {
  const { user, logout } = useUser();

  return (
    <nav className="border-b" style={{ borderColor: GHANA_COLORS.green }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold" style={{ color: GHANA_COLORS.red }}>
            Ghana RTI
          </a>
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="space-x-4">
            <NavigationMenuItem>
              <Link href="/requests">
                <a className="hover:text-primary">Requests</a>
              </Link>
            </NavigationMenuItem>
            
            {user ? (
              <>
                {user.role === "admin" && (
                  <NavigationMenuItem>
                    <Link href="/admin">
                      <a className="hover:text-primary">Admin</a>
                    </Link>
                  </NavigationMenuItem>
                )}
                <NavigationMenuItem>
                  <Button 
                    variant="ghost" 
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <Link href="/auth">
                  <Button variant="default">Login</Button>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
