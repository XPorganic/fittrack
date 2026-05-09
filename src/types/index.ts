export interface Profile {
  height: number;
  gender: 'male' | 'female';
  age: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
}

export interface WeightRecord {
  date: string;
  weight: number;
  bmi?: number;
}

export interface MealRecord {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food: string;
  amount: number;
  calories: number;
}

export interface Goal {
  targetWeight: number;
  targetDate: string;
  createdAt: string;
}

export interface HealthAdvice {
  id: string;
  type: 'diet' | 'exercise' | 'management';
  title: string;
  content: string;
  priority: number;
}

export interface FoodItem {
  name: string;
  caloriesPer100g: number;
  category: string;
}

export interface CustomFoodItem extends FoodItem {
  id: string;
  createdAt: string;
}

export type TimeRange = '7d' | '30d' | '90d' | 'all';
