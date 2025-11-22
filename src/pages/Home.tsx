import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage1 from "@/assets/hero-shoes.jpg";
import heroImage2 from "@/assets/hero-shoes-2.jpg";
import heroImage3 from "@/assets/hero-shoes-3.jpg";
import heroImage4 from "@/assets/hero-shoes-4.jpg";
import logo from "@/assets/no-bg-logo.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Home = () => {
  const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <Carousel
          className="absolute inset-0"
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent>
            {heroImages.map((image, index) => (
              <CarouselItem key={index}>
                <div
                  className="h-[80vh] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(26, 35, 50, 0.4), rgba(26, 35, 50, 0.6)), url(${image})`,
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="relative z-10 text-center text-primary-foreground px-4">
          <img
            src={logo}
            alt="L'Riyu - Steps that suit you"
            className="h-32 md:h-40 w-auto object-contain mx-auto mb-8 animate-fade-in"
          />
          <Link to="/shop">
            <Button
              size="lg"
              className="luxury-gradient text-primary-foreground hover:scale-105 transition-luxury shadow-elegant group"
            >
              Explore Collection
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">
            Crafted with Excellence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each pair is meticulously handcrafted using premium materials and
            time-honored techniques, inspired by Italian luxury traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-card shadow-soft hover:shadow-elegant transition-luxury">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="text-2xl">👞</span>
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">
              Premium Materials
            </h3>
            <p className="text-muted-foreground text-sm">
              Only the finest Italian leather and materials are used in our
              craftsmanship.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card shadow-soft hover:shadow-elegant transition-luxury">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">
              Handcrafted Detail
            </h3>
            <p className="text-muted-foreground text-sm">
              Every stitch and detail is carefully crafted by skilled artisans.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card shadow-soft hover:shadow-elegant transition-luxury">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">
              Perfect Fit
            </h3>
            <p className="text-muted-foreground text-sm">
              Designed for comfort and elegance, ensuring steps that suit you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="luxury-gradient text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold mb-4">
            Discover Your Perfect Pair
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Browse our exclusive collection of handcrafted luxury shoes
          </p>
          <Link to="/shop">
            <Button
              size="lg"
              variant="secondary"
              className="hover:scale-105 transition-luxury shadow-elegant"
            >
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
