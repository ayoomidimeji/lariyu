import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  twitterHandle?: string;
  structuredData?: object;
}

const SEO = ({
  title,
  description = "Discover L'Riyu's collection of handcrafted luxury shoes. Inspired by Italian craftsmanship, each pair is made with precision and premium materials.",
  canonical = "https://lariyu.vercel.app",
  ogType = "website",
  ogImage = "/og-image.png",
  twitterHandle = "@LRiyu",
  structuredData,
}: SEOProps) => {
  const siteTitle = "L'Riyu - Steps that suit you";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  const defaultKeywords = "luxury shoes, handcrafted footwear, bespoke shoes, premium leather, artisan shoes, Lagos luxury, Italian design, designer shoes, L'Riyu, men's luxury shoes, women's luxury shoes, luxury fashion, artisanal steps, handmade luxury, premium steps";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={defaultKeywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="L'Riyu" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
