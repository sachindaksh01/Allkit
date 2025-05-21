'use client';
import React, { useState } from "react";

function parseDateDMY(dateStr: string) {
  const [d, m, y] = dateStr.split('-').map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function getAgeDetails(dob: Date, asOf: Date) {
  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days = asOf.getDate() - dob.getDate();
  let hours = asOf.getHours() - dob.getHours();
  let minutes = asOf.getMinutes() - dob.getMinutes();
  let seconds = asOf.getSeconds() - dob.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    months--;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { months += 12; years--; }
  return { years, months, days, hours, minutes, seconds };
}

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dobDate = parseDateDMY(dob);
    const asOfDate = asOf ? parseDateDMY(asOf) : new Date();
    if (!dobDate || !asOfDate) {
      setError("Please enter valid dates in DD-MM-YYYY format.");
      setResult(null);
      return;
    }
    if (dobDate > asOfDate) {
      setError("DOB must be before the 'as of' date.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(getAgeDetails(dobDate, asOfDate));
  }

  function handleClear() {
    setDob("");
    setAsOf("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Age Calculator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Date of Birth (DD-MM-YYYY)</label>
          <input
            type="text"
            placeholder="e.g. 25-12-2000"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            pattern="\d{2}-\d{2}-\d{4}"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">As of Date (DD-MM-YYYY, optional)</label>
          <input
            type="text"
            placeholder="e.g. 01-01-2024 (leave blank for today)"
            value={asOf}
            onChange={e => setAsOf(e.target.value)}
            className="w-full border rounded px-3 py-2"
            pattern="\d{2}-\d{2}-\d{4}"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate Age</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>Years: <span className="text-blue-600">{result.years}</span></div>
          <div>Months: <span className="text-blue-600">{result.months}</span></div>
          <div>Days: <span className="text-blue-600">{result.days}</span></div>
          <div>Hours: <span className="text-blue-600">{result.hours}</span></div>
          <div>Minutes: <span className="text-blue-600">{result.minutes}</span></div>
          <div>Seconds: <span className="text-blue-600">{result.seconds}</span></div>
        </div>
      )}
    </div>
  );
} 