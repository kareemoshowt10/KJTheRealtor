type AttributionFields = Record<string, unknown>;

/** Add source details only when a visitor chooses to send a lead form. */
export function addLeadAttribution(formData: FormData) {
  const attribution = (window as Window & {
    kjAttribution?: { first?: AttributionFields; last?: AttributionFields };
  }).kjAttribution;
  const first = attribution?.first;
  const last = attribution?.last;
  const fields: AttributionFields = {
    lead_source: last?.lead_source,
    first_touch_source: first?.lead_source,
    utm_source: last?.utm_source,
    utm_medium: last?.utm_medium,
    utm_campaign: last?.utm_campaign,
    utm_term: last?.utm_term,
    utm_content: last?.utm_content,
    gclid: last?.gclid,
    fbclid: last?.fbclid,
    referrer: last?.referrer,
    landing_page: first?.landing_page,
    submitted_from: window.location.pathname,
  };

  for (const [name, value] of Object.entries(fields)) {
    if (typeof value !== "string" || !value.trim()) continue;
    const existing = formData.get(name);
    if (existing === null || !String(existing).trim()) {
      formData.set(name, value.slice(0, 200));
    }
  }
}
