'use client';
import React, { useState } from "react";

function parseDateDMY(dateStr: string) {
  const [d, m, y] = dateStr.split('-').map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function getDateDiff(start: Date, end: Date) {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { months += 12; years--; }
  return { years, months, days };
}

export default function DateCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startDate = parseDateDMY(start);
    const endDate = parseDateDMY(end);
    if (!startDate || !endDate) {
      setError("Please enter valid dates in DD-MM-YYYY format.");
      setResult(null);
      return;
    }
    if (startDate > endDate) {
      setError("Start date must be before end date.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(getDateDiff(startDate, endDate));
  }

  function handleClear() {
    setStart("");
    setEnd("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Date Calculator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Start Date (DD-MM-YYYY)</label>
          <input
            type="text"
            placeholder="e.g. 01-01-2024"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            pattern="\d{2}-\d{2}-\d{4}"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">End Date (DD-MM-YYYY)</label>
          <input
            type="text"
            placeholder="e.g. 10-01-2024"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            pattern="\d{2}-\d{2}-\d{4}"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate Difference</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>Years: <span className="text-blue-600">{result.years}</span></div>
          <div>Months: <span className="text-blue-600">{result.months}</span></div>
          <div>Days: <span className="text-blue-600">{result.days}</span></div>
        </div>
      )}
    </div>
  );
} 