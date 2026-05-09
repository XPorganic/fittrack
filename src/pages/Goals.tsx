import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { getProgress, estimateCompletionDate } from '@/services/trendService';
import { Calendar, Target, Clock, TrendingUp, TrendingDown, Minus, Check } from 'lucide-react';
import dayjs from 'dayjs';

export default function Goals() {
  const { weights, goal, setGoal, clearGoal } = useStore();
  const [targetWeight, setTargetWeight] = useState(goal?.targetWeight?.toString() || '');
  const [targetDate, setTargetDate] = useState(goal?.targetDate || '');
  const [isEditing, setIsEditing] = useState(!goal);

  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const initialWeight = weights.length > 0 ? weights[0].weight : 0;
  const estimatedDate = goal && currentWeight ? estimateCompletionDate(currentWeight, goal.targetWeight, weights) : null;
  const progress = goal && currentWeight ? getProgress(currentWeight, goal.targetWeight, initialWeight || undefined) : null;

  const handleSaveGoal = () => {
    const weight = parseFloat(targetWeight);
    if (weight > 0 && weight < 300 && targetDate) {
      setGoal({
        targetWeight: weight,
        targetDate,
        createdAt: dayjs().format('YYYY-MM-DD')
      });
      setIsEditing(false);
    }
  };

  const renderProgressRing = () => {
    if (!progress) return null;
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress.progress / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#40E0D0"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-gray-800">{progress.progress}%</span>
          <span className="text-sm text-gray-500">完成度</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">目标管理</h1>
        <p className="text-gray-500 mt-1">设定并追踪你的健康目标</p>
      </div>

      {isEditing || !goal ? (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">设置目标</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标体重 (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="例如：60"
                  className="input-field pr-16"
                  step="0.1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kg</span>
              </div>
              {currentWeight > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  当前体重：{currentWeight} kg，{parseFloat(targetWeight) < currentWeight ? '计划减重' : '计划增重'}{Math.abs(currentWeight - parseFloat(targetWeight || '0')).toFixed(1)} kg
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标日期
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={dayjs().format('YYYY-MM-DD')}
                className="input-field"
              />
            </div>
            <button onClick={handleSaveGoal} className="btn-primary w-full">
              保存目标
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">当前进度</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-turquoise-500 hover:text-turquoise-600"
              >
                修改目标
              </button>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {renderProgressRing()}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-turquoise-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-turquoise-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">目标体重</p>
                    <p className="text-lg font-bold text-gray-800">{goal.targetWeight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">目标日期</p>
                    <p className="text-lg font-bold text-gray-800">{dayjs(goal.targetDate).format('YYYY年MM月DD日')}</p>
                  </div>
                </div>
                {estimatedDate && (
                  <div className="flex items-center gap-3 p-3 bg-turquoise-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-turquoise-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-turquoise-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">预计达标日期</p>
                      <p className="text-lg font-bold text-turquoise-600">{dayjs(estimatedDate).format('YYYY年MM月DD日')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">体重差距</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">当前</p>
                <p className="text-2xl font-bold text-gray-800">{currentWeight}</p>
                <p className="text-xs text-gray-400">kg</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-gray-300" />
                  <span className="text-gray-400">→</span>
                  <div className="w-8 h-0.5 bg-turquoise-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">目标</p>
                <p className="text-2xl font-bold text-turquoise-500">{goal.targetWeight}</p>
                <p className="text-xs text-gray-400">kg</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-turquoise-50 to-teal-50 rounded-xl">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  {progress?.remaining && progress.remaining > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-turquoise-600">{progress.remaining}</span>
                      <span className="text-gray-600">kg {currentWeight > goal.targetWeight ? '待减' : '待增'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6 text-emerald-500" />
                      <span className="text-lg font-semibold text-emerald-600">已达成目标！</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={clearGoal}
            className="btn-secondary w-full text-red-500 hover:bg-red-50 hover:border-red-200"
          >
            清除目标
          </button>
        </>
      )}

      {!goal && (
        <div className="card bg-gradient-to-br from-turquoise-50 to-teal-50 border border-turquoise-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-turquoise-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-turquoise-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">设定健康目标</h3>
              <p className="text-sm text-gray-600 mt-1">设定目标体重和日期，我会帮你追踪进度并预估达标时间</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
