'use client';
import React, { useState } from "react";

export default function PercentageCalculator() {
  const [value, setValue] = useState("");
  const [percent, setPercent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const v = parseFloat(value);
    const p = parseFloat(percent);
    if (isNaN(v) || isNaN(p)) return null;
    const percentOf = (v * p) / 100;
    const increased = v + percentOf;
    const decreased = v - percentOf;
    return { percentOf: percentOf.toFixed(2), increased: increased.toFixed(2), decreased: decreased.toFixed(2) };
  }

  function handleClear() {
    setValue("");
    setPercent("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Percentage Calculator</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const res = calculate();
          if (!res) {
            setError("Please enter valid numbers.");
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
          <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full border rounded px-3 py-2" min="0.01" step="0.01" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Percent (%)</label>
          <input type="number" value={percent} onChange={e => setPercent(e.target.value)} className="w-full border rounded px-3 py-2" min="0.01" step="0.01" required />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>{percent}% of {value} = <span className="text-blue-600">{result.percentOf}</span></div>
          <div>Value after increase: <span className="text-green-600">{result.increased}</span></div>
          <div>Value after decrease: <span className="text-red-600">{result.decreased}</span></div>
        </div>
      )}
    </div>
  );
} 