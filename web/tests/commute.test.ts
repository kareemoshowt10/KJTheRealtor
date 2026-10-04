import assert from 'node:assert/strict';
import test from 'node:test';
import { blankOption, calculate, defaultSettings } from '../src/lib/commute.ts';
import type { Option, Settings } from '../src/lib/commute.ts';

function example(overrides: Partial<Option> = {}): Option {
  return {
    ...blankOption('Farther home'),
    miles: '50',
    minutes: '60',
    busyMinutes: '90',
    days: '5',
    housing: '2500',
    other: '100',
    efficiency: '25',
    ratings: { driving: '4', fuel: '3', family: '2', access: '5' },
    ...overrides,
  };
}

function settings(overrides: Partial<Settings> = {}): Settings {
  return {
    ...defaultSettings,
    // These are arithmetic fixtures, not current prices supplied to visitors.
    gas: '5',
    highGas: '7',
    electricity: '0.30',
    highElectricity: '0.50',
    weights: { ...defaultSettings.weights },
    ...overrides,
  };
}

test('default energy prices stay blank and costs remain unknown until entered', () => {
  for (const price of ['gas', 'highGas', 'electricity', 'highElectricity'] as const) {
    assert.equal(defaultSettings[price], '');
  }
  for (const mode of ['gas', 'electric'] as const) {
    const result = calculate(example({ mode }), defaultSettings);
    assert.equal(result.annualMiles, 24000);
    assert.equal(result.annualHours, 480);
    assert.equal(result.fuel, null);
    assert.equal(result.highFuel, null);
    assert.equal(result.monthlyTotal, null);
  }
});

test('gas estimates use round trips, scheduled weeks and both price scenarios', () => {
  const result = calculate(example(), settings());
  assert.equal(result.annualMiles, 24000);
  assert.equal(result.annualHours, 480);
  assert.equal(result.fuel, 400);
  assert.equal(result.highFuel, 560);
  assert.equal(result.monthlyTotal, 3000);
  assert.equal(result.fit, 3.5);
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.pending, []);
});

test('electric efficiency is kWh per 100 miles, not miles per kWh', () => {
  const result = calculate(example({ mode: 'electric', efficiency: '30' }), settings());
  assert.equal(result.fuel, 180);
  assert.equal(result.highFuel, 300);
  assert.equal(result.monthlyTotal, 2780);
});

test('a price-spike scenario below the normal price stays unknown and leaves an energy cap pending', () => {
  for (const mode of ['gas', 'electric'] as const) {
    const result = calculate(example({ mode, efficiency: mode === 'gas' ? '25' : '30' }), settings({
      highGas: '4', highElectricity: '0.20', maxFuel: '1000',
    }));
    assert.equal(result.fuel, mode === 'gas' ? 400 : 180);
    assert.equal(result.highFuel, null);
    assert.deepEqual(result.failed, []);
    assert.equal(result.pending.length, 1);
  }
});

test('a stress price equal to the normal price remains valid', () => {
  const result = calculate(example(), settings({ highGas: '5', maxFuel: '400' }));
  assert.equal(result.highFuel, 400);
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.pending, []);
});

test('a lower stress price does not create commute costs for a confirmed noncommuter', () => {
  const result = calculate(example({ days: '0' }), settings({ highGas: '4', maxFuel: '0' }));
  assert.equal(result.fuel, 0);
  assert.equal(result.highFuel, 0);
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.pending, []);
});

test('zero commute days produce zero travel and energy without route, vehicle or prices', () => {
  const result = calculate({ ...blankOption('Remote'), days: '0', housing: '2000' }, settings({
    weeks: '', gas: '', highGas: '', electricity: '', highElectricity: '', maxFuel: '0',
  }));
  assert.equal(result.annualMiles, 0);
  assert.equal(result.annualHours, 0);
  assert.equal(result.fuel, 0);
  assert.equal(result.highFuel, 0);
  assert.equal(result.monthlyTotal, 2000);
  assert.deepEqual(result.pending, []);
  assert.deepEqual(result.failed, []);
});

test('zero commute days do not need a busy-day route to satisfy a time cap', () => {
  for (const busyMinutes of ['', '120']) {
    const result = calculate(example({ days: '0', busyMinutes }), settings({ maxMinutes: '45' }));
    assert.deepEqual(result.pending, []);
    assert.deepEqual(result.failed, []);
  }
});

test('blank inputs stay unknown and do not masquerade as zero', () => {
  const result = calculate(blankOption('Unknown'), settings());
  assert.equal(result.annualMiles, null);
  assert.equal(result.annualHours, null);
  assert.equal(result.fuel, null);
  assert.equal(result.highFuel, null);
  assert.equal(result.monthlyTotal, null);
  assert.equal(result.fit, null);
});

test('a known route and schedule can show time even when energy inputs are missing', () => {
  const result = calculate(example({ efficiency: '' }), settings());
  assert.equal(result.annualMiles, 24000);
  assert.equal(result.annualHours, 480);
  assert.equal(result.fuel, null);
  assert.equal(result.highFuel, null);
  assert.equal(result.monthlyTotal, null);
});

