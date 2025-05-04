import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, DollarSign } from 'lucide-react';

const Orders = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Orders
        </CardTitle>
        <CardDescription>Manage your orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No orders placed</span>
          </div>
          <div className="flex items-center gap-4">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total sales: $0.00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Orders; 