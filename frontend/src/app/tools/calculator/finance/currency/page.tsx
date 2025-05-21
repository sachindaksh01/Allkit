'use client';
import React, { useState } from "react";

const rates: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.7,
};
const currencies = Object.keys(rates);

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function convert() {
    const amt = parseFloat(amount);
    if (!amt) return null;
    const inr = amt / rates[from];
    const converted = inr * rates[to];
    return converted.toFixed(2);
  }

  function handleClear() {
    setAmount("");
    setFrom("INR");
    setTo("USD");
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Currency Converter</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const res = convert();
          if (!res) {
            setError("Please enter a valid amount.");
            setResult(null);
          } else {
            setResult(res);
            setError(null);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Amount</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border rounded px-3 py-2" min="0.01" step="0.01" required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1 font-medium">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className="w-full border rounded px-3 py-2">
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">To</label>
            <select value={to} onChange={e => setTo(e.target.value)} className="w-full border rounded px-3 py-2">
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
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
          Converted Amount: <span className="text-blue-600">{result} {to}</span>
        </div>
      )}
    </div>
  );
} 