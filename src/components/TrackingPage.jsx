import React, { useState, useEffect } from 'react';
import FoodSearch from './FoodSearch';

const TrackingPage = ({ onBack }) => {
  const [trackingData, setTrackingData] = useState([]);
  const [activeRow, setActiveRow] = useState(null);

  const isSignedIn = false; // Profile functionality removed for now

  useEffect(() => {
    // Load tracking data from localStorage
    const savedData = localStorage.getItem('trackingData');
    if (savedData) {
      // Sort saved data in descending order (newest first)
      const parsedData = JSON.parse(savedData);
      // Migrate old data format if needed
      const sortedData = parsedData.map(item => ({
        ...item,
        foods: item.foods || (item.food ? [{ name: item.food, calories: item.calories, protein: item.protein, carbs: item.carbs, fats: item.fats, servingSize: 0, brand: '' }] : []),
        // Keep old fields for backwards compatibility but don't use them
        food: undefined,
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fats: undefined
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setTrackingData(sortedData);
      }, 0);
    } else {
      // Initialize with sample data for the last 7 days (newest first)
      const initialData = [];
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        initialData.push({
          date: date.toISOString().split('T')[0],
          sleep: '',
          weight: '',
          steps: '',
          foods: []
        });
      }
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setTrackingData(initialData);
      }, 0);
    }
  }, []);

  const handleDataChange = (index, field, value) => {
    const newData = [...trackingData];
    newData[index] = {
      ...newData[index],
      [field]: value
    };
    setTrackingData(newData);
    saveData();
  };

  const saveData = () => {
    localStorage.setItem('trackingData', JSON.stringify(trackingData));
  };

  const addNewDay = () => {
    const latestDate = new Date(trackingData[0].date);
    const nextDate = new Date(latestDate);
    nextDate.setDate(latestDate.getDate() + 1);
    const newDay = {
      date: nextDate.toISOString().split('T')[0],
      sleep: '',
      weight: '',
      steps: '',
      foods: []
    };
    setTrackingData([newDay, ...trackingData]);
    saveData();
  };

  // Calculate totals from foods array
  const calculateTotals = (foods) => {
    if (!foods || foods.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    return foods.reduce((acc, food) => ({
      calories: acc.calories + (parseFloat(food.calories) || 0),
      protein: acc.protein + (parseFloat(food.protein) || 0),
      carbs: acc.carbs + (parseFloat(food.carbs) || 0),
      fats: acc.fats + (parseFloat(food.fats) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const handleFoodSelect = (index, foodItem) => {
    const newData = [...trackingData];
    const currentFoods = newData[index].foods || [];
    newData[index] = {
      ...newData[index],
      foods: [...currentFoods, foodItem]
    };
    setTrackingData(newData);
    saveData();
    setActiveRow(null);
  };

  const removeFood = (rowIndex, foodIndex) => {
    const newData = [...trackingData];
    newData[rowIndex].foods = newData[rowIndex].foods.filter((_, i) => i !== foodIndex);
    setTrackingData(newData);
    saveData();
  };

  const totals = (row) => calculateTotals(row.foods);

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat text-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-sm px-4 py-2 bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl text-black"
            aria-label="Back"
          >
            Back
          </button>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl text-black">
              {isSignedIn ? 'Profile' : 'Sign in'}
            </button>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-8 text-black">Daily Tracking</h1>

        {/* USDA API Info */}
        <div className="bg-white/75 shadow-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2 text-black">Nutrition Tracking</h2>
          <p className="text-gray-600">
            Search for foods using the USDA FoodData Central database (Foundation & SR Legacy). 
            Click on a food cell to add foods to your daily log. If offline or the API is unavailable, 
            use manual entry to add custom foods.
          </p>
        </div>

        {/* Tracking Spreadsheet */}
        <div className="bg-white/75 shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">Daily Log</h2>
            <button
              onClick={addNewDay}
              className="px-4 py-2 bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl text-black"
            >
              Add New Day
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/75">
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Sleep (hrs)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Weight (lbs)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Steps</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black w-64">Food</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Calories</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Protein (g)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Carbs (g)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-black">Fats (g)</th>
                </tr>
              </thead>
              <tbody>
                {trackingData.map((row, index) => {
                  const dayTotals = totals(row);
                  return (
                    <tr key={index} className="hover:bg-white/100">
                      <td className="border border-gray-300 px-4 py-2 text-black">{row.date}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={row.sleep}
                          onChange={(e) => handleDataChange(index, 'sleep', e.target.value)}
                          placeholder="8"
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-black"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={row.weight}
                          onChange={(e) => handleDataChange(index, 'weight', e.target.value)}
                          placeholder="180"
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-black"
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          value={row.steps}
                          onChange={(e) => handleDataChange(index, 'steps', e.target.value)}
                          placeholder="10000"
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-black"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2 relative">
                        <button
                          onClick={() => setActiveRow(activeRow === index ? null : index)}
                          className="w-full text-left px-2 py-1 min-h-[60px] border border-gray-200 rounded bg-white text-black hover:bg-gray-50 transition-colors"
                        >
                          {row.foods && row.foods.length > 0 ? (
                            <div className="space-y-1">
                              {row.foods.map((food, foodIndex) => (
                                <div key={foodIndex} className="flex items-center justify-between text-sm group">
                                  <span className="truncate flex-1">
                                    <span className="font-medium">{food.name}</span>
                                    <span className="text-gray-500 text-xs ml-1">({food.servingSize}g)</span>
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFood(index, foodIndex);
                                    }}
                                    className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition-opacity"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">Click to add foods...</span>
                          )}
                        </button>
                        {activeRow === index && (
                          <div className="absolute z-10 left-0 top-full mt-1 w-80">
                            <FoodSearch
                              onFoodSelect={(food) => handleFoodSelect(index, food)}
                              existingFoods={row.foods || []}
                            />
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-black font-medium">{Math.round(dayTotals.calories)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-black">{Math.round(dayTotals.protein * 10) / 10}</td>
                      <td className="border border-gray-300 px-4 py-2 text-black">{Math.round(dayTotals.carbs * 10) / 10}</td>
                      <td className="border border-gray-300 px-4 py-2 text-black">{Math.round(dayTotals.fats * 10) / 10}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
