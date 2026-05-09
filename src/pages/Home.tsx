import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { calculateBMI, getBMICategory } from '@/services/bmiService';
import { calculateDailyCalories, getCaloriesConsumed, getCalorieStatus } from '@/services/calorieService';
import { calculateTrend, filterByTimeRange } from '@/services/trendService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import dayjs from 'dayjs';
import { Plus, TrendingUp, TrendingDown, Minus, Target, Flame } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Home() {
  const { profile, weights, meals, addWeight } = useStore();
  const [weightInput, setWeightInput] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  const today = dayjs().format('YYYY-MM-DD');
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const bmi = profile?.height && currentWeight ? calculateBMI(currentWeight, profile.height) : 0;
  const bmiInfo = getBMICategory(bmi);
  const trend = calculateTrend(weights.slice(-14));
  const filteredWeights = filterByTimeRange(weights, timeRange);
  
  const { bmr, tdee } = profile && currentWeight 
    ? calculateDailyCalories(profile, currentWeight) 
    : { bmr: 0, tdee: 0 };
  const consumed = getCaloriesConsumed(meals, today);
  const deficit = tdee - consumed;
  const calorieStatus = getCalorieStatus(deficit);

  const handleAddWeight = () => {
    const weight = parseFloat(weightInput);
    if (weight > 0 && weight < 300) {
      addWeight(weight);
      setWeightInput('');
    }
  };

  const chartData = {
    labels: filteredWeights.map(w => dayjs(w.date).format('MM/DD')),
    datasets: [
      {
        label: '体重',
        data: filteredWeights.map(w => w.weight),
        borderColor: '#40E0D0',
        backgroundColor: 'rgba(64, 224, 208, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#40E0D0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#6B7280' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', maxRotation: 0 }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">你好！</h1>
          <p className="text-gray-500 mt-1">今天是 {dayjs().format('MM月DD日')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">今日摄入</p>
          <p className="text-xl font-bold text-turquoise-500">{consumed} kcal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-turquoise-400 to-turquoise-500 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 opacity-80" />
            <span className="text-sm opacity-90">当前体重</span>
          </div>
          <p className="text-3xl font-bold">{currentWeight || '--'}</p>
          <p className="text-sm opacity-80 mt-1">kg</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: bmiInfo.color }}
            />
            <span className="text-sm text-gray-500">BMI 指数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{bmi || '--'}</p>
          <p 
            className="text-sm mt-1 px-2 py-0.5 rounded-full inline-block"
            style={{ backgroundColor: bmiInfo.bgColor, color: bmiInfo.color }}
          >
            {bmi ? bmiInfo.label : '未设置'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-500">热量缺口</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: calorieStatus.color }}>
            {deficit > 0 ? '+' : ''}{deficit}
          </p>
          <p className="text-sm text-gray-500 mt-1">kcal</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            ) : (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-500">体重趋势</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{trend.changeRate}</p>
          <p className="text-sm text-gray-500 mt-1">
            {trend.direction === 'up' ? '上升' : trend.direction === 'down' ? '下降' : '稳定'}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">记录体重</h2>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="输入体重 (kg)"
              className="input-field pr-16"
              step="0.1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
          </div>
          <button onClick={handleAddWeight} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            记录
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">体重趋势</h2>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-turquoise-400 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? '全部' : range.replace('d', '') + '天'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {filteredWeights.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              暂无数据，开始记录体重吧！
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">今日热量</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">基础代谢 (BMR)</span>
            <span className="font-semibold">{bmr} kcal</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">每日消耗 (TDEE)</span>
            <span className="font-semibold">{tdee} kcal</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">已摄入</span>
            <span className="font-semibold text-orange-500">{consumed} kcal</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (consumed / tdee) * 100)}%`,
                backgroundColor: calorieStatus.color
              }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">{calorieStatus.advice}</p>
        </div>
      </div>
    </div>
  );
}
