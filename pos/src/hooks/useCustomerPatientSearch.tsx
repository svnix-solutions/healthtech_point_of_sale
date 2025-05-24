import { useState, useEffect } from 'react';

export interface Patient {
  name: string;
  patient_name: string;
  sex?: string;
  blood_group?: string;
  dob?: string;
  mobile?: string;
  email?: string;
  patient_details?: string;
}

export interface Customer {
  name: string;
  customer_name: string;
  mobile_no?: string;
  email_id?: string;
  customer_group?: string;
  territory?: string;
}

export interface CustomerPatientData {
  customer: Customer;
  patients: Patient[];
}

export const useCustomerPatientSearch = () => {
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPatientData, setCustomerPatientData] = useState<CustomerPatientData[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [patientSearchError, setPatientSearchError] = useState<string | null>(null);

  // Search for customers and patients
  const searchCustomersAndPatients = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomerPatientData([]);
      return;
    }

    try {
      setIsSearchingPatients(true);
      setPatientSearchError(null);

      const response = await fetch(`/api/method/healthtech_point_of_sale.api.search_customers_and_patients?search_term=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.message && data.message.status === 'success') {
        setCustomerPatientData(data.message.data || []);
      } else {
        setPatientSearchError('No customers or patients found');
        setCustomerPatientData([]);
      }
    } catch (err) {
      setPatientSearchError(err instanceof Error ? err.message : 'Error searching patients');
      setCustomerPatientData([]);
      console.error('Error searching customers and patients:', err);
    } finally {
      setIsSearchingPatients(false);
    }
  };

  // Handle patient search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patientSearchQuery) {
        searchCustomersAndPatients(patientSearchQuery);
      } else {
        setCustomerPatientData([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [patientSearchQuery]);

  const selectPatient = (patient: Patient, customer: Customer) => {
    setSelectedPatient(patient);
    setSelectedCustomer(customer);
    setCustomerPatientData([]);
    setPatientSearchQuery('');
  };

  const clearPatientSelection = () => {
    setSelectedPatient(null);
    setSelectedCustomer(null);
    setPatientSearchQuery('');
    setCustomerPatientData([]);
  };

  return {
    // State
    patientSearchQuery,
    selectedPatient,
    selectedCustomer,
    customerPatientData,
    isSearchingPatients,
    patientSearchError,
    
    // Actions
    setPatientSearchQuery,
    selectPatient,
    clearPatientSelection,
    searchCustomersAndPatients
  };
}; 