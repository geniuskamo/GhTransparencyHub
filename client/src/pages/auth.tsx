import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GHANA_COLORS } from "@/lib/constants";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle 
              className="text-center"
              style={{ color: GHANA_COLORS.red }}
            >
              {isLogin ? "Login" : "Register"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLogin ? <LoginForm /> : <RegisterForm />}
            
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                style={{ color: GHANA_COLORS.green }}
              >
                {isLogin 
                  ? "Don't have an account? Register" 
                  : "Already have an account? Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
