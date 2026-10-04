export type Factor = 'driving' | 'fuel' | 'family' | 'access';

export type Option = {
  name: string;
  /** Commute distance and times are one-way. */
  miles: string;
  minutes: string;
  busyMinutes: string;
  days: string;
  housing: string;
  other: string;
  mode: 'gas' | 'electric';
  /** Actual MPG for gas, or kWh per 100 miles for electric. */
  efficiency: string;
  ratings: Record<Factor, string>;
  support: 'unknown' | 'yes' | 'no';
  essentials: 'unknown' | 'yes' | 'no';
};

export type Settings = {
  weeks: string;
  gas: string;
  highGas: string;
  electricity: string;
  highElectricity: string;
  maxMinutes: string;
  maxFuel: string;
  requireFamily: boolean;
  requireAccess: boolean;
  weights: Record<Factor, string>;
};

export type Calculation = {
  annualMiles: number | null;
  annualHours: number | null;
  fuel: number | null;
  highFuel: number | null;
  monthlyTotal: number | null;
  fit: number | null;
  failed: string[];
  pending: string[];
};

const factors: Factor[] = ['driving', 'fuel', 'family', 'access'];

/** Prices stay blank until the visitor supplies a scenario. */
export const defaultSettings: Settings = {
  weeks: '48',
  gas: '',
  highGas: '',
  electricity: '',
  highElectricity: '',
  maxMinutes: '',
  maxFuel: '',
  requireFamily: false,
  requireAccess: false,
  weights: { driving: '3', fuel: '3', family: '3', access: '3' },
};

export function blankOption(name: string): Option {
  return {
    name,
    miles: '',
    minutes: '',
    busyMinutes: '',
    days: '',
    housing: '',
    other: '',
    mode: 'gas',
    efficiency: '',
    ratings: { driving: '', fuel: '', family: '', access: '' },
    support: 'unknown',
    essentials: 'unknown',
  };
}

function number(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function finite(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

function scale(value: string): number | null {
  const parsed = number(value);
  return parsed !== null && parsed >= 1 && parsed <= 5 ? parsed : null;
}

export function calculate(option: Option, settings: Settings): Calculation {
  const rawDays = number(option.days);
  const days = rawDays !== null && rawDays <= 7 ? rawDays : null;
  const rawWeeks = number(settings.weeks);
  const weeks = rawWeeks !== null && rawWeeks > 0 && rawWeeks <= 52 ? rawWeeks : null;
  const miles = number(option.miles);
  const minutes = number(option.minutes);
  const busyMinutes = number(option.busyMinutes);
  const efficiency = number(option.efficiency);
  const rate = number(option.mode === 'gas' ? settings.gas : settings.electricity);
  const highRate = number(option.mode === 'gas' ? settings.highGas : settings.highElectricity);
  const housing = number(option.housing);
  const other = option.other.trim() === '' ? 0 : number(option.other);

  // A confirmed zero-day schedule does not require a route, vehicle, or price.
  const annualMiles = days === 0 ? 0 :
    days !== null && weeks !== null && miles !== null ? finite(miles * 2 * days * weeks) : null;
  const annualHours = days === 0 ? 0 :
    days !== null && weeks !== null && minutes !== null ? finite(minutes * 2 * days * weeks / 60) : null;

  function monthlyFuel(price: number | null): number | null {
    if (days === 0) return 0;
    if (annualMiles === null || efficiency === null || efficiency <= 0 || price === null) return null;
    const units = option.mode === 'gas' ? annualMiles / efficiency : annualMiles * efficiency / 100;
    return finite(units * price / 12);
  }

  const fuel = monthlyFuel(rate);
  // A lower price cannot represent a price-spike check when both prices are known.
  const highFuel = days !== 0 && rate !== null && highRate !== null && highRate < rate ?
    null : monthlyFuel(highRate);
  const monthlyTotal = housing !== null && fuel !== null && other !== null ?
    finite(housing + fuel + other) : null;

  const ratings = factors.map(factor => scale(option.ratings[factor]));
  const weights = factors.map(factor => scale(settings.weights[factor]));
  let fit: number | null = null;
  if (ratings.every(value => value !== null) && weights.every(value => value !== null)) {
    fit = ratings.reduce<number>((total, value, index) => total + value! * weights[index]!, 0) /
      weights.reduce<number>((total, value) => total + value!, 0);
  }

  const failed: string[] = [];
  const pending: string[] = [];
  const maxMinutes = number(settings.maxMinutes);
  const maxFuel = number(settings.maxFuel);

  if (days !== 0 && settings.maxMinutes.trim() !== '') {
    if (maxMinutes === null) pending.push('Enter a valid maximum one-way commute time.');
    else if (busyMinutes === null) pending.push('Add the busy-day one-way commute to check your time limit.');
    else if (busyMinutes > maxMinutes) failed.push('The busy-day commute exceeds your maximum one-way time.');
  }

  if (settings.maxFuel.trim() !== '') {
    if (maxFuel === null) pending.push('Enter a valid monthly fuel or charging limit.');
    else if (highFuel === null) pending.push('Complete the commute, vehicle and stress-price inputs to check your monthly energy limit.');
    else if (highFuel > maxFuel) failed.push('Monthly fuel or charging at your stress price exceeds your limit.');
  }

  if (settings.requireFamily) {
    if (option.support === 'no') failed.push('Your required family support is not workable from this location.');
    else if (option.support === 'unknown') pending.push('Confirm whether your required family support is workable.');
  }

  if (settings.requireAccess) {
    if (option.essentials === 'no') failed.push('This location does not meet your required destination access.');
    else if (option.essentials === 'unknown') pending.push('Confirm access to your required schools, care and other destinations.');
  }

  return { annualMiles, annualHours, fuel, highFuel, monthlyTotal, fit, failed, pending };
}
