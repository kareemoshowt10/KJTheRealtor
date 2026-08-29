import type { Metadata } from "next";
import "./listing.css";
import { HighlightGallery, RoomTour, StickyCta } from "./listing-client";

const SITE = "https://kareemjamaltherealtor.com";
const MAPS =
  "https://www.google.com/maps/search/?api=1&query=9621+Jumilla+Ave,+Chatsworth,+CA+91311";
const HERO = `${SITE}/images/9621-jumilla/jumilla-mls-006.jpg`;

export const metadata: Metadata = {
  title: "9621 Jumilla Ave, Chatsworth, CA 91311 | Offered at $999,999 | Kareem Jamal",
  description:
    "5 bed, 2.5 bath, 2,144 sq ft California ranch on a 7,499 sq ft lot at 9621 Jumilla Ave, Chatsworth, CA 91311. Offered at $999,999. Presented by Kareem Jamal, Rodeo Realty.",
  keywords: [
    "9621 Jumilla Ave",
    "Chatsworth homes for sale",
    "91311 real estate",
    "Chatsworth CA listing",
    "Kareem Jamal listing",
  ],
  alternates: { canonical: `${SITE}/9621jumilla` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "9621 Jumilla Ave, Chatsworth, CA 91311 — Offered at $999,999",
    description:
      "5 bed · 2.5 bath · 2,144 sq ft · 7,499 sq ft lot. A spacious California ranch in the West Valley. Presented by Kareem Jamal, Rodeo Realty.",
    type: "website",
    url: `${SITE}/9621jumilla`,
    siteName: "9621 Jumilla Ave",
    images: [HERO],
  },
  twitter: {
    card: "summary_large_image",
    title: "9621 Jumilla Ave, Chatsworth, CA 91311",
    description:
      "5 bed · 2.5 bath · 2,144 sq ft · $999,999. Presented by Kareem Jamal, Rodeo Realty.",
    images: [HERO],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SingleFamilyResidence",
      "@id": `${SITE}/9621jumilla#property`,
      name: "9621 Jumilla Ave, Chatsworth, CA 91311",
      url: `${SITE}/9621jumilla`,
      numberOfBedrooms: 5,
      numberOfFullBathrooms: 2,
      numberOfPartialBathrooms: 1,
      numberOfBathroomsTotal: 2.5,
      numberOfRooms: 5,
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Central air conditioning", value: true },
        { "@type": "LocationFeatureSpecification", name: "Central heating", value: true },
        { "@type": "LocationFeatureSpecification", name: "Attached 2-car garage", value: true },
        { "@type": "LocationFeatureSpecification", name: "Individual laundry room", value: true },
        { "@type": "LocationFeatureSpecification", name: "Gas fireplace", value: true },
        { "@type": "LocationFeatureSpecification", name: "Pool", value: false },
        { "@type": "LocationFeatureSpecification", name: "HOA", value: false },
      ],
      yearBuilt: "1964",
      floorSize: { "@type": "QuantitativeValue", value: 2144, unitCode: "FTK" },
      lotSize: { "@type": "QuantitativeValue", value: 7499, unitCode: "FTK" },
      address: {
        "@type": "PostalAddress",
        streetAddress: "9621 Jumilla Ave",
        addressLocality: "Chatsworth",
        addressRegion: "CA",
        postalCode: "91311",
        addressCountry: "US",
      },
      offers: {
        "@type": "Offer",
        price: 999999,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "RealEstateAgent",
          name: "Kareem Jamal",
          telephone: "+1-818-402-7326",
          email: "kjamal@rodeore.com",
          affiliation: { "@type": "Organization", name: "Rodeo Realty" },
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "91311 Chatsworth", item: `${SITE}/91311` },
        { "@type": "ListItem", position: 3, name: "9621 Jumilla Ave" },
      ],
    },
  ],
};

const HIGHLIGHT_CARDS = [
  ["🛏️", "5 Bedrooms", "Flexible for family, guests, or a home office"],
  ["🛁", "2.5 Baths", "Two full baths plus a half bath"],
  ["📐", "2,144 Sq Ft", "Generous single-story living space"],
  ["🌳", "7,499 Sq Ft Lot", "Room to entertain, garden, or expand"],
  ["🚗", "2-Car Garage", "Attached, with driveway parking"],
  ["📅", "Built 1964", "Solid mid-century construction"],
  ["❄️", "Central A/C & Heat", "ENERGY STAR qualified equipment"],
  ["🧺", "Laundry Room", "Individual room inside; washer & dryer included"],
  ["✅", "No HOA", "$0 dues, no common interest"],
  ["🎓", "LAUSD", "Los Angeles Unified School District"],
];

