import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string | null;
  sizes: string[];
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.images[0],
    });
    toast.success(`${product.name} (Size ${selectedSize}) added to cart!`);
    setSelectedSize("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Product Not Found</h1>
        <Link to="/shop">
          <Button>Return to Shop</Button>
        </Link>
      </div>
    );
  }

  // Default features list since it's not in the DB yet
  const features = [
    "Premium quality materials",
    "Handcrafted excellence",
    "Superior comfort and fit",
    "Durable construction",
    "Elegant design"
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden relative group">
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.name} - View ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              {currentImageIndex > 0 && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow-lg"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex-1" />
              {currentImageIndex < product.images.length - 1 && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow-lg"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-muted-foreground/20"
                  }`}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">
              {product.name}
            </h1>
            <p className="text-3xl text-gold font-semibold">
              ₦{product.price.toLocaleString()}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description || "No description available."}
          </p>

          {/* Features */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-3">Features</h3>
            <ul className="space-y-2">
              {features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gold mt-1">✓</span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-3">
              Select Size
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((size: string) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className="transition-luxury"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))
              ) : (
                <p className="text-muted-foreground col-span-7">No sizes available</p>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full transition-luxury hover:scale-105 shadow-elegant"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
