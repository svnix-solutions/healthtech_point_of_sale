import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, User } from 'lucide-react';

const Appointments = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Appointments
        </CardTitle>
        <CardDescription>Manage your appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No appointments scheduled</span>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Next available slot: Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Appointments; 