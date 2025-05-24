import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, Search, Plus, Minus, Trash2, Stethoscope, Activity, Camera, Scissors, Calendar, User, Phone, Mail, X, ShoppingCart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PatientSelection } from '@/components/PatientSelection';
import { Patient, Customer } from '@/hooks/useCustomerPatientSearch';

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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
}

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

type ServiceCategory = 'consultation' | 'diagnostic' | 'radiology' | 'procedure' | 'subscription';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Patient selection state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Cart modal state
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [addedToCartItems, setAddedToCartItems] = useState<Set<string>>(new Set());

  const handlePatientSelect = (patient: Patient, customer: Customer) => {
    setSelectedPatient(patient);
    setSelectedCustomer(customer);
  };

  const handlePatientClear = () => {
    setSelectedPatient(null);
    setSelectedCustomer(null);
  };

  const categories = [
    { id: 'consultation', name: 'Consultation', icon: Stethoscope, color: 'bg-blue-500' },
    { id: 'diagnostic', name: 'Diagnostic', icon: Activity, color: 'bg-green-500' },
    { id: 'radiology', name: 'Radiology', icon: Camera, color: 'bg-purple-500' },
    { id: 'procedure', name: 'Procedure', icon: Scissors, color: 'bg-red-500' },
    { id: 'subscription', name: 'Subscription', icon: Calendar, color: 'bg-orange-500' },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        
        // Mock data for different healthcare services
        const mockServices = [
          // Consultation Services
          { id: 'CONS001', name: 'General Physician Consultation', price: 500, category: 'consultation', description: '30-minute consultation with general physician' },
          { id: 'CONS002', name: 'Specialist Consultation', price: 800, category: 'consultation', description: '45-minute consultation with specialist' },
          { id: 'CONS003', name: 'Pediatric Consultation', price: 600, category: 'consultation', description: 'Consultation for children under 16' },
          { id: 'CONS004', name: 'Cardiology Consultation', price: 1200, category: 'consultation', description: 'Heart specialist consultation' },
          
          // Diagnostic Services
          { id: 'DIAG001', name: 'Complete Blood Count (CBC)', price: 300, category: 'diagnostic', description: 'Complete blood analysis' },
          { id: 'DIAG002', name: 'Lipid Profile', price: 500, category: 'diagnostic', description: 'Cholesterol and lipid analysis' },
          { id: 'DIAG003', name: 'Liver Function Test', price: 400, category: 'diagnostic', description: 'Liver health assessment' },
          { id: 'DIAG004', name: 'Thyroid Profile', price: 600, category: 'diagnostic', description: 'Thyroid hormone analysis' },
          { id: 'DIAG005', name: 'HbA1c Test', price: 350, category: 'diagnostic', description: 'Diabetes monitoring test' },
          
          // Radiology Services
          { id: 'RAD001', name: 'Chest X-Ray', price: 800, category: 'radiology', description: 'Digital chest X-ray imaging' },
          { id: 'RAD002', name: 'Abdominal Ultrasound', price: 1200, category: 'radiology', description: 'Ultrasound of abdominal organs' },
          { id: 'RAD003', name: 'MRI Brain', price: 5000, category: 'radiology', description: 'Magnetic resonance imaging of brain' },
          { id: 'RAD004', name: 'CT Scan Chest', price: 3000, category: 'radiology', description: 'Computed tomography of chest' },
          { id: 'RAD005', name: 'Mammography', price: 1500, category: 'radiology', description: 'Breast imaging for screening' },
          
          // Procedure Services
          { id: 'PROC001', name: 'Minor Surgery', price: 2500, category: 'procedure', description: 'Outpatient minor surgical procedure' },
          { id: 'PROC002', name: 'Endoscopy', price: 3500, category: 'procedure', description: 'Upper GI endoscopy examination' },
          { id: 'PROC003', name: 'Colonoscopy', price: 4000, category: 'procedure', description: 'Lower GI colonoscopy examination' },
          { id: 'PROC004', name: 'Biopsy', price: 1800, category: 'procedure', description: 'Tissue sample collection and analysis' },
          { id: 'PROC005', name: 'ECG', price: 200, category: 'procedure', description: 'Electrocardiogram test' },
          
          // Subscription Services
          { id: 'SUB001', name: 'Basic Health Package', price: 2000, category: 'subscription', description: 'Monthly basic health monitoring package' },
          { id: 'SUB002', name: 'Premium Health Package', price: 4000, category: 'subscription', description: 'Comprehensive monthly health package' },
          { id: 'SUB003', name: 'Diabetes Care Package', price: 1500, category: 'subscription', description: 'Monthly diabetes monitoring and care' },
          { id: 'SUB004', name: 'Senior Citizen Package', price: 3000, category: 'subscription', description: 'Specialized care for seniors (monthly)' },
          { id: 'SUB005', name: 'Family Health Package', price: 5000, category: 'subscription', description: 'Health package for family of 4 (monthly)' },
        ];

        setServices(mockServices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching services:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((service: ServiceItem) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (service: ServiceItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === service.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...service, quantity: 1 }];
    });
    
    // Visual feedback for successful add to cart
    setAddedToCartItems(prev => new Set(prev).add(service.id));
    setTimeout(() => {
      setAddedToCartItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(service.id);
        return newSet;
      });
    }, 1000); // Remove feedback after 1 second
    
    console.log(`Added ${service.name} to cart`);
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, change: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === serviceId) {
          const newQuantity = Math.max(0, item.quantity + change);
          if (newQuantity === 0) {
            return null; // Will be filtered out
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[] // Remove null items
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    if (categoryData) {
      const IconComponent = categoryData.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return null;
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.color || 'bg-gray-500';
  };

  // Cart Modal Component
  const CartModal = ({ isOpen, onClose, cart, updateQuantity, removeFromCart, getCategoryIcon, getCategoryColor, selectedPatient, totalAmount, onPlaceOrder }: {
    isOpen: boolean
    onClose: () => void
    cart: CartItem[]
    updateQuantity: (id: string, change: number) => void
    removeFromCart: (id: string) => void
    getCategoryIcon: (category: string) => React.ReactNode
    getCategoryColor: (category: string) => string
    selectedPatient: Patient | null
    totalAmount: number
    onPlaceOrder: () => void
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
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

          {/* Cart Items */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No items in cart</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Badge variant="secondary" className={`${getCategoryColor(item.category)} text-white text-xs mb-2`}>
                              {getCategoryIcon(item.category)}
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </Badge>
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
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
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium px-3">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                            <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
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
                  <span>Total Items:</span>
                  <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Continue Shopping
                  </Button>
                  <Button 
                    onClick={onPlaceOrder} 
                    className="flex-1"
                    disabled={!selectedPatient}
                  >
                    Place Order
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

  // Place order function
  const handlePlaceOrder = () => {
    if (!selectedPatient) {
      alert('Please select a patient first');
      return;
    }
    
    // TODO: Implement actual order placement to ERPNext
    console.log('Placing order for patient:', selectedPatient.name);
    console.log('Cart items:', cart);
    console.log('Total amount:', totalAmount);
    
    // For now, just show success message and clear cart
    alert(`Order placed successfully for ${selectedPatient.patient_name}!\nTotal: ₹${totalAmount.toFixed(2)}`);
    setCart([]);
    setIsCartModalOpen(false);
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

      {/* Patient Selection */}
      <PatientSelection
        selectedPatient={selectedPatient}
        selectedCustomer={selectedCustomer}
        onPatientSelect={handlePatientSelect}
        onPatientClear={handlePatientClear}
      />

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Services</CardTitle>
          <CardDescription>Select from our comprehensive range of medical services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('all')}
            >
              All Services
            </Badge>
            {categories.map(category => {
              const IconComponent = category.icon;
              return (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className={`cursor-pointer flex items-center gap-1 ${
                    selectedCategory === category.id ? category.color + ' text-white' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id as ServiceCategory)}
                >
                  <IconComponent className="h-3 w-3" />
                  {category.name}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Selection */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
              Available Services
            </CardTitle>
            <CardDescription>Search and add services to your order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center text-muted-foreground py-8">
                      Loading services...
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 py-8">
                      Error loading services: {error}
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No services found
                    </div>
                  ) : (
                    filteredServices.map(service => {
                      const cartItem = cart.find(item => item.id === service.id);
                      const isJustAdded = addedToCartItems.has(service.id);
                      
                      return (
                        <div key={service.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className={`${getCategoryColor(service.category)} text-white text-xs`}>
                                  {getCategoryIcon(service.category)}
                                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                                </Badge>
                                {cartItem && (
                                  <Badge variant="outline" className="text-xs">
                                    In Cart: {cartItem.quantity}
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium text-sm">{service.name}</p>
                              {service.description && (
                                <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-medium text-sm">₹{service.price.toFixed(2)}</p>
                              <Button
                                size="sm"
                                onClick={() => addToCart(service)}
                                className={isJustAdded ? 'bg-green-600 hover:bg-green-700' : ''}
                              >
                                {isJustAdded ? (
                                  <>
                                    <span className="mr-1">✓</span>
                                    Added
                                  </>
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Cart Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
        </CardTitle>
            <CardDescription>Quick overview of your order</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items in cart</p>
                  <p className="text-sm mt-2">Add services to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick Cart Preview - Show only first 3 items */}
                  <div className="space-y-2">
                    {cart.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`${getCategoryColor(item.category)} text-white text-xs`}>
                              {getCategoryIcon(item.category)}
                            </Badge>
                            <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    {cart.length > 3 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        +{cart.length - 3} more items
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Total Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Items:</span>
                      <span className="text-sm font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
          </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => setIsCartModalOpen(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Cart Details
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      className="w-full"
                      disabled={!selectedPatient}
                    >
                      Quick Order
                    </Button>
                    {!selectedPatient && (
                      <p className="text-xs text-red-500 text-center">Select a patient to place order</p>
                    )}
          </div>
                </div>
              )}
        </div>
      </CardContent>
    </Card>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getCategoryIcon={getCategoryIcon}
        getCategoryColor={getCategoryColor}
        selectedPatient={selectedPatient}
        totalAmount={totalAmount}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};

export default Orders; 