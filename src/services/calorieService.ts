import { Profile, MealRecord } from '@/types';

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725
};

export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

export function calculateTDEE(bmr: number, activityLevel: keyof typeof activityMultipliers): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function getCaloriesConsumed(meals: MealRecord[], date: string): number {
  return meals
    .filter(m => m.date === date)
    .reduce((sum, m) => sum + m.calories, 0);
}

export function getCaloriesByMealType(meals: MealRecord[], date: string) {
  const dayMeals = meals.filter(m => m.date === date);
  const types: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  return types.reduce((acc, type) => {
    acc[type] = dayMeals
      .filter(m => m.mealType === type)
      .reduce((sum, m) => sum + m.calories, 0);
    return acc;
  }, {} as Record<string, number>);
}

export function calculateCalorieDeficit(tdee: number, consumed: number): number {
  return tdee - consumed;
}

export function getCalorieStatus(deficit: number): {
  label: string;
  color: string;
  advice: string;
} {
  if (deficit < -500) {
    return {
      label: '摄入过多',
      color: '#EF4444',
      advice: '今日摄入热量较高，建议增加运动量或减少下一餐份量'
    };
  } else if (deficit < 0) {
    return {
      label: '轻微超标',
      color: '#F59E0B',
      advice: '今日摄入略高于消耗，注意控制饮食'
    };
  } else if (deficit < 300) {
    return {
      label: '热量平衡',
      color: '#10B981',
      advice: '摄入与消耗基本平衡，保持当前饮食习惯'
    };
  } else if (deficit < 700) {
    return {
      label: '适度缺口',
      color: '#06B6D4',
      advice: '适度的热量缺口有助于健康减重'
    };
  } else {
    return {
      label: '缺口较大',
      color: '#8B5CF6',
      advice: '热量缺口较大，确保营养均衡，避免过度饥饿'
    };
  }
}

export function calculateDailyCalories(profile: Profile, weight: number) {
  const bmr = calculateBMR(weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  return { bmr, tdee };
}
