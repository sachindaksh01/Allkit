'use client';
import React, { useState } from "react";

const activityLevels = [
  { label: 'Sedentary (little or no exercise)', value: 1.2 },
  { label: 'Lightly active (light exercise/sports 1-3 days/week)', value: 1.375 },
  { label: 'Moderately active (moderate exercise/sports 3-5 days/week)', value: 1.55 },
  { label: 'Very active (hard exercise/sports 6-7 days/week)', value: 1.725 },
  { label: 'Super active (very hard exercise & physical job)', value: 1.9 },
];

export default function CalorieCalculator() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState(activityLevels[0].value);
  const [calories, setCalories] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculateCalories() {
    const a = parseInt(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!a || !h || !w) return null;
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a);
    } else {
      bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    }
    return Math.round(bmr * activity);
  }

  function handleClear() {
    setAge("");
    setGender("male");
    setHeight("");
    setWeight("");
    setActivity(activityLevels[0].value);
    setCalories(null);
    setError(null);
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Calorie Calculator</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          const result = calculateCalories();
          if (!result) {
            setError("Please fill all fields with valid values.");
            setCalories(null);
          } else {
            setCalories(result);
            setError(null);
          }
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1 font-medium">Age (years)</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full border rounded px-3 py-2" min="1" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1 font-medium">Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full border rounded px-3 py-2" min="1" required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full border rounded px-3 py-2" min="1" required />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Activity Level</label>
          <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="w-full border rounded px-3 py-2">
            {activityLevels.map((level) => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Calculate</button>
          <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Clear</button>
        </div>
      </form>
      {error && <div className="mt-2 text-center text-red-500">{error}</div>}
      {calories !== null && !error && (
        <div className="mt-4 text-center text-lg font-semibold">
          Daily Calorie Needs: <span className="text-blue-600">{calories} kcal</span>
        </div>
      )}
    </div>
  );
} 