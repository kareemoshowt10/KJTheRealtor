"use client";

import { useEffect, useState } from "react";
import InteractiveBentoGallery, {
  type MediaItemType,
} from "@/components/ui/interactive-bento-gallery";

const IMG = "/images/9621-jumilla/";
const photoSrc = (n: number) => `${IMG}jumilla-mls-${String(n).padStart(3, "0")}.jpg`;

/** The full tour, unchanged from the previous static page. */
const ROOMS: { id: string; name: string; note: string; photos: number[] }[] = [
  {
    id: "living",
    name: "Living Room",
    note: "Brick fireplace, vaulted ceiling and recessed lighting at the front of the home.",
    photos: [2, 3, 7, 8, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64],
  },
  {
    id: "dining",
    name: "Dining & Great Room",
    note: "Arched openings and built-in shelving tie the dining area to the kitchen and living room, with a slider out to the patio.",
    photos: [4, 5, 6, 65, 66, 67, 70, 71, 72, 73],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    note: "Wood cabinetry, granite counters, stone backsplash, gas range and stainless appliances.",
    photos: [68, 69],
  },
  {
    id: "bedrooms",
    name: "Bedrooms",
    note: "Five bedrooms across the wing — wood floors, carpet, and generous closet space throughout.",
    photos: [
      9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 35,
      36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
    ],
  },
  {
    id: "bath",
    name: "Bath",
    note: "Dual vanity, soaking tub and a separate tiled shower.",
    photos: [20],
  },
  {
    id: "bonus",
    name: "Bonus / Sitting Room",
    note: "A flexible room for a home office, guest lounge or second family room.",
    photos: [28, 29],
  },
  {
    id: "halls",
    name: "Halls & Flow",
    note: "The central hallway linking the bedroom wing to the main living spaces.",
    photos: [1, 26, 27],
  },
];

/**
 * A curated set for the bento gallery. Deliberately seven photos, not all 73 —
 * the bento layout is a highlight reel, and the room-by-room tour below stays
 * the place to browse everything.
 */
const HIGHLIGHTS: MediaItemType[] = [
  {
    id: 1,
    type: "image",
    title: "Dining & Great Room",
    desc: "Arched openings, chandelier, slider to the patio",
    url: photoSrc(6),
    span: "md:col-span-2 md:row-span-3 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 2,
    type: "image",
    title: "Living Room",
    desc: "Brick fireplace and vaulted ceiling",
    url: photoSrc(2),
    span: "md:col-span-2 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 3,
    type: "image",
    title: "Kitchen",
    desc: "Granite counters, gas range, stainless appliances",
    url: photoSrc(68),
    span: "md:col-span-2 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 4,
    type: "image",
    title: "Primary Bath",
    desc: "Dual vanity, soaking tub, separate tiled shower",
    url: photoSrc(20),
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 5,
    type: "image",
    title: "Bedrooms",
    desc: "Five bedrooms, all on one level",
    url: photoSrc(9),
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 6,
    type: "image",
    title: "Bonus Room",
    desc: "Home office, guest lounge or second family room",
    url: photoSrc(28),
    span: "md:col-span-2 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 7,
    type: "image",
    title: "Great Room",
    desc: "Built-in shelving and open flow to the dining area",
    url: photoSrc(55),
    span: "md:col-span-2 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
];

export function HighlightGallery() {
  return (
    <InteractiveBentoGallery
      mediaItems={HIGHLIGHTS}
      title="A first look."
      description="Seven rooms at a glance — tap any photo to open it, or scroll on for the full room-by-room tour."
    />
  );
}

/** The full room-by-room tour with its lightbox, ported from the static page. */
export function RoomTour() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div id="room-grid">
        {ROOMS.map((room) => {
          const count = room.photos.length;
          return (
            <div className="room" id={`room-${room.id}`} key={room.id}>
              <div className="room-head">
                <h3>{room.name}</h3>
                <span className="room-count">
                  {count} {count === 1 ? "photo" : "photos"}
                </span>
              </div>
              <p className="room-note">{room.note}</p>
              <div className="room-photos">
                {room.photos.map((n, i) => {
                  const src = photoSrc(n);
                  const alt = `9621 Jumilla Ave, Chatsworth — ${room.name.replace(
                    "&",
                    "and"
                  )} photo ${i + 1}`;
                  return (
                    <a
                      key={n}
                      href="#"
                      className={i === 0 && count > 1 ? "wide" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        setLightbox({ src, alt });
                      }}
                    >
                      <img src={src} alt={alt} loading="lazy" />
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`lightbox${lightbox ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null);
        }}
      >
        <button
          className="lightbox-close"
          aria-label="Close photo"
          onClick={() => setLightbox(null)}
        >
          ✕
        </button>
        <figure style={{ maxWidth: "1100px" }}>
          {lightbox && <img src={lightbox.src} alt={lightbox.alt} />}
          <figcaption>{lightbox?.alt}</figcaption>
        </figure>
      </div>
    </>
  );
}

/** Mobile price bar that appears once you have scrolled past the hero. */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`sticky-cta${show ? " show" : ""}`}>
      <div>
        <div className="price">$999,999</div>
        <div className="meta">5 bed &middot; 2.5 bath &middot; 2,144 sq ft</div>
      </div>
      <a href="tel:+18184027326">Call Kareem</a>
    </div>
  );
}
