import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { foodDatabase, searchFood } from '@/data/foodDatabase';
import { getCaloriesByMealType } from '@/services/calorieService';
import { X, Plus, Search, Trash2, Coffee, Sun, Moon, Cookie, Flame, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { FoodItem } from '@/types';

const mealTypeLabels = {
  breakfast: { label: '早餐', icon: Coffee, color: 'text-amber-500' },
  lunch: { label: '午餐', icon: Sun, color: 'text-orange-500' },
  dinner: { label: '晚餐', icon: Moon, color: 'text-indigo-500' },
  snack: { label: '加餐', icon: Cookie, color: 'text-pink-500' },
};

const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function Meals() {
  const { profile, weights, meals, addMeal, removeMeal, customFoods, addCustomFood, removeCustomFood } = useStore();
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<{ name: string; caloriesPer100g: number } | null>(null);
  const [customFood, setCustomFood] = useState({ name: '', calories: '' });
  const [amount, setAmount] = useState('100');
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const caloriesByType = getCaloriesByMealType(meals, selectedDate);
  const totalCalories = Object.values(caloriesByType).reduce((sum, cal) => sum + cal, 0);

  const currentMeals = meals.filter(m => m.date === selectedDate);
  const filteredMeals = currentMeals.filter(m => m.mealType === activeMealType);

  const allFoods: FoodItem[] = useMemo(() => {
    const customFoodItems: FoodItem[] = customFoods.map(f => ({
      name: f.name,
      caloriesPer100g: f.caloriesPer100g,
      category: f.category
    }));
    return [...foodDatabase, ...customFoodItems];
  }, [customFoods]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return allFoods.slice(0, 10);
    const lowerQuery = searchQuery.toLowerCase();
    return allFoods.filter(f => 
      f.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
  }, [searchQuery, allFoods]);

  const isCustomFoodSaved = useMemo(() => {
    if (!customFood.name) return false;
    return customFoods.some(f => 
      f.name.toLowerCase() === customFood.name.toLowerCase()
    );
  }, [customFood.name, customFoods]);

  const isToday = selectedDate === today.format('YYYY-MM-DD');

  const goToPreviousDay = () => {
    setSelectedDate(dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'));
  };

  const goToNextDay = () => {
    const nextDay = dayjs(selectedDate).add(1, 'day');
    if (nextDay.isBefore(today, 'day') || nextDay.isSame(today, 'day')) {
      setSelectedDate(nextDay.format('YYYY-MM-DD'));
    }
  };

  const handleSelectFood = (food: { name: string; caloriesPer100g: number }) => {
    setSelectedFood(food);
    setCustomFood({ name: food.name, calories: food.caloriesPer100g.toString() });
    setSearchQuery('');
  };

  const handleAddMeal = () => {
    const calories = selectedFood
      ? Math.round((parseFloat(amount) / 100) * selectedFood.caloriesPer100g)
      : parseFloat(customFood.calories || '0');

    if (customFood.name && calories > 0) {
      addMeal({
        date: selectedDate,
        mealType: activeMealType,
        food: customFood.name,
        amount: parseFloat(amount),
        calories,
      });
      
      if (saveToLibrary && !isCustomFoodSaved && customFood.name && customFood.calories) {
        addCustomFood({
          name: customFood.name,
          caloriesPer100g: parseFloat(customFood.calories),
          category: '自定义'
        });
      }
      
      resetForm();
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setSelectedFood(null);
    setCustomFood({ name: '', calories: '' });
    setAmount('100');
    setSearchQuery('');
    setSaveToLibrary(false);
  };

  const handleToggleSaveFood = () => {
    if (isCustomFoodSaved) {
      const foodToRemove = customFoods.find(f => 
        f.name.toLowerCase() === customFood.name.toLowerCase()
      );
      if (foodToRemove) {
        removeCustomFood(foodToRemove.id);
      }
    } else {
      setSaveToLibrary(!saveToLibrary);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">饮食记录</h1>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <button 
            onClick={goToPreviousDay}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-turquoise-500" />
            <span className="text-lg font-semibold text-gray-700">
              {dayjs(selectedDate).format('MM月DD日 dddd')}
            </span>
            {isToday && (
              <span className="px-2 py-0.5 bg-turquoise-100 text-turquoise-600 text-xs rounded-full">
                今天
              </span>
            )}
          </div>
          
          <button 
            onClick={goToNextDay}
            disabled={dayjs(selectedDate).isSame(today, 'day')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">当日热量</h2>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-xl font-bold text-orange-500">{totalCalories}</span>
            <span className="text-gray-500">kcal</span>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalCalories / 2000) * 100)}%` }}
          />
        </div>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
          {mealTypes.map((type) => {
            const info = mealTypeLabels[type];
            const Icon = info.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveMealType(type)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all',
                  activeMealType === type
                    ? 'bg-gradient-to-r from-turquoise-400 to-turquoise-500 text-white shadow-lg shadow-turquoise-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{info.label}</span>
                <span className={clsx('text-sm', activeMealType === type ? 'opacity-80' : 'text-gray-400')}>
                  {caloriesByType[type]}kcal
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{meal.food}</p>
                  <p className="text-sm text-gray-500">{meal.amount}g</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-orange-500">{meal.calories} kcal</span>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>还没有记录</p>
              <p className="text-sm mt-1">点击下方添加{isToday ? '今日' : ''}饮食</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加食物
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white w-full sm:w-auto sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">添加食物</h3>
              <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!selectedFood ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索食物..."
                      className="input-field pl-10"
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((food, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectFood(food)}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{food.name}</p>
                          <p className="text-sm text-gray-500">{food.category}</p>
                        </div>
                        <span className="text-sm text-gray-400">{food.caloriesPer100g} kcal/100g</span>
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-gray-400">或自定义</span>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">食物名称</label>
                  <input
                    type="text"
                    value={customFood.name}
                    onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                    placeholder="例如：鸡胸肉"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">热量 (kcal/100g)</label>
                  <input
                    type="number"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                    placeholder="例如：133"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">份量 (g)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">g</span>
                </div>
              </div>

              <div className="p-4 bg-turquoise-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">计算热量</span>
                  <span className="text-xl font-bold text-turquoise-600">
                    {Math.round((parseFloat(amount) / 100) * parseFloat(customFood.calories || '0'))} kcal
                  </span>
                </div>
              </div>

              {customFood.name && customFood.calories && (
                <button
                  onClick={handleToggleSaveFood}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all',
                    isCustomFoodSaved 
                      ? 'bg-green-100 text-green-600' 
                      : saveToLibrary 
                        ? 'bg-turquoise-100 text-turquoise-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {isCustomFoodSaved ? (
                    <>
                      <BookmarkCheck className="w-5 h-5" />
                      <span>已保存到食物库</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-5 h-5" />
                      <span>{saveToLibrary ? '将会保存到食物库' : '保存到食物库'}</span>
                    </>
                  )}
                </button>
              )}

              <button onClick={handleAddMeal} className="btn-primary w-full">
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">热量来源</h2>
        <div className="space-y-3">
          {mealTypes.map((type) => {
            const info = mealTypeLabels[type];
            const Icon = info.icon;
            const percentage = totalCalories > 0 ? (caloriesByType[type] / totalCalories) * 100 : 0;
            return (
              <div key={type} className="flex items-center gap-3">
                <Icon className={clsx('w-5 h-5', info.color)} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{info.label}</span>
                    <span className="text-sm font-medium text-gray-800">{caloriesByType[type]} kcal</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all duration-500', info.color.replace('text-', 'bg-'))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
