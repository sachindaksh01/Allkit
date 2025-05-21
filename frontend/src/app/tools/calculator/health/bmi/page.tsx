'use client';
import React, { useState } from "react";

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

const bmiChart = [
  { label: 'Underweight', min: 0, max: 18.5, color: 'bg-blue-400' },
  { label: 'Normal', min: 18.5, max: 25, color: 'bg-green-500' },
  { label: 'Overweight', min: 25, max: 30, color: 'bg-yellow-400' },
  { label: 'Obese', min: 30, max: 50, color: 'bg-red-500' },
];

export default function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculateBMI(weight: string, height: string) {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to meters
    if (!w || !h) return null;
    const bmiValue = w / (h * h);
    return bmiValue;
  }

  function handleClear() {
    setWeight("");
    setHeight("");
    setBmi(null);
    setCategory(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">BMI Calculator</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!weight || !height) {
            setError("Both weight and height are required.");
            setBmi(null);
            setCategory(null);
            return;
          }
          const bmiValue = calculateBMI(weight, height);
          if (!bmiValue) {
            setError("Please enter valid numbers.");
            setBmi(null);
            setCategory(null);
          } else {
            setBmi(bmiValue);
            setCategory(getBMICategory(bmiValue));
            setError(null);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="1"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate BMI</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {bmi !== null && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>Your BMI: <span className="text-blue-600">{bmi.toFixed(2)}</span></div>
          <div className="mt-2 text-sm">Category: <span className="font-bold">{category}</span></div>
          <div className="mt-6">
            <div className="flex justify-between text-xs mb-1">
              {bmiChart.map((c) => (
                <span key={c.label} className="w-1/4 text-center">{c.label}</span>
              ))}
            </div>
            <div className="flex h-4 rounded overflow-hidden">
              {bmiChart.map((c) => (
                <div key={c.label} className={`${c.color} flex-1 relative`}>
                  {bmi >= c.min && bmi < c.max && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2 h-4 bg-black rounded" title="Your BMI" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-1">
              {bmiChart.map((c) => (
                <span key={c.label} className="w-1/4 text-center">{c.min} - {c.max === 50 ? '∞' : c.max}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 