'use client';
import React, { useState } from "react";

const units = [
  { label: 'Meter (m)', value: 'm', toMeter: 1 },
  { label: 'Kilometer (km)', value: 'km', toMeter: 1000 },
  { label: 'Centimeter (cm)', value: 'cm', toMeter: 0.01 },
  { label: 'Millimeter (mm)', value: 'mm', toMeter: 0.001 },
  { label: 'Foot (ft)', value: 'ft', toMeter: 0.3048 },
  { label: 'Inch (in)', value: 'in', toMeter: 0.0254 },
  { label: 'Yard (yd)', value: 'yd', toMeter: 0.9144 },
  { label: 'Mile (mi)', value: 'mi', toMeter: 1609.34 },
];

export default function UnitConverter() {
  const [value, setValue] = useState("");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function convert() {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    const fromUnit = units.find(u => u.value === from);
    const toUnit = units.find(u => u.value === to);
    if (!fromUnit || !toUnit) return null;
    const meters = v * fromUnit.toMeter;
    const converted = meters / toUnit.toMeter;
    return converted.toFixed(6);
  }

  function handleClear() {
    setValue("");
    setFrom("m");
    setTo("km");
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Unit Converter</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const res = convert();
          if (!res) {
            setError("Please enter a valid value.");
            setResult(null);
          } else {
            setResult(res);
            setError(null);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full border rounded px-3 py-2" min="0.000001" step="any" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1 font-medium">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className="w-full border rounded px-3 py-2">
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">To</label>
            <select value={to} onChange={e => setTo(e.target.value)} className="w-full border rounded px-3 py-2">
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Convert</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          Converted Value: <span className="text-blue-600">{result} {to}</span>
        </div>
      )}
    </div>
  );
} 