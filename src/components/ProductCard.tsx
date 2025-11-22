import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export const ProductCard = ({ id, name, price, images }: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Preload images
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const showLeftButton = currentImageIndex > 0;
  const showRightButton = currentImageIndex < images.length - 1;

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-elegant transition-luxury group">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={images[currentImageIndex]}
          alt={`${name} - View ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        />
        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showLeftButton && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-lg"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1" />
          {showRightButton && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-lg"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        {/* Image Indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex
                ? "w-6 bg-primary"
                : "w-1.5 bg-primary/30"
                }`}
            />
          ))}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-serif font-semibold text-lg mb-2">{name}</h3>
        <p className="text-gold font-semibold text-xl">
          ₦{price.toLocaleString()}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/product/${id}`} className="w-full">
          <Button className="w-full transition-luxury hover:scale-105">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
