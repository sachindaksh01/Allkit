'use client';
import React, { useState } from "react";

export default function TimeCalculator() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [diff, setDiff] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculateTimeDiff(startTime: string, endTime: string) {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;
    let startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;
    let diff = endMinutes - startMinutes;
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours} hours ${minutes} minutes`;
  }

  function handleClear() {
    setStart("");
    setEnd("");
    setDiff(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Time Calculator</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!start || !end) {
            setError("Both times are required.");
            setDiff(null);
            return;
          }
          const result = calculateTimeDiff(start, end);
          if (result === null) {
            setError("Invalid time input.");
            setDiff(null);
          } else {
            setDiff(result);
            setError(null);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <input
            type="time"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            placeholder="e.g. 09:00"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">End Time</label>
          <input
            type="time"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            placeholder="e.g. 17:30"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate Time Difference</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {diff !== null && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          Difference: <span className="text-blue-600">{diff}</span>
        </div>
      )}
    </div>
  );
} 