'use client';
import React, { useState } from "react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [compound, setCompound] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function calculateInterest() {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    if (!p || !r || !t) return null;
    let interest = 0, total = 0;
    if (compound) {
      total = p * Math.pow(1 + r, t);
      interest = total - p;
    } else {
      interest = p * r * t;
      total = p + interest;
    }
    return { interest: interest.toFixed(2), total: total.toFixed(2) };
  }

  function handleClear() {
    setPrincipal("");
    setRate("");
    setTime("");
    setCompound(false);
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Interest Calculator</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const res = calculateInterest();
          if (!res) {
            setError("Please fill all fields with valid values.");
            setResult(null);
          } else {
            setResult(res);
            setError(null);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Principal Amount</label>
          <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="w-full border rounded px-3 py-2" min="1" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Interest Rate (% per year)</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full border rounded px-3 py-2" min="0.01" step="0.01" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Time (years)</label>
          <input type="number" value={time} onChange={e => setTime(e.target.value)} className="w-full border rounded px-3 py-2" min="1" required />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={compound} onChange={e => setCompound(e.target.checked)} id="compound" />
          <label htmlFor="compound" className="text-sm">Compound Interest</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>Interest: <span className="text-blue-600">₹{result.interest}</span></div>
          <div>Total Amount: <span className="text-blue-600">₹{result.total}</span></div>
        </div>
      )}
    </div>
  );
} 