import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrappeAuth, AuthCredentials } from 'frappe-react-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useFrappeAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const credentials: AuthCredentials = {
        username: username,
        password: password
      };
      
      const response = await login(credentials);
      
      if (response) {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/healthtech_point_of_sale/dashboard');
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
      console.error('Login error:', err);
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
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center text-sm">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  required
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  className="text-sm h-9"
                />
              </div>
              <Button type="submit" className="w-full text-sm h-9">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login; 