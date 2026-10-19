/**
 * Unit conversion data and calculations for iOS 18 style calculator conversion
 */

export interface UnitCategory {
  id: string;
  name: string;
  icon: string;
  units: Array<{ id: string; name: string; symbol: string; toBase: (v: number) => number; fromBase: (v: number) => number }>;
}

export const CONVERSION_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    icon: 'Ruler',
    units: [
      { id: 'm', name: 'Meters', symbol: 'm', toBase: v => v, fromBase: v => v },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: v => v / 100, fromBase: v => v * 100 },
      { id: 'km', name: 'Kilometers', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { id: 'ft', name: 'Feet', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { id: 'yd', name: 'Yards', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      { id: 'mi', name: 'Miles', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    ],
  },
  {
    id: 'weight',
    name: 'Mass & Weight',
    icon: 'Scale',
    units: [
      { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: v => v, fromBase: v => v },
      { id: 'g', name: 'Grams', symbol: 'g', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: v => v * 0.028349523, fromBase: v => v / 0.028349523 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: 'Thermometer',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * (5 / 9), fromBase: v => (v * 9) / 5 + 32 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: 'Gauge',
    units: [
      { id: 'kmh', name: 'Kilometers per hour', symbol: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { id: 'ms', name: 'Meters per second', symbol: 'm/s', toBase: v => v, fromBase: v => v },
      { id: 'knot', name: 'Knots', symbol: 'kn', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    ],
  },
  {
    id: 'currency',
    name: 'Currency',
    icon: 'DollarSign',
    units: [
      { id: 'usd', name: 'US Dollar', symbol: '$ USD', toBase: v => v, fromBase: v => v },
      { id: 'eur', name: 'Euro', symbol: '€ EUR', toBase: v => v * 1.08, fromBase: v => v / 1.08 },
      { id: 'gbp', name: 'British Pound', symbol: '£ GBP', toBase: v => v * 1.28, fromBase: v => v / 1.28 },
      { id: 'jpy', name: 'Japanese Yen', symbol: '¥ JPY', toBase: v => v * 0.0066, fromBase: v => v / 0.0066 },
      { id: 'cny', name: 'Chinese Yuan', symbol: '¥ CNY', toBase: v => v * 0.14, fromBase: v => v / 0.14 },
      { id: 'cad', name: 'Canadian Dollar', symbol: 'CA$ CAD', toBase: v => v * 0.73, fromBase: v => v / 0.73 },
      { id: 'aud', name: 'Australian Dollar', symbol: 'A$ AUD', toBase: v => v * 0.65, fromBase: v => v / 0.65 },
    ],
  },
];

export function convertValue(
  val: number,
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string
): number {
  const fromUnit = category.units.find(u => u.id === fromUnitId) || category.units[0];
  const toUnit = category.units.find(u => u.id === toUnitId) || category.units[1];
  const baseVal = fromUnit.toBase(val);
  return toUnit.fromBase(baseVal);
}
