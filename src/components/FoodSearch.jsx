import React, { useState, useEffect, useRef } from 'react';

const FoodSearch = ({ onFoodSelect, existingFoods = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [servingSize, setServingSize] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('serving');
  const [showServingInput, setShowServingInput] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Manual entry state
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFats, setManualFats] = useState('');
  
  const wrapperRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_USDA_API_KEY || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowServingInput(false);
        setShowManualEntry(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Skip search if no API key
    if (!apiKey) {
      setError('USDA API key not configured. Use manual entry below.');
      setShowManualEntry(true);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchFoods(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, apiKey, searchFoods]);

  const searchFoods = async (query) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);
    setShowManualEntry(false);
    
    try {
      // Request specific nutrients: 208=Energy(kcal), 203=Protein, 205=Carbs, 204=Fat
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=10&nutrients=208&nutrients=203&nutrients=205&nutrients=204`;
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 15000)
      );
      
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, { signal: abortControllerRef.current.signal }),
        timeoutPromise
      ]);
      
      const data = await response.json();
      
      // Check for API errors
      if (data.error) {
        if (data.error.code === 'API_KEY_INVALID') {
          throw new Error('Invalid API key. Please check your USDA API key in .env file.');
        }
        throw new Error(data.error.message || 'API error');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      if (data.foods && data.foods.length > 0) {
        const formattedProducts = data.foods
          .filter(food => food.description)
          .map(food => {
            // Extract nutrients from the foodNutrients array
            const nutrients = food.foodNutrients || [];
            
            // Find nutrient by ID - handles both standard (208, 203, etc.) and branded (1008, 1003, etc.) IDs
            const findById = (idArray) => {
              const nutrient = nutrients.find(n => 
                (n.nutrientId && idArray.includes(Number(n.nutrientId))) ||
                (n.nutrientNumber && idArray.includes(Number(n.nutrientNumber)))
              );
              return nutrient?.value || 0;
            };
            
            // Find each nutrient by name (backup method)
            const findByName = (name) => {
              const nutrient = nutrients.find(n => 
                n.nutrientName && n.nutrientName.toLowerCase().includes(name.toLowerCase())
              );
              return nutrient?.value || 0;
            };
            
            // Get nutrients - try by ID first (most reliable), then by name
            // IDs: Energy=208/1008, Protein=203/1003, Carbs=205/1005, Fat=204/1004
            const calories = findById([208, 1008]) || findByName('energy') || 0;
            const protein = findById([203, 1003]) || findByName('protein') || 0;
            const carbs = findById([205, 1005]) || findByName('carbohydrate') || findByName('carbs') || 0;
            const fats = findById([204, 1004]) || findByName('fat') || findByName('lipid') || 0;
            
            // Extract available measures/servings
            const measures = food.measures || [];
            
            return {
              id: food.fdcId?.toString() || Math.random().toString(36).substr(2, 9),
              name: food.description,
              brand: food.dataType || 'USDA',
              calories: Number(calories) || 0,
              protein: Number(protein) || 0,
              carbs: Number(carbs) || 0,
              fats: Number(fats) || 0,
              servingSize: 100,
              measures: measures,
              // Default measure is usually "serving" or first available
              defaultMeasure: measures.find(m => m.modifier === 'serving') || measures[0] || { modifier: 'serving', quantity: 1 }
            };
          });
        
        // Filter out items with no macros if we have results
        const withMacros = formattedProducts.filter(f => f.calories > 0 || f.protein > 0 || f.carbs > 0 || f.fats > 0);
        const toShow = withMacros.length > 0 ? withMacros : formattedProducts;
        
        setResults(toShow);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(true);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error searching foods:', err);
      setError(err.message || 'Search failed. Use manual entry below.');
      setShowManualEntry(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    
    // Set default to serving
    const defaultMeasure = product.defaultMeasure || { modifier: 'serving', quantity: 1 };
    setSelectedUnit(defaultMeasure.modifier || 'serving');
    setServingSize(defaultMeasure.quantity || 1);
    
    setSearchTerm(product.name);
    setShowDropdown(false);
    setShowServingInput(true);
  };

  const handleAddFood = () => {
    if (!selectedProduct) return;

    // Calculate macros based on serving size and unit
    // If unit is not 'g', we need to convert
    let multiplier = servingSize;
    if (selectedUnit !== 'g' && selectedUnit !== 'gram') {
      // Find the measure in the product measures
      const measure = selectedProduct.measures?.find(m => m.modifier === selectedUnit);
      if (measure) {
        // The measure value is relative to 100g, so we divide by 100
        multiplier = (servingSize * measure.value) / 100;
      }
    } else {
      multiplier = servingSize / 100;
    }
    
    const foodItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      servingSize: `${servingSize} ${selectedUnit}`,
      calories: Math.round(selectedProduct.calories * multiplier),
      protein: Math.round(selectedProduct.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedProduct.carbs * multiplier * 10) / 10,
      fats: Math.round(selectedProduct.fats * multiplier * 10) / 10,
    };

    onFoodSelect(foodItem);
    
    // Reset state
    setSearchTerm('');
    setSelectedProduct(null);
    setServingSize(1);
    setSelectedUnit('serving');
    setShowServingInput(false);
    setResults([]);
  };

  const handleManualEntry = () => {
    if (!manualName.trim()) {
      setError('Please enter a food name');
      return;
    }

    const calories = parseFloat(manualCalories) || 0;
    const protein = parseFloat(manualProtein) || 0;
    const carbs = parseFloat(manualCarbs) || 0;
    const fats = parseFloat(manualFats) || 0;

    // Calculate per gram values and scale to serving size
    const multiplier = servingSize / 100;
    
    const foodItem = {
      id: Date.now().toString(),
      name: manualName.trim(),
      brand: 'Manual Entry',
      servingSize: `${servingSize}g`,
      calories: Math.round(calories * multiplier),
      protein: Math.round(protein * multiplier * 10) / 10,
      carbs: Math.round(carbs * multiplier * 10) / 10,
      fats: Math.round(fats * multiplier * 10) / 10,
    };

    onFoodSelect(foodItem);
    
    // Reset state
    setSearchTerm('');
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFats('');
    setServingSize(1);
    setShowManualEntry(false);
    setError(null);
  };

  const handleCancel = () => {
    setSearchTerm('');
    setSelectedProduct(null);
    setServingSize(1);
    setSelectedUnit('serving');
    setShowServingInput(false);
    setShowManualEntry(false);
    setResults([]);
    setShowDropdown(false);
  };

  const openManualEntry = () => {
    setShowManualEntry(true);
    setShowDropdown(false);
    setError(null);
  };

  // Get unique units from product measures
  const getAvailableUnits = () => {
    if (!selectedProduct?.measures?.length) {
      return ['serving', 'g', 'oz'];
    }
    
    const units = new Set(['serving', 'g', 'oz']);
    selectedProduct.measures.forEach(m => {
      if (m.modifier) units.add(m.modifier);
    });
    
    return Array.from(units);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search foods (e.g., apple, chicken breast)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black text-sm"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-black">
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Searching USDA Database...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && !showManualEntry && (
        <div className="absolute z-10 w-full mt-1">
          <div className="bg-red-50 border border-red-300 rounded-lg shadow-lg p-3 text-red-600 text-sm mb-2">
            {error}
          </div>
          <button
            onClick={openManualEntry}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            Enter Food Manually
          </button>
        </div>
      )}

      {/* Results Dropdown */}
      {showDropdown && results.length > 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-black">{product.name}</div>
              <div className="text-sm text-gray-600">{product.brand}</div>
              <div className="text-xs text-gray-500 mt-1">
                {product.calories} kcal • {product.protein}g P • {product.carbs}g C • {product.fats}g F (per 100g)
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown && results.length === 0 && !isLoading && searchTerm.length >= 2 && !error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
          No foods found for "{searchTerm}". Try a different search term or use manual entry.
        </div>
      )}

      {/* Serving Size Input (for API results) */}
      {showServingInput && selectedProduct && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium text-black">{selectedProduct.name}</span>
          </div>
          <div className="bg-gray-50 rounded p-2 mb-3">
            <div className="text-xs text-gray-500 mb-1">Per 100g:</div>
            <div className="text-sm text-black">
              {selectedProduct.calories} kcal • {selectedProduct.protein}g P • {selectedProduct.carbs}g C • {selectedProduct.fats}g F
            </div>
          </div>
          
          {/* Unit and quantity selection */}
          <div className="mb-3">
            <label className="block text-sm text-black mb-1">Serving</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-gray-300 rounded bg-white text-black"
                min="0.1"
                step="0.1"
              />
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white text-black"
              >
                {getAvailableUnits().map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Calculate and display */}
          {(() => {
            let multiplier = servingSize;
            if (selectedUnit !== 'g' && selectedUnit !== 'gram') {
              const measure = selectedProduct.measures?.find(m => m.modifier === selectedUnit);
              if (measure) {
                multiplier = (servingSize * measure.value) / 100;
              }
            } else {
              multiplier = servingSize / 100;
            }
            const calcCalories = Math.round(selectedProduct.calories * multiplier);
            const calcProtein = Math.round(selectedProduct.protein * multiplier * 10) / 10;
            const calcCarbs = Math.round(selectedProduct.carbs * multiplier * 10) / 10;
            const calcFats = Math.round(selectedProduct.fats * multiplier * 10) / 10;
            
            return (
              <div className="bg-blue-50 rounded p-2 mb-3">
                <div className="text-xs text-gray-500 mb-1">Total for {servingSize} {selectedUnit}:</div>
                <div className="text-sm font-medium text-black">
                  {calcCalories} kcal • {calcProtein}g P • {calcCarbs}g C • {calcFats}g F
                </div>
              </div>
            );
          })()}
          
          <div className="flex gap-2">
            <button
              onClick={handleAddFood}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Add Food
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Form */}
      {showManualEntry && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="text-sm font-medium text-black mb-3">Manual Food Entry (per 100g)</div>
          
          <div className="mb-2">
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Food name"
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="number"
              value={manualCalories}
              onChange={(e) => setManualCalories(e.target.value)}
              placeholder="Calories"
              className="px-3 py-2 border border-gray-300 rounded bg-white text-black text-sm"
            />
            <input
              type="number"
              value={manualProtein}
              onChange={(e) => setManualProtein(e.target.value)}
              placeholder="Protein (g)"
              className="px-3 py-2 border border-gray-300 rounded bg-white text-black text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              type="number"
              value={manualCarbs}
              onChange={(e) => setManualCarbs(e.target.value)}
              placeholder="Carbs (g)"
              className="px-3 py-2 border border-gray-300 rounded bg-white text-black text-sm"
            />
            <input
              type="number"
              value={manualFats}
              onChange={(e) => setManualFats(e.target.value)}
              placeholder="Fat (g)"
              className="px-3 py-2 border border-gray-300 rounded bg-white text-black text-sm"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm text-black mb-1">Serving size (grams)</label>
            <input
              type="number"
              value={servingSize}
              onChange={(e) => setServingSize(Math.max(1, parseFloat(e.target.value) || 100))}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-black text-sm"
              min="1"
            />
          </div>
          
          <div className="bg-blue-50 rounded p-2 mb-3">
            <div className="text-xs text-gray-500 mb-1">Total for {servingSize}g serving:</div>
            <div className="text-sm font-medium text-black">
              {Math.round((parseFloat(manualCalories) || 0) * servingSize / 100)} kcal • 
              {Math.round((parseFloat(manualProtein) || 0) * servingSize / 100 * 10) / 10}g P • 
              {Math.round((parseFloat(manualCarbs) || 0) * servingSize / 100 * 10) / 10}g C • 
              {Math.round((parseFloat(manualFats) || 0) * servingSize / 100 * 10) / 10}g F
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleManualEntry}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Add Food
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Foods List */}
      {existingFoods.length > 0 && !showServingInput && !showManualEntry && (
        <div className="mt-2 space-y-1">
          {existingFoods.map((food, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
              <div>
                <span className="text-black font-medium">{food.name}</span>
                <span className="text-gray-500 mx-1">({food.servingSize})</span>
              </div>
              <div className="text-gray-600">
                {food.calories} kcal
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
