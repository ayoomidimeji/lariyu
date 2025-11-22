import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { cartItems, removeFromCart, getCartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Discover our collection of handcrafted luxury shoes
          </p>
          <Link to="/shop">
            <Button size="lg" className="transition-luxury">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <Card key={`${item.id}-${item.size}-${index}`} className="shadow-soft">
              <CardContent className="p-4 flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-serif font-semibold">{item.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    Size: {item.size}
                  </p>
                  <p className="text-gold font-semibold mt-2">
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeFromCart(item.id, item.size)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="shadow-elegant sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif font-semibold mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-gold">₦{getCartTotal().toLocaleString()}</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button className="w-full transition-luxury">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
