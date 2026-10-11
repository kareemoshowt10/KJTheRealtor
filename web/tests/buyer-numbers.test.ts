import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buyerNumberDefaults,
  calculateBuyerNumbers,
  principalAndInterest,
} from '../src/lib/buyer-numbers.ts';

test('principal and interest matches the standard amortization formula', () => {
  // $400,000 at 6% for 30 years is a textbook $2,398.20/month.
  assert.equal(Math.round(principalAndInterest(400_000, 6, 30) * 100) / 100, 2398.2);
});

test('zero rate splits the loan evenly', () => {
  assert.equal(principalAndInterest(360_000, 0, 30), 1000);
});

test('PMI only applies under 20% down', () => {
  const under = calculateBuyerNumbers({ ...buyerNumberDefaults, downPct: 10 });
  const at = calculateBuyerNumbers({ ...buyerNumberDefaults, downPct: 20 });
  assert.ok(under.pmi > 0);
  assert.equal(at.pmi, 0);
});

test('housing payment is the sum of its parts', () => {
  const r = calculateBuyerNumbers(buyerNumberDefaults);
  const sum = r.pi + r.tax + r.insurance + r.hoa + r.pmi;
  assert.ok(Math.abs(r.housing - sum) < 1e-9);
});

test('no income means no DTI and not within target', () => {
  const r = calculateBuyerNumbers({ ...buyerNumberDefaults, incomeYear: 0 });
  assert.equal(r.dti, null);
  assert.equal(r.withinTarget, false);
});

test('garbage input does not produce NaN', () => {
  const r = calculateBuyerNumbers({ ...buyerNumberDefaults, price: Number.NaN, ratePct: -5 });
  assert.ok(Number.isFinite(r.housing));
});
