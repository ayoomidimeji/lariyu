import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const checkoutSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name must be less than 50 characters" }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be less than 50 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must be less than 15 digits" })
    .regex(/^[0-9+\s()-]+$/, { message: "Invalid phone number format" }),
  address: z
    .string()
    .trim()
    .min(5, { message: "Address is required" })
    .max(200, { message: "Address must be less than 200 characters" }),
  city: z
    .string()
    .trim()
    .min(2, { message: "City is required" })
    .max(100, { message: "City must be less than 100 characters" }),
  state: z
    .string()
    .trim()
    .min(2, { message: "State is required" })
    .max(100, { message: "State must be less than 100 characters" }),
  zipCode: z
    .string()
    .trim()
    .max(10, { message: "Zip code must be less than 10 characters" })
    .optional(),
  deliveryOption: z.enum(["normal", "express"], {
    required_error: "Please select a delivery option",
  }),
  notes: z
    .string()
    .trim()
    .max(500, { message: "Notes must be less than 500 characters" })
    .optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      deliveryOption: "normal",
      notes: "",
    },
  });

  const deliveryOption = form.watch("deliveryOption");

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to place an order.",
      });
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingFee = data.deliveryOption === "express" ? 10000 : 5000;
      const totalAmount = getCartTotal() + shippingFee;

      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode || "N/A",
          delivery_option: data.deliveryOption,
          notes: data.notes || null,
          status: "pending",
          total_amount: totalAmount,
          shipping_fee: shippingFee,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        size: item.size,
        price: item.price,
        quantity: 1,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed Successfully!",
        description: "Thank you for your purchase. We'll send you a confirmation email shortly.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Add items to your cart before checking out
          </p>
          <Button onClick={() => navigate("/shop")} size="lg" className="transition-luxury">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const shippingFee = deliveryOption === "express" ? 10000 : 5000;
  const total = getCartTotal() + shippingFee;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-serif">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+234 800 000 0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Lagos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryOption"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Delivery Option</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-3 border border-border rounded-md p-4 hover:bg-accent/50 transition-luxury cursor-pointer">
                                <RadioGroupItem value="normal" id="normal" />
                                <Label htmlFor="normal" className="flex-1 cursor-pointer">
                                  <div className="font-semibold">Normal Delivery (₦5,000)</div>
                                  <div className="text-sm text-muted-foreground">
                                    Delivery within 7 days
                                  </div>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 border border-border rounded-md p-4 hover:bg-accent/50 transition-luxury cursor-pointer">
                                <RadioGroupItem value="express" id="express" />
                                <Label htmlFor="express" className="flex-1 cursor-pointer">
                                  <div className="font-semibold">Express Delivery (₦10,000)</div>
                                  <div className="text-sm text-muted-foreground">
                                    Delivery within 3 days
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Lagos State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="100001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions for your order..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full transition-luxury"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="shadow-elegant sticky top-24">
            <CardHeader>
              <CardTitle className="font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${index}`}
                    className="flex gap-3 pb-3 border-b border-border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size}
                      </p>
                      <p className="text-sm text-gold font-semibold mt-1">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₦{shippingFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-gold">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