test('zero vehicle efficiency is invalid in both modes', () => {
  for (const mode of ['gas', 'electric'] as const) {
    const result = calculate(example({ mode, efficiency: '0' }), settings());
    assert.equal(result.fuel, null);
    assert.equal(result.highFuel, null);
  }
});

test('invalid numeric values and out-of-range days remain unknown', () => {
  for (const value of ['', ' ', '-1', 'NaN', 'Infinity', 'abc', '8']) {
    const result = calculate(example({ days: value }), settings());
    assert.equal(result.annualMiles, null, `days=${value}`);
    assert.equal(result.annualHours, null, `days=${value}`);
    assert.equal(result.fuel, null, `days=${value}`);
  }
});

test('working weeks must be above zero and no more than 52', () => {
  for (const value of ['', '0', '-1', '53', 'Infinity']) {
    const result = calculate(example(), settings({ weeks: value }));
    assert.equal(result.annualMiles, null, `weeks=${value}`);
    assert.equal(result.annualHours, null, `weeks=${value}`);
    assert.equal(result.fuel, null, `weeks=${value}`);
  }
  assert.equal(calculate(example({ days: '7' }), settings({ weeks: '52' })).annualMiles, 36400);
});

test('blank optional other costs mean zero, while housing is required', () => {
  assert.equal(calculate(example({ other: '' }), settings()).monthlyTotal, 2900);
  assert.equal(calculate(example({ housing: '' }), settings()).monthlyTotal, null);
  assert.equal(calculate(example({ other: '-10' }), settings()).monthlyTotal, null);
  assert.equal(calculate(example({ housing: '0', other: '0' }), settings()).monthlyTotal, 400);
});

test('time cap checks busy-day minutes and energy cap checks stress-price spending', () => {
  const result = calculate(example(), settings({ maxMinutes: '75', maxFuel: '500' }));
  assert.equal(result.failed.length, 2);
  assert.match(result.failed[0], /busy-day/);
  assert.match(result.failed[1], /stress price/);
  assert.deepEqual(result.pending, []);
});

test('values exactly at must-have caps pass', () => {
  const result = calculate(example(), settings({ maxMinutes: '90', maxFuel: '560' }));
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.pending, []);
});

test('missing busy-day time and missing stress price make selected caps pending', () => {
  const result = calculate(example({ busyMinutes: '' }), settings({
    highGas: '', maxMinutes: '75', maxFuel: '500',
  }));
  assert.deepEqual(result.failed, []);
  assert.equal(result.pending.length, 2);
  assert.equal(result.fuel, 400);
  assert.equal(result.highFuel, null);
});

test('invalid caps are pending instead of silently disabling a must-have', () => {
  const result = calculate(example(), settings({ maxMinutes: '-1', maxFuel: 'NaN' }));
  assert.deepEqual(result.failed, []);
  assert.equal(result.pending.length, 2);
});

test('required support and destinations distinguish no from unknown', () => {
  const selected = settings({ requireFamily: true, requireAccess: true });
  const unavailable = calculate(example({ support: 'no', essentials: 'no' }), selected);
  assert.equal(unavailable.failed.length, 2);
  assert.deepEqual(unavailable.pending, []);
  const unknown = calculate(example(), selected);
  assert.deepEqual(unknown.failed, []);
  assert.equal(unknown.pending.length, 2);
  const confirmed = calculate(example({ support: 'yes', essentials: 'yes' }), selected);
  assert.deepEqual(confirmed.failed, []);
  assert.deepEqual(confirmed.pending, []);
});

test('unselected support and access constraints do not create failures', () => {
  const result = calculate(example({ support: 'no', essentials: 'no' }), settings());
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.pending, []);
});

test('weighted fit uses all four ratings and reflects the chosen importance', () => {
  const result = calculate(example(), settings({
    weights: { driving: '5', fuel: '1', family: '1', access: '1' },
  }));
  assert.equal(result.fit, 3.75);
});

test('fit is unknown until every rating and weight is between one and five', () => {
  for (const value of ['', '0', '6', '-1', 'Infinity']) {
    const option = example();
    option.ratings.family = value;
    assert.equal(calculate(option, settings()).fit, null, `rating=${value}`);
    const config = settings();
    config.weights.family = value;
    assert.equal(calculate(example(), config).fit, null, `weight=${value}`);
  }
});

test('a high fit never hides a failed must-have', () => {
  const result = calculate(example({
    ratings: { driving: '5', fuel: '5', family: '5', access: '5' }, support: 'no',
  }), settings({ requireFamily: true }));
  assert.equal(result.fit, 5);
  assert.equal(result.failed.length, 1);
});

test('overflowing derived numbers remain unknown rather than returning infinity', () => {
  const result = calculate(example({ miles: '1e308', minutes: '1e308' }), settings());
  assert.equal(result.annualMiles, null);
  assert.equal(result.annualHours, null);
  assert.equal(result.fuel, null);
});

test('blank options have independent rating records and calculation does not mutate inputs', () => {
  const first = blankOption('First');
  const second = blankOption('Second');
  first.ratings.driving = '5';
  assert.equal(second.ratings.driving, '');
  const option = example();
  const config = settings();
  const original = JSON.stringify({ option, config });
  calculate(option, config);
  assert.equal(JSON.stringify({ option, config }), original);
});
