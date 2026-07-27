import { faqItems } from "@/lib/faq";

/**
 * Homepage structured data.
 *
 * The legacy static homepage published a RealEstateAgent + WebSite + FAQPage
 * graph. The hybrid cutover dropped it, which left the homepage with no
 * structured data at all while deeper pages (/93063 etc.) still carried
 * theirs — i.e. the most important page became the weakest local-SEO signal.
 *
 * Every literal below is taken from Kareem's own published pages (README and
 * the still-live legacy pages). Nothing here is estimated: if a fact can't be
 * verified it is omitted rather than guessed, and no claim about performance,
 * appreciation, or outcomes appears anywhere in this graph.
 *
 * areaServed lists only markets that have a real page on this site.
 */

const SITE = "https://kareemjamaltherealtor.com";

const AGENT_ID = `${SITE}/#agent`;

export function HomeSchema() {
  const graph = [
    {
      "@type": "RealEstateAgent",
      "@id": AGENT_ID,
      name: "Kareem Jamal",
      alternateName: "Kareem Jamal The Realtor",
      url: `${SITE}/`,
      image: `${SITE}/assets/kareem-jamal-headshot-2026-web.jpg`,
      jobTitle: "Realtor",
      telephone: "+1-818-402-7326",
      email: "kjamal@rodeore.com",
      areaServed: [
        { "@type": "City", name: "Chatsworth" },
        { "@type": "City", name: "Simi Valley" },
        { "@type": "City", name: "Canoga Park" },
        { "@type": "City", name: "West Hills" },
        { "@type": "City", name: "Woodland Hills" },
        { "@type": "City", name: "Calabasas" },
        { "@type": "City", name: "Hidden Hills" },
        { "@type": "City", name: "Encino" },
        { "@type": "AdministrativeArea", name: "San Fernando Valley" },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "21031 Ventura Blvd, #100",
        addressLocality: "Woodland Hills",
        addressRegion: "CA",
        postalCode: "91364",
        addressCountry: "US",
      },
      memberOf: {
        "@type": "Organization",
        name: "Rodeo Realty Fine Estates",
        url: "https://www.rodeore.com/",
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "license",
        name: "California Real Estate License (CA DRE)",
        recognizedBy: {
          "@type": "Organization",
          name: "California Department of Real Estate",
        },
      },
      identifier: {
        "@type": "PropertyValue",
        propertyID: "CA DRE License",
        value: "01998956",
      },
      knowsLanguage: "en-US",
      sameAs: [
        "https://www.instagram.com/kareemjamaltherealtor",
        "https://www.linkedin.com/in/kareemjamaltherealtor/",
        "https://www.facebook.com/kareemjamaltherealtor/",
        "https://www.zillow.com/profile/KareemJamal",
        "https://www.rodeore.com/real-estate-agent/2094/kareem-jamal",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: "Kareem Jamal | Southern California Realtor",
      publisher: { "@id": AGENT_ID },
      inLanguage: "en-US",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Server-rendered from static literals above; no user input reaches this.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
