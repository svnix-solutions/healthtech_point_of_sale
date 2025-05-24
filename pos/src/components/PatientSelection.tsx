import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Phone, Mail } from 'lucide-react';
import { useCustomerPatientSearch, Patient, Customer } from '@/hooks/useCustomerPatientSearch';

// Simple inline Badge component
const Badge = ({ variant = 'default', className = '', children, ...props }: {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  children: React.ReactNode
  [key: string]: any
}) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer"
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-gray-900 border-gray-300 hover:bg-gray-50",
  }
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

interface PatientSelectionProps {
  selectedPatient: Patient | null;
  selectedCustomer: Customer | null;
  onPatientSelect: (patient: Patient, customer: Customer) => void;
  onPatientClear: () => void;
  title?: string;
  description?: string;
}

export const PatientSelection = ({ 
  selectedPatient, 
  selectedCustomer, 
  onPatientSelect, 
  onPatientClear,
  title = "Patient Selection",
  description = "Search and select patient by customer name or phone number"
}: PatientSelectionProps) => {
  const {
    patientSearchQuery,
    customerPatientData,
    isSearchingPatients,
    patientSearchError,
    setPatientSearchQuery,
    selectPatient,
    clearPatientSelection
  } = useCustomerPatientSearch();

  const handlePatientSelect = (patient: Patient, customer: Customer) => {
    selectPatient(patient, customer);
    onPatientSelect(patient, customer);
  };

  const handlePatientClear = () => {
    clearPatientSelection();
    onPatientClear();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedPatient ? (
          // Selected Patient Display
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">Selected Patient</Badge>
                </div>
                <h3 className="font-semibold text-lg">{selectedPatient.patient_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>ID: {selectedPatient.name}</span>
                  </div>
                  {selectedPatient.sex && (
                    <div className="flex items-center gap-1">
                      <span>Gender: {selectedPatient.sex}</span>
                    </div>
                  )}
                  {selectedPatient.mobile && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{selectedPatient.mobile}</span>
                    </div>
                  )}
                  {selectedPatient.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{selectedPatient.email}</span>
                    </div>
                  )}
                  {selectedPatient.blood_group && (
                    <div className="flex items-center gap-1">
                      <span>Blood Group: {selectedPatient.blood_group}</span>
                    </div>
                  )}
                  {selectedPatient.dob && (
                    <div className="flex items-center gap-1">
                      <span>DOB: {new Date(selectedPatient.dob).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium">Customer: {selectedCustomer.customer_name}</p>
                    <p className="text-xs text-gray-500">Customer ID: {selectedCustomer.name}</p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePatientClear}
              >
                Change Patient
              </Button>
            </div>
          </div>
        ) : (
          // Patient Search
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or phone number..."
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* Search Results */}
            {patientSearchQuery && (
              <div className="space-y-2">
                {isSearchingPatients ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Searching patients...
                  </div>
                ) : patientSearchError ? (
                  <div className="text-center py-4 text-red-500">
                    {patientSearchError}
                  </div>
                ) : customerPatientData.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No customers or patients found
                  </div>
                ) : (
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-2">
                      {customerPatientData.map((data, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div className="font-medium text-sm">
                            <span className="text-blue-600">{data.customer.customer_name}</span>
                            {data.customer.mobile_no && (
                              <span className="text-gray-500 ml-2">({data.customer.mobile_no})</span>
                            )}
                          </div>
                          {data.patients.length === 0 ? (
                            <p className="text-xs text-gray-500">No patients linked to this customer</p>
                          ) : (
                            <div className="space-y-1">
                              {data.patients.map((patient, patientIndex) => (
                                <div
                                  key={patientIndex}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                                  onClick={() => handlePatientSelect(patient, data.customer)}
                                >
                                  <div>
                                    <p className="font-medium text-sm">{patient.patient_name}</p>
                                    <div className="flex gap-4 text-xs text-gray-500">
                                      {patient.sex && <span>{patient.sex}</span>}
                                      {patient.mobile && <span>{patient.mobile}</span>}
                                      {patient.blood_group && <span>{patient.blood_group}</span>}
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Select
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 