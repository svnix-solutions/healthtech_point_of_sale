import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardList, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  X,
  ShoppingCart,
  Minus,
  Trash2,
  Building,
  TestTube,
  Beaker
} from 'lucide-react';
import { PatientSelection } from '@/components/PatientSelection';
import { Patient, Customer } from '@/hooks/useCustomerPatientSearch';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';

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

interface LabTestTemplate {
  name: string;
  lab_test_name: string;
  lab_test_code: string;
  lab_test_rate: number;
  lab_test_group: string;
  department: string;
  lab_test_template_type: string;
  lab_test_description?: string;
  sample?: string;
  sample_qty?: number;
  lab_test_uom?: string;
  item_group: string;
  price_details?: Array<{
    price_list_rate: number;
    discounted_rate: number;
  }>;
  supplier: string;
}

interface CartItem extends LabTestTemplate {
  quantity: number;
}

interface MedicalDepartment {
  name: string;
  department: string;
}

interface Supplier {
  name: string;
  supplier_name: string;
  supplier_group: string;
  mobile_no?: string;
  email_id?: string;
  country?: string;
  supplier_type?: string;
}



const getSampleType = (itemGroup: string): string => {
  const sampleTypes: { [key: string]: string } = {
    'Laboratory': 'Blood/Urine/Various',
    'Pathology': 'Tissue/Fluid',
    'Radiology': 'Imaging',
    'Diagnostic': 'Various',
    'Test Kits': 'Rapid Test',
    'Consumable': 'N/A',
    'Lab Supplies': 'N/A',
    'Medical Supplies': 'N/A',
    'Medical Equipment': 'N/A',
    'Laboratory Equipment': 'N/A',
    'Medical Devices': 'N/A'
  };
  
  return sampleTypes[itemGroup] || 'Various';
};

const DiagnosticOrder = () => {
  // Lab tests and filtering state
  const [labTests, setLabTests] = useState<LabTestTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [addedToCartItems, setAddedToCartItems] = useState<Set<string>>(new Set());

  // Additional data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Patient selection state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Order placement state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderPriority, setOrderPriority] = useState<'normal' | 'urgent' | 'stat'>('normal');

  // Frappe SDK hooks
  const { call: createOrder } = useFrappePostCall('frappe.desk.form.save.savedocs');
  
  // Fetch all items using Frappe reportview API
  const { data: allItems, error: itemsError, isLoading: itemsLoading } = useFrappeGetCall(
    'healthtech_point_of_sale.api.get_laboratory_items_by_filter',
    {
      filter_name: JSON.stringify({
        "disabled": 0,
        "is_sales_item": 1,
        "item_group": ["in", ["Laboratory", "Pathology", "Radiology", "Diagnostic", "Test Kits", "Consumable", "Medical Equipment", "Laboratory Equipment", "Medical Devices"]]
      })
    },
    {
      revalidateOnFocus: false,
    }
  );

  console.log("allItems", allItems);
  // Fetch suppliers using Frappe SDK
  const { data: suppliersData } = useFrappeGetCall(
    'healthtech_point_of_sale.api.get_suppliers',
    {
      filters: {
        "disabled": 0,
        "supplier_type": ["in", ["Laboratory", "Diagnostic", "Healthcare"]]
      }
    },
    {
      revalidateOnFocus: false,
    }
  );

  const handlePatientSelect = (patient: Patient, customer: Customer) => {
    setSelectedPatient(patient);
    setSelectedCustomer(customer);
  };

  const handlePatientClear = () => {
    setSelectedPatient(null);
    setSelectedCustomer(null);
  };

  // Update states when data is fetched
  useEffect(() => {
    if (allItems?.message?.data) {
      const mappedItems: LabTestTemplate[] = allItems.message.data.map((item: any) => ({
        name: item.name,
        lab_test_name: item.item_name,
        lab_test_code: item.item_code,
        lab_test_rate: item.price_details?.[0]?.price_list_rate || item.standard_rate || 0,
        lab_test_group: item.item_group,
        department: item.item_group,
        lab_test_template_type: item.item_group,
        lab_test_description: item.description,
        sample: getSampleType(item.item_group),
        sample_qty: 1,
        lab_test_uom: item.stock_uom || 'Unit',
        item_group: item.item_group,
        price_details: item.price_details,
        supplier: item.supplier
      }));

      // Apply filters
      let filteredItems = mappedItems;
      
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.lab_test_name.toLowerCase().includes(searchLower) ||
          item.lab_test_code.toLowerCase().includes(searchLower) ||
          (item.lab_test_description && item.lab_test_description.toLowerCase().includes(searchLower))
        );
      }

      // Apply supplier filter
      const selectedSupplier = document.querySelector('select[name="supplier"]') as HTMLSelectElement;
      if (selectedSupplier && selectedSupplier.value) {
        filteredItems = filteredItems.filter(item => item.supplier === selectedSupplier.value);
      }

      setLabTests(filteredItems);
      setIsLoading(itemsLoading);
      setError(itemsError?.message || null);
    }
  }, [allItems, searchQuery, itemsLoading, itemsError]);

  // Update suppliers
  useEffect(() => {
    if (suppliersData?.message?.data) {
      setSuppliers(suppliersData.message.data);
    }
  }, [suppliersData]);

  // Cart functionality
  const addToCart = (labTest: LabTestTemplate) => {
    setCart(prevCart => {
      const existingItem = prevCart.find((item: CartItem) => item.name === labTest.name);
      if (existingItem) {
        return prevCart.map((item: CartItem) =>
          item.name === labTest.name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...labTest, quantity: 1 }];
    });
    
    // Visual feedback for successful add to cart
    setAddedToCartItems(prev => new Set(prev).add(labTest.name));
    setTimeout(() => {
      setAddedToCartItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(labTest.name);
        return newSet;
      });
    }, 1000);
  };

  const removeFromCart = (testName: string) => {
    setCart(prevCart => prevCart.filter((item: CartItem) => item.name !== testName));
  };

  const updateQuantity = (testName: string, change: number) => {
    setCart(prevCart =>
      prevCart.map((item: CartItem) => {
        if (item.name === testName) {
          const newQuantity = Math.max(0, item.quantity + change);
          if (newQuantity === 0) {
            return null; // Will be filtered out
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = cart.reduce((sum: number, item: CartItem) => {
    const price = (item.price_details && item.price_details[0]?.discounted_rate) 
      ? item.price_details[0].discounted_rate 
      : item.lab_test_rate;
    return sum + price * item.quantity;
  }, 0);
  const totalItems = cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Place order function using Frappe SDK
  const handlePlaceOrder = async () => {
    if (!selectedPatient || !selectedCustomer || cart.length === 0) {
      alert('Please select a patient and add tests to cart');
      return;
    }
    
    try {
      setIsPlacingOrder(true);

      const orderDoc = {
        doctype: "Sales Order",
        customer: selectedCustomer.name,
        customer_name: selectedCustomer.name,
        custom_transaction_type: "Health Checkup",
        custom_patient: selectedPatient.patient_name,
        custom_supplier: "Max Labs",
        transaction_date: new Date().toISOString().split('T')[0],
        delivery_date: new Date().toISOString().split('T')[0],
        company: "Avisa Healthcare",
        currency: "INR",
        conversion_rate: 1,
        selling_price_list: "Standard Selling",
        price_list_currency: "INR",
        plc_conversion_rate: 1,
        ignore_pricing_rule: 0,
        total_qty: cart.reduce((sum, item) => sum + item.quantity, 0),
        total: totalAmount,
        net_total: totalAmount,
        base_total: totalAmount,
        base_net_total: totalAmount,
        base_grand_total: totalAmount,
        grand_total: totalAmount,
        rounded_total: totalAmount,
        base_rounded_total: totalAmount,
        status: "Draft",
        delivery_status: "Not Delivered",
        per_delivered: 0,
        per_billed: 0,
        per_picked: 0,
        billing_status: "Not Billed",
        items: cart.map((item, index) => ({
          doctype: "Sales Order Item",
          item_code: item.lab_test_code,
          item_name: item.lab_test_name,
          description: item.lab_test_description || item.lab_test_name,
          qty: item.quantity,
          stock_uom: item.lab_test_uom || "Nos",
          uom: item.lab_test_uom || "Nos",
          conversion_factor: 1,
          stock_qty: item.quantity,
          price_list_rate: item.lab_test_rate,
          rate: item.price_details?.[0]?.discounted_rate || item.lab_test_rate,
          amount: (item.price_details?.[0]?.discounted_rate || item.lab_test_rate) * item.quantity,
          base_rate: item.price_details?.[0]?.discounted_rate || item.lab_test_rate,
          base_amount: (item.price_details?.[0]?.discounted_rate || item.lab_test_rate) * item.quantity,
          net_rate: item.price_details?.[0]?.discounted_rate || item.lab_test_rate,
          net_amount: (item.price_details?.[0]?.discounted_rate || item.lab_test_rate) * item.quantity,
          item_group: item.item_group,
          warehouse: "Stores - AH",
          cost_center: "Main - AH",
          gst_hsn_code: "999723",
          gst_treatment: "Nil-Rated",
          delivery_date: new Date().toISOString().split('T')[0],
          transaction_date: new Date().toISOString().split('T')[0]
        })),
        payment_schedule: [{
          doctype: "Payment Schedule",
          due_date: new Date().toISOString().split('T')[0],
          payment_amount: totalAmount,
          invoice_portion: 100,
          payment_term: null,
          description: null,
          mode_of_payment: null,
          discount_type: null,
          discount_date: null,
          discount: 0,
          outstanding: totalAmount,
          paid_amount: 0,
          discounted_amount: 0,
          base_payment_amount: totalAmount,
          base_outstanding: totalAmount,
          base_paid_amount: 0
        }]
      };

      const orderData = {
        doc: JSON.stringify(orderDoc),
        action: "Submit"
      };

      const result = await createOrder(orderData);

      // Check for success message in _server_messages
      const serverMessages = result?._server_messages ? JSON.parse(JSON.parse(result._server_messages)[0]) : null;
      
      if (serverMessages?.indicator === 'green' || result?.docs || result?.docs?.[0]?.name) {
        const orderName = result?.docs?.[0]?.name || result?.name;
        alert(`Diagnostic order created successfully!\nOrder: ${orderName}\nTotal: ₹${totalAmount.toFixed(2)}`);
        setCart([]);
        setIsCartModalOpen(false);
        setOrderNotes('');
        setOrderPriority('normal');
      } else {
        throw new Error(serverMessages?.message || result?.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert(`Failed to place order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Get department color for visual distinction
  const getDepartmentColor = (department: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = department ? department.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Get test type icon
  const getTestTypeIcon = (testType: string) => {
    switch (testType?.toLowerCase()) {
      case 'single':
      case 'compound':
        return <TestTube className="h-4 w-4" />;
      case 'descriptive':
        return <FileText className="h-4 w-4" />;
      case 'grouped':
        return <Beaker className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Cart Modal Component
  const CartModal = () => {
    if (!isCartModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Diagnostic Order Cart</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsCartModalOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Patient Info */}
          {selectedPatient && (
            <div className="p-4 bg-green-50 border-b">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Patient: {selectedPatient.patient_name}</span>
              </div>
              <div className="text-sm text-gray-600 flex gap-4">
                {selectedPatient.mobile && <span>📞 {selectedPatient.mobile}</span>}
                {selectedPatient.sex && <span>👤 {selectedPatient.sex}</span>}
                {selectedPatient.blood_group && <span>🩸 {selectedPatient.blood_group}</span>}
              </div>
            </div>
          )}

          {/* Order Settings */}
          <div className="p-4 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select 
                  value={orderPriority} 
                  onChange={(e) => setOrderPriority(e.target.value as 'normal' | 'urgent' | 'stat')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  placeholder="Add order notes..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tests in cart</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.name} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className={`${getDepartmentColor(item.department)} text-white text-xs`}>
                                {getTestTypeIcon(item.lab_test_template_type)}
                                {item.department}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.lab_test_template_type}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-lg">{item.lab_test_name}</h3>
                            <p className="text-sm text-gray-600">{item.lab_test_code}</p>
                            {item.lab_test_description && (
                              <p className="text-sm text-gray-600 mt-1">{item.lab_test_description}</p>
                            )}
                            {item.sample && (
                              <p className="text-xs text-gray-500 mt-1">Sample: {item.sample} {item.sample_qty && `(${item.sample_qty})`}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.name)}
                            className="ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.name, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium px-3">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.name, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            {item.price_details && item.price_details[0]?.discounted_rate !== item.lab_test_rate ? (
                              <>
                                <p className="text-sm text-gray-500 line-through">₹{item.lab_test_rate.toFixed(2)} each</p>
                                <p className="text-sm text-green-600">₹{item.price_details[0].discounted_rate.toFixed(2)} each</p>
                                <p className="font-bold text-lg text-green-600">₹{(item.price_details[0].discounted_rate * item.quantity).toFixed(2)}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-gray-500">₹{item.lab_test_rate.toFixed(2)} each</p>
                                <p className="font-bold text-lg">₹{(item.lab_test_rate * item.quantity).toFixed(2)}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t p-6 bg-white">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Total Tests:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsCartModalOpen(false)} className="flex-1">
                    Continue Adding Tests
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    className="flex-1"
                    disabled={!selectedPatient || isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing Order...' : `Place Order${totalItems > 0 ? ` (${totalItems})` : ''}`}
                  </Button>
                </div>
                {!selectedPatient && (
                  <p className="text-sm text-red-500 text-center">Please select a patient to place order</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setIsCartModalOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 relative"
            size="lg"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            Diagnostic Orders
          </h1>
          <p className="text-muted-foreground">
            Select lab tests and create diagnostic orders
          </p>
        </div>
        <Button 
          className="flex items-center gap-2" 
          onClick={() => setIsCartModalOpen(true)}
          disabled={cart.length === 0}
        >
          <ShoppingCart className="h-4 w-4" />
          View Cart
          {totalItems > 0 && (
            <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold">
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      {/* Patient Selection */}
      <PatientSelection 
        selectedPatient={selectedPatient}
        selectedCustomer={selectedCustomer}
        onPatientSelect={handlePatientSelect}
        onPatientClear={handlePatientClear}
      />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Lab Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <select
              name="supplier"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              onChange={(e) => {
                // Trigger a re-render to apply the supplier filter
                setLabTests(prev => [...prev]);
              }}
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.name} value={supplier.name}>
                  {supplier.supplier_name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lab Tests Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Available Lab Tests ({labTests.length})</CardTitle>
          <CardDescription>
            Select tests to add to your diagnostic order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading lab tests...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : labTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No lab tests found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {labTests.map((test) => {
                  const cartItem = cart.find(item => item.name === test.name);
                  const isJustAdded = addedToCartItems.has(test.name);
                  
                  return (
                    <div key={test.name} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className={`${getDepartmentColor(test.department)} text-white text-xs`}>
                              {getTestTypeIcon(test.lab_test_template_type)}
                              {test.department}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {test.lab_test_template_type}
                            </Badge>
                            {cartItem && (
                              <Badge variant="default" className="text-xs">
                                In Cart: {cartItem.quantity}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-lg">{test.lab_test_name}</h3>
                          <p className="text-sm text-gray-600">{test.lab_test_code}</p>
                          {test.lab_test_description && (
                            <p className="text-sm text-gray-600 mt-1">{test.lab_test_description}</p>
                          )}
                          {test.sample && (
                            <p className="text-xs text-gray-500 mt-1">
                              Sample: {test.sample} {test.sample_qty && `(${test.sample_qty})`}
                              {test.lab_test_uom && ` ${test.lab_test_uom}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {(test.price_details && test.price_details[0]?.discounted_rate !== test.lab_test_rate) ? (
                            <>
                              <span className="text-sm text-gray-500 line-through">₹{test.lab_test_rate.toFixed(2)}</span>
                              <span className="font-bold text-lg text-green-600">₹{test.price_details[0].discounted_rate.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="font-bold text-lg">₹{test.lab_test_rate.toFixed(2)}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(test)}
                          className={isJustAdded ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {isJustAdded ? (
                            <>
                              <span className="mr-1">✓</span>
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cart Modal */}
      <CartModal />
    </div>
  );
};

export default DiagnosticOrder; 