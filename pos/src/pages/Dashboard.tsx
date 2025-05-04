import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Welcome
          </CardTitle>
          <CardDescription>Your POS Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is your main dashboard where you can manage your POS system.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Quick Stats
          </CardTitle>
          <CardDescription>Overview of your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">$0.00</p>
              <div className="mt-2">
                <Progress value={0} className="h-2" />
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">0</p>
              <div className="mt-2">
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Stats
          </CardTitle>
          <CardDescription>Customer overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">0</p>
              <div className="mt-2">
                <Progress value={0} className="h-2" />
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Customers</p>
              <p className="text-2xl font-bold">0</p>
              <div className="mt-2">
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No recent activity to display.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance
          </CardTitle>
          <CardDescription>System performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
              <p className="text-2xl font-bold">100%</p>
              <div className="mt-2">
                <Progress value={100} className="h-2" />
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Response Time</p>
              <p className="text-2xl font-bold">0ms</p>
              <div className="mt-2">
                <Progress value={100} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 