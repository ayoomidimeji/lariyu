const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-center">
          About L'Riyu
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Our Story
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              L'Riyu was born from a passion for exceptional craftsmanship and
              timeless elegance. Inspired by the legendary Italian shoemaking
              traditions of Salvatore Ferragamo, we set out to create footwear
              that combines artistry with comfort, luxury with practicality.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Behind every one of our shoes, there's a story of tradition, beauty, durability, comfort, and quality craftsmanship and each shoe carries with it the estimable wealth of knowledge and experience accumulated over years of practice and dedication
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Craftsmanship
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              We believe in the power of handcrafted excellence. Every shoe is
              meticulously created using premium Italian leather and materials
              sourced from the finest tanneries. Our artisans employ
              time-honored techniques passed down through generations, combined
              with modern innovations to ensure perfect fit and lasting
              comfort.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Our Philosophy
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              "Steps that suit you" is more than a tagline—it's our promise. We
              understand that the right shoes can transform not just your
              outfit, but your entire day. That's why we're committed to
              creating footwear that perfectly balances elegance, comfort, and
              durability.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Premium Materials
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              From the supple Italian leather to the finest threads and
              hardware, every component of a L'Riyu shoe is carefully selected
              for quality and beauty. We work directly with artisan suppliers
              who share our commitment to excellence and sustainability.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
