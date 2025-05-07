import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, User } from 'lucide-react';
import InjectableIframe from '@/components/InjectableIframe';

const Appointments = () => {
  const appointmentScript = `
    // Your JavaScript code here
    console.log('Script injected into appointments iframe');
    // Add more JavaScript functionality as needed
  `;

  return (
    <div className="space-y-2">        
      <InjectableIframe
        script={appointmentScript}
        title="Appointments iframe"
        className="mt-4"
        url="/app/patient-appointment/view/calendar/default?service_unit=Test+Unit+-+AH"
      />
    </div>
  );
};

export default Appointments; 