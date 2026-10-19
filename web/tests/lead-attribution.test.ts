import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { addLeadAttribution } from '../src/lib/lead-attribution.ts';

const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
});

function withAttribution(attribution?: Record<string, unknown>) {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { pathname: '/first-home-plan' }, kjAttribution: attribution },
  });
}

test('a submitted form includes its page even if tracking storage is unavailable', () => {
  withAttribution();
  const data = new FormData();
  addLeadAttribution(data);
  assert.equal(data.get('submitted_from'), '/first-home-plan');
  assert.equal(data.has('lead_source'), false);
  assert.equal(data.has('entry_keyword'), false);
});

test('first and last touch are included without overwriting explicit campaign fields', () => {
  withAttribution({
    first: { lead_source: 'google / organic', landing_page: '/answers' },
    last: { lead_source: 'instagram / social', utm_source: 'instagram', utm_campaign: 'old-campaign' },
  });
  const data = new FormData();
  data.set('utm_campaign', 'first-home-launch');
  data.set('entry_keyword', 'READY');
  addLeadAttribution(data);
  assert.equal(data.get('first_touch_source'), 'google / organic');
  assert.equal(data.get('landing_page'), '/answers');
  assert.equal(data.get('lead_source'), 'instagram / social');
  assert.equal(data.get('utm_source'), 'instagram');
  assert.equal(data.get('utm_campaign'), 'first-home-launch');
  assert.equal(data.get('entry_keyword'), 'READY');
});

test('stored attribution values are bounded before form submission', () => {
  withAttribution({ last: { lead_source: 'x'.repeat(300) } });
  const data = new FormData();
  addLeadAttribution(data);
  assert.equal(String(data.get('lead_source')).length, 200);
});
