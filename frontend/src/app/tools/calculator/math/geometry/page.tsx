'use client';
import React, { useState } from "react";

const shapes = [
  { label: 'Circle', value: 'circle' },
  { label: 'Square', value: 'square' },
  { label: 'Rectangle', value: 'rectangle' },
  { label: 'Triangle', value: 'triangle' },
];

export default function GeometryCalculator() {
  const [shape, setShape] = useState('circle');
  const [dim1, setDim1] = useState('');
  const [dim2, setDim2] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const a = parseFloat(dim1);
    const b = parseFloat(dim2);
    if (isNaN(a) || (['rectangle', 'triangle'].includes(shape) && isNaN(b))) return null;
    let area = 0, perimeter = 0;
    if (shape === 'circle') {
      area = Math.PI * a * a;
      perimeter = 2 * Math.PI * a;
    } else if (shape === 'square') {
      area = a * a;
      perimeter = 4 * a;
    } else if (shape === 'rectangle') {
      area = a * b;
      perimeter = 2 * (a + b);
    } else if (shape === 'triangle') {
      area = 0.5 * a * b;
      perimeter = a + b + Math.sqrt(a * a + b * b); // right triangle
    }
    return { area: area.toFixed(2), perimeter: perimeter.toFixed(2) };
  }

  function handleClear() {
    setDim1('');
    setDim2('');
    setResult(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Geometry Calculator</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const res = calculate();
          if (!res) {
            setError("Please enter valid dimensions.");
            setResult(null);
          } else {
            setResult(res);
            setError(null);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="block mb-1 font-medium">Shape</label>
          <select value={shape} onChange={e => setShape(e.target.value)} className="w-full border rounded px-3 py-2">
            {shapes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {shape === 'circle' ? 'Radius' : shape === 'square' ? 'Side' : 'Base'}
          </label>
          <input type="number" value={dim1} onChange={e => setDim1(e.target.value)} className="w-full border rounded px-3 py-2" min="0.01" step="any" required />
        </div>
        {(shape === 'rectangle' || shape === 'triangle') && (
          <div>
            <label className="block mb-1 font-medium">{shape === 'rectangle' ? 'Height' : 'Height (for area)'}</label>
            <input type="number" value={dim2} onChange={e => setDim2(e.target.value)} className="w-full border rounded px-3 py-2" min="0.01" step="any" required />
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {result && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          <div>Area: <span className="text-blue-600">{result.area}</span></div>
          <div>Perimeter: <span className="text-blue-600">{result.perimeter}</span></div>
        </div>
      )}
    </div>
  );
} 