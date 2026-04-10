import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
}

const ITEMS_PER_PAGE = 8;

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial mount animations
    gsap.fromTo(
      ".header-anim",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(
      ".filters-anim",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );
  }, { scope: containerRef });

  useGSAP(() => {
    // Animate products when loading finishes or category changes
    if (!loading && products.length > 0) {
      gsap.from(".product-card-anim", {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      });
    }
  }, { dependencies: [loading, products.length, selectedCategory], scope: containerRef });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset state when category changes
    setProducts([]);
    setPage(0);
    setHasMore(true);
    fetchProducts(0, selectedCategory);
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category");

      if (error) throw error;

      if (data) {
        const uniqueCategories = Array.from(new Set(data.map((item) => item.category).filter(Boolean))) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (pageNumber: number, category: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*", { count: "exact" });

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const from = pageNumber * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const newProducts = data || [];

      setProducts((prev) => {
        if (pageNumber === 0) return newProducts;
        return [...prev, ...newProducts];
      });

      // Check if we have loaded all products
      if (count !== null && (from + newProducts.length) >= count) {
        setHasMore(false);
      } else if (newProducts.length < ITEMS_PER_PAGE) {
        // Fallback if count is somehow missing or inaccurate
        setHasMore(false);
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching products",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, selectedCategory);
  };

  return (
    <div className="container mx-auto px-4 py-12" ref={containerRef}>
      <SEO 
        title="Shop Luxury Collection"
        description="Browse our exclusive collection of handcrafted luxury shoes. From formal elegance to casual sophistication, discover the perfect pair at L'Riyu."
      />
      <header className="text-center mb-12 header-anim">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          Our Collection
        </h1>
        <p className="text-muted-foreground">
          Discover handcrafted excellence in every pair
        </p>
      </header>

      {/* Filters */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap filters-anim">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className="transition-luxury"
        >
          All Shoes
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="transition-luxury capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        {products.map((product) => (
          <div key={product.id} className="product-card-anim">
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              images={product.images}
            />
          </div>
        ))}
        {/* Loading State (Skeleton Grid) */}
        {loading && (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))
        )}
      </div>

      {/* Loading State handled above in grid */}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center text-muted-foreground">
          No products found in this category.
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && products.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default Shop;