const FACTS: [string, string][] = [
  ["Address", "9621 Jumilla Ave, Chatsworth, CA 91311"],
  ["Property type", "Single Family Residence"],
  ["Bedrooms", "5"],
  ["Bathrooms", "2 full + 1 half (2.5)"],
  ["Living area", "2,144 sq ft"],
  ["Lot size", "7,499 sq ft"],
  ["Year built", "1964"],
  ["Heating", "Central"],
  ["Cooling", "Central air · ENERGY STAR qualified"],
  ["Garage", "2-car attached"],
  ["Parking", "Driveway, garage faces front, private"],
  ["Laundry", "Individual room, inside · washer & dryer included"],
  ["Fireplace", "Living room, gas"],
  ["Pool / spa", "None"],
  ["HOA", "None — $0"],
  ["Sewer / water", "Public sewer · public water"],
  ["School district", "Los Angeles Unified"],
  ["County", "Los Angeles County"],
  ["APN", "2761-030-050"],
  ["MLS #", "SR26164041"],
  ["Zoning", "LARS"],
];

export default function Page() {
  return (
    <div className="jumilla">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <div className="name">Rodeo Realty</div>
            <div className="tag">Presented by Kareem Jamal</div>
          </div>
          <a className="topbar-back" href="/91311">
            ← 91311 Chatsworth
          </a>
          <a className="topbar-cta" href="#contact">
            Schedule a tour
          </a>
        </div>
      </div>

      <main>
        <section className="hero">
          <img
            src="/images/9621-jumilla/jumilla-mls-006.jpg"
            alt="Dining area at 9621 Jumilla Ave with arched openings, chandelier and slider to the patio"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            <span className="pill">
              <span className="pill-dot" />
              New Listing · Chatsworth, 91311
            </span>
            <h1>
              9621 Jumilla
              <br />
              <em>Avenue</em>
            </h1>
            <p className="hero-sub">
              A spacious West Valley home with flexible living space — 5 bedrooms, 2.5 baths,
              and 2,144 sq ft on a generous 7,499 sq ft lot.
            </p>
            <div className="hero-price-row">
              <div className="hero-price">$999,999</div>
              <div className="hero-persf">Offered · $466 / sq ft</div>
              <a className="hero-map" href={MAPS} target="_blank" rel="noopener noreferrer">
                📍 View on map
              </a>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stats-grid">
            {[
              ["5", "Bedrooms"],
              ["2.5", "Bathrooms"],
              ["2,144", "Sq Ft"],
              ["7,499", "Lot Sq Ft"],
            ].map(([v, l]) => (
              <div className="stat" key={l}>
                <div className="stat-value">{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap">
          <div className="story-grid">
            <div>
              <div className="label">The Home</div>
              <h2>Room to gather, room to grow.</h2>
            </div>
            <div className="prose">
              <p>
                Welcome to 9621 Jumilla Ave, a spacious single-family residence in Chatsworth
                offering 2,144 square feet of living space on a 7,499 square foot lot. Built in
                1964, this classic California ranch features central heating, a versatile floor
                plan, and generous interior space.
              </p>
              <p>
                With five bedrooms and two and a half baths, the layout is ideal for large
                households, multigenerational living, guest space, or a home office setup. The
                7,499 sq ft lot offers room to entertain, garden, or dream up future
                possibilities.
              </p>
              <p>
                Practical details matter as much as square footage: central air conditioning and
                heating with ENERGY STAR qualified equipment, a two-car attached garage with
                driveway parking, an individual laundry room inside the home with the washer and
                dryer included, a gas fireplace in the living room, and sprinklers front and
                rear. There is no HOA and no common interest — $0 in dues.
              </p>
            </div>
          </div>
        </section>

        <section className="wrap" id="highlights">
          <div className="label">Highlights</div>
          <h2 style={{ marginTop: 16, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--navy)" }}>
            What stands out.
          </h2>
          <div className="highlights-grid">
            {HIGHLIGHT_CARDS.map(([ico, title, sub]) => (
              <div className="highlight-card" key={title}>
                <div className="ico">{ico}</div>
                <div className="title">{title}</div>
                <div className="sub">{sub}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap" id="gallery">
          <div className="label">Photo Tour</div>
          <h2 style={{ marginTop: 16, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--navy)" }}>
            Room by room.
          </h2>
          <p style={{ marginTop: 14, maxWidth: 640, color: "var(--muted)" }}>
            Walk the home room by room — the living room and fireplace, the dining and great
            room, the kitchen, and the bedroom wing. Tap any photo to enlarge.
          </p>

          <HighlightGallery />
          <RoomTour />
        </section>

        <section className="facts-section" id="details">
          <div className="wrap facts-grid">
            <div>
              <div className="label">Property Details</div>
              <h2>The essentials.</h2>
              <p>
                Public record and agent-verified facts for 9621 Jumilla Ave. Contact Kareem for
                the full disclosure package and comparable sales.
              </p>
              <a className="cta-btn" href="#contact">
                Request disclosures
              </a>
            </div>
            <dl className="facts">
              {FACTS.map(([k, v]) => (
                <div className="fact-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="wrap" id="location">
          <div className="story-grid">
            <div>
              <div className="label">The Location</div>
              <h2>West Valley living.</h2>
              <a
                href={MAPS}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 22,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(201,168,76,0.6)",
                  textUnderlineOffset: 4,
                }}
              >
                📍 Open in Google Maps
              </a>
            </div>
            <div className="prose">
              <p>
                Located in Chatsworth, this home sits near the northwest corner of the San
                Fernando Valley, where quiet residential streets meet the raw beauty of the Santa
                Susana Mountains. Trailheads, community parks, and a Metrolink stop are all
                within easy reach.
              </p>
              <p>
                Everyday essentials sit minutes away along Devonshire and Nordhoff, with quick
                access to the 118 for a straight shot to Simi Valley, Woodland Hills, or downtown
                LA. The property is in the Los Angeles Unified School District.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="wrap contact-grid">
            <div>
              <div className="label" style={{ color: "var(--gold)" }}>
                Presented By
              </div>
              <h2>Kareem Jamal</h2>
              <p className="contact-role">Realtor · DRE #01998956</p>
              <p className="contact-desc">
                For private showings, offer submissions, or the full disclosure package, reach
                out directly. I&rsquo;d love to walk you through 9621 Jumilla in person.
              </p>
              <div className="contact-card">
                <div className="contact-item">
                  <div className="k">📞 Mobile</div>
                  <a className="v" href="tel:+18184027326">
                    (818) 402-7326
                  </a>
                </div>
                <div className="contact-item">
                  <div className="k">📞 Office</div>
                  <a className="v" href="tel:+18189992030">
                    (818) 999-2030
                  </a>
                </div>
                <div className="contact-item">
                  <div className="k">✉️ Email</div>
                  <a className="v" href="mailto:kjamal@rodeore.com" style={{ wordBreak: "break-all" }}>
                    kjamal@rodeore.com
                  </a>
                </div>
                <div className="contact-office">
                  Rodeo Realty · 21031 Ventura Blvd, Ste 100 · Woodland Hills, CA 91364
                </div>
              </div>
            </div>

            <div className="cta-panel">
              <h3>Request a showing</h3>
              <p>Text or call Kareem directly — no forms, no spam, ever.</p>
              <div className="cta-chip-row">
                {["Schedule a tour", "Request disclosures", "Discuss an offer", "General question"].map(
                  (c) => (
                    <span className="cta-chip" key={c}>
                      {c}
                    </span>
                  )
                )}
              </div>
              <div className="cta-actions">
                <a
                  className="primary"
                  href="sms:+18184027326?&body=Hi%20Kareem%2C%20I%27m%20interested%20in%209621%20Jumilla%20Ave%20in%20Chatsworth.%20Can%20we%20talk%3F"
                >
                  💬 Text Kareem about this home
                </a>
                <a
                  className="primary"
                  href="tel:+18184027326"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                  }}
                >
                  📞 Call (818) 402-7326
                </a>
              </div>
              <p className="cta-fine">
                By reaching out, you agree to be contacted about this property. Your details are
                never shared or sold.
              </p>
            </div>
          </div>
        </section>

        <footer>
          © {new Date().getFullYear()} Kareem Jamal · Rodeo Realty. Information deemed reliable
          but not guaranteed. Equal Housing Opportunity.
        </footer>
      </main>

      <StickyCta />
    </div>
  );
}
