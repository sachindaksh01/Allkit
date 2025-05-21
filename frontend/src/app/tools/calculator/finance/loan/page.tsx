'use client';
import React, { useState } from "react";

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function calculateLoan() {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseInt(years) * 12;
    if (!p || !r || !n) return null;
    const monthly = (p * r) / (1 - Math.pow(1 + r, -n));
    const total = monthly * n;
    const interest = total - p;
    return { monthly: monthly.toFixed(2), total: total.toFixed(2), interest: interest.toFixed(2) };
  }

  function handleClear() {
    setPrincipal("");
    setRate("");
    setYears("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Loan Calculator</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const res = calculateLoan();
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
          <label className="block mb-1 font-medium">Term (years)</label>
          <input type="number" value={years} onChange={e => setYears(e.target.value)} className="w-full border rounded px-3 py-2" min="1" required />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>Monthly Payment: <span className="text-blue-600">₹{result.monthly}</span></div>
          <div>Total Payment: <span className="text-blue-600">₹{result.total}</span></div>
          <div>Total Interest: <span className="text-blue-600">₹{result.interest}</span></div>
        </div>
      )}
    </div>
  );
} 