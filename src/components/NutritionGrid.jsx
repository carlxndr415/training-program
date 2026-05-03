import React, { useState, useEffect, useRef } from 'react';

const makeRow = () => ({
  id: Date.now() + Math.random(),
  date: new Date().toISOString().split('T')[0],
  food: '',
  qty: '1',
  unit: 'serving',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
});

const NutritionGrid = ({ onBack }) => {
  const [rows, setRows] = useState(() => {
    try {
      const saved = localStorage.getItem('nutritionRows');
      return saved ? JSON.parse(saved) : [makeRow()];
    } catch {
      return [makeRow()];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevFoodRef = useRef({});

  useEffect(() => {
    localStorage.setItem('nutritionRows', JSON.stringify(rows));
  }, [rows]);

  const updateCell = (id, field, value) => {
    setRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const fetchNutritionData = async (rowId, foodName) => {
    if (!foodName.trim()) return;
    if (prevFoodRef.current[rowId] === foodName) return;
    prevFoodRef.current[rowId] = foodName;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.error) { setError(data.error); return; }

      setRows(prev =>
        prev.map(row =>
          row.id === rowId
            ? { ...row, calories: data.calories ?? '', protein: data.protein ?? '', carbs: data.carbs ?? '', fat: data.fat ?? '', fiber: data.fiber ?? '' }
            : row
        )
      );
    } catch (err) {
      setError('Could not fetch nutrition data. Check that /api/nutrition is set up.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => setRows(prev => [...prev, makeRow()]);

  const deleteRow = (id) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const totals = rows.reduce(
    (acc, row) => {
      const qty = parseFloat(row.qty) || 1;
      return {
        calories: acc.calories + (parseFloat(row.calories) || 0) * qty,
        protein:  acc.protein  + (parseFloat(row.protein)  || 0) * qty,
        carbs:    acc.carbs    + (parseFloat(row.carbs)    || 0) * qty,
        fat:      acc.fat      + (parseFloat(row.fat)      || 0) * qty,
        fiber:    acc.fiber    + (parseFloat(row.fiber)    || 0) * qty,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const cellClass = 'border border-gray-200 px-2 py-1';
  const inputClass = 'w-full h-full bg-transparent outline-none focus:bg-blue-50 px-1 py-1 text-sm';

  const EditableCell = ({ rowId, field, value, type = 'text' }) => (
    <td className={cellClass}>
      <input
        type={type}
        value={value}
        className={inputClass}
        onChange={e => updateCell(rowId, field, e.target.value)}
        onBlur={field === 'food' ? e => fetchNutritionData(rowId, e.target.value) : undefined}
      />
    </td>
  );

  const ReadonlyCell = ({ value }) => (
    <td className={`${cellClass} text-center text-sm text-gray-700`}>
      {value !== '' && value !== undefined ? value : <span className="text-gray-300">—</span>}
    </td>
  );

  return (
    <div className="max-w-6xl mx-auto py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-sm">
              ← Back
            </button>
          )}
          <h2 className="text-2xl font-bold">Nutrition Log</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={addRow} className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
            + Add Row
          </button>
          <button onClick={() => setRows([makeRow()])} className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-sm text-blue-500 mb-3 italic">Fetching nutrition data…</div>
      )}

      {/* Grid */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {['Date', 'Food', 'Qty', 'Unit', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', ''].map(h => (
                <th key={h} className="border border-gray-200 px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                <EditableCell rowId={row.id} field="date" value={row.date} type="date" />
                <EditableCell rowId={row.id} field="food" value={row.food} />
                <EditableCell rowId={row.id} field="qty"  value={row.qty}  type="number" />
                <EditableCell rowId={row.id} field="unit" value={row.unit} />
                <ReadonlyCell value={row.calories} />
                <ReadonlyCell value={row.protein} />
                <ReadonlyCell value={row.carbs} />
                <ReadonlyCell value={row.fat} />
                <ReadonlyCell value={row.fiber} />
                <td className={cellClass}>
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="text-red-400 hover:text-red-600 text-xs px-1"
                    title="Delete row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Totals</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Calories',    value: Math.round(totals.calories), color: 'text-blue-600' },
            { label: 'Protein (g)', value: totals.protein.toFixed(1),   color: 'text-green-600' },
            { label: 'Carbs (g)',   value: totals.carbs.toFixed(1),     color: 'text-yellow-600' },
            { label: 'Fat (g)',     value: totals.fat.toFixed(1),       color: 'text-red-600' },
            { label: 'Fiber (g)',   value: totals.fiber.toFixed(1),     color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default NutritionGrid;