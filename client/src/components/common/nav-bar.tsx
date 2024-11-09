import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import { GHANA_COLORS } from "@/lib/constants";
import { useMemo } from "react";
import { NotificationsPopover } from "./notifications";

export function NavBar() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();

  // Memoize navigation function to prevent unnecessary re-renders
  const navigateTo = useMemo(() => (path: string) => {
    setLocation(path);
  }, [setLocation]);

  return (
    <nav className="border-b" style={{ borderColor: GHANA_COLORS.green }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="text-2xl font-bold hover:opacity-80 transition-opacity p-0"
          style={{ color: GHANA_COLORS.red }}
          onClick={() => navigateTo("/")}
        >
          Ghana RTI
        </Button>

        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-6">
            <NavigationMenuItem>
              <Button
                variant="ghost"
                className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => navigateTo("/requests")}
              >
                Requests
              </Button>
            </NavigationMenuItem>
            
            {user ? (
              <>
                {user.role === "admin" && (
                  <NavigationMenuItem>
                    <Button
                      variant="ghost"
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => navigateTo("/admin")}
                    >
                      Admin
                    </Button>
                  </NavigationMenuItem>
                )}
                <NavigationMenuItem>
                  <NotificationsPopover />
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button 
                    variant="outline"
                    className="font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <Button 
                  variant="default"
                  className="font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigateTo("/auth")}
                >
                  Login
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
