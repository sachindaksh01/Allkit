'use client';
import React, { useState } from "react";

function parseDateDMY(dateStr: string) {
  const [d, m, y] = dateStr.split('-').map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB');
}

export default function PregnancyCalculator() {
  const [lmp, setLmp] = useState("");
  const [cycle, setCycle] = useState("28");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lmpDate = parseDateDMY(lmp);
    const cycleLength = parseInt(cycle) || 28;
    if (!lmpDate) {
      setError("Please enter a valid date in DD-MM-YYYY format.");
      setResult(null);
      return;
    }
    const dueDate = addDays(lmpDate, 280 + (cycleLength - 28));
    const today = new Date();
    const daysPregnant = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(daysPregnant / 7);
    const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;
    const daysLeft = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    setError(null);
    setResult({ dueDate, weeks, trimester, daysLeft });
  }

  function handleClear() {
    setLmp("");
    setCycle("28");
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Pregnancy Calculator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Last Period Date (DD-MM-YYYY)</label>
          <input
            type="text"
            placeholder="e.g. 01-01-2024"
            value={lmp}
            onChange={e => setLmp(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            pattern="\d{2}-\d{2}-\d{4}"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Cycle Length (days)</label>
          <input
            type="number"
            value={cycle}
            onChange={e => setCycle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="20"
            max="40"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>Due Date: <span className="text-blue-600">{formatDate(result.dueDate)}</span></div>
          <div>Current Week: <span className="text-blue-600">{result.weeks}</span></div>
          <div>Trimester: <span className="text-blue-600">{result.trimester}</span></div>
          <div>Days Left: <span className="text-blue-600">{result.daysLeft}</span></div>
        </div>
      )}
    </div>
  );
} 