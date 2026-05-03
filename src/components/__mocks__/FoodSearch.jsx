import React from 'react';

/**
 * Lightweight mock for FoodSearch used in Jest tests.
 * The real component uses import.meta.env which is not supported
 * in the Jest/CommonJS transform environment.
 */
const FoodSearch = ({ onFoodSelect, existingFoods = [] }) => (
  <div data-testid="food-search-mock">
    {existingFoods.map((food, i) => (
      <div key={i}>{food.name}</div>
    ))}
  </div>
);

export default FoodSearch;
