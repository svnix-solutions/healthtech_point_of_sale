import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = 'dummy-token';
      login(token);
      toast.success('Login successful');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Banner */}
      <div className="h-full lg:h-screen w-full lg:w-1/2 bg-primary flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 text-primary-foreground">
        <div className="max-w-md text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Welcome to HealthTech POS</h1>
          <p className="text-sm sm:text-base mb-4 sm:mb-6 text-primary-foreground/80">
            Streamline your healthcare business operations with our comprehensive Point of Sale system.
          </p>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground/80" />
              <p className="text-sm">Manage inventory efficiently</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground/80" />
              <p className="text-sm">Track sales and revenue</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground/80" />
              <p className="text-sm">Generate detailed reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="h-full lg:h-screen w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login; 