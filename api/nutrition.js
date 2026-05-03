
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { foodName } = req.body;

  if (!foodName) {
    return res.status(400).json({ error: 'Food name is required' });
  }

  try {
    // Note: In a real application, you would need to set up proper environment variables
    // For now, using DEMO_KEY which has limited functionality
    const apiKey = 'DEMO_KEY'; // process.env.USDA_API_KEY || 'DEMO_KEY';
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(foodName)}&pageSize=1`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }

    const food = searchData.foods[0];
    const fdcId = food.fdcId;

    const nutrientUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
    const nutrientResponse = await fetch(nutrientUrl);
    const nutrientData = await nutrientResponse.json();

    const getNutrientValue = (nutrientName) => {
      const nutrient = nutrientData.foodNutrients?.find(
        n => n.nutrientName === nutrientName
      );
      return nutrient ? nutrient.value : 0;
    };

    const result = {
      calories: getNutrientValue('Energy'),
      protein: getNutrientValue('Protein'),
      carbs: getNutrientValue('Carbohydrate, by difference'),
      fat: getNutrientValue('Total lipid (fat)'),
      fiber: getNutrientValue('Fiber, total dietary')
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
}