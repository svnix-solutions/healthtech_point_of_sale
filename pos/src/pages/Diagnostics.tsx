import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Activity, FileText } from 'lucide-react';

const Diagnostics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Diagnostics
        </CardTitle>
        <CardDescription>Manage diagnostic tests and reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No tests scheduled</span>
          </div>
          <div className="flex items-center gap-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No reports available</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Diagnostics; 