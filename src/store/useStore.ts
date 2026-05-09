import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile, WeightRecord, MealRecord, Goal, CustomFoodItem } from '@/types';
import dayjs from 'dayjs';

interface AppState {
  profile: Profile | null;
  weights: WeightRecord[];
  meals: MealRecord[];
  goal: Goal | null;
  isInitialized: boolean;
  customFoods: CustomFoodItem[];
  
  setProfile: (profile: Profile) => void;
  addWeight: (weight: number) => void;
  addMeal: (meal: Omit<MealRecord, 'id'>) => void;
  removeMeal: (id: string) => void;
  setGoal: (goal: Goal) => void;
  clearGoal: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  setInitialized: () => void;
  addCustomFood: (food: Omit<CustomFoodItem, 'id' | 'createdAt'>) => void;
  removeCustomFood: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      weights: [],
      meals: [],
      goal: null,
      isInitialized: false,
      customFoods: [],

      setProfile: (profile) => set({ profile }),

      addWeight: (weight) => {
        const { profile, weights } = get();
        if (!profile) return;
        
        const today = dayjs().format('YYYY-MM-DD');
        const heightInMeters = profile.height / 100;
        const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
        
        const existingIndex = weights.findIndex(w => w.date === today);
        
        if (existingIndex >= 0) {
          const newWeights = [...weights];
          newWeights[existingIndex] = { date: today, weight, bmi };
          set({ weights: newWeights });
        } else {
          set({ weights: [...weights, { date: today, weight, bmi }] });
        }
      },

      addMeal: (meal) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          meals: [...state.meals, { ...meal, id }]
        }));
      },

      removeMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter(m => m.id !== id)
        }));
      },

      setGoal: (goal) => set({ goal }),

      clearGoal: () => set({ goal: null }),

      clearAllData: () => set({
        profile: null,
        weights: [],
        meals: [],
        goal: null,
        isInitialized: false,
        customFoods: []
      }),

      exportData: () => {
        const { profile, weights, meals, goal, customFoods } = get();
        const data = { profile, weights, meals, goal, customFoods, exportedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') };
        return JSON.stringify(data, null, 2);
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.profile) set({ profile: parsed.profile });
          if (parsed.weights) set({ weights: parsed.weights });
          if (parsed.meals) set({ meals: parsed.meals });
          if (parsed.goal) set({ goal: parsed.goal });
          if (parsed.customFoods) set({ customFoods: parsed.customFoods });
          return true;
        } catch {
          return false;
        }
      },

      setInitialized: () => set({ isInitialized: true }),

      addCustomFood: (food) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          customFoods: [...state.customFoods, { ...food, id, createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss') }]
        }));
      },

      removeCustomFood: (id) => {
        set((state) => ({
          customFoods: state.customFoods.filter(f => f.id !== id)
        }));
      }
    }),
    {
      name: 'fittrack-storage'
    }
  )
);
