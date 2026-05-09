import { WeightRecord } from '@/types';
import dayjs from 'dayjs';

export function calculateTrend(recentWeights: WeightRecord[]): {
  direction: 'up' | 'down' | 'stable';
  dailyChange: number;
  weeklyChange: number;
  changeRate: string;
} {
  if (recentWeights.length < 2) {
    return {
      direction: 'stable',
      dailyChange: 0,
      weeklyChange: 0,
      changeRate: '暂无足够数据'
    };
  }

  const sorted = [...recentWeights].sort((a, b) => 
    dayjs(a.date).unix() - dayjs(b.date).unix()
  );
  
  const latest = sorted[sorted.length - 1].weight;
  const oldest = sorted[0].weight;
  const days = dayjs(sorted[sorted.length - 1].date).diff(dayjs(sorted[0].date), 'day') || 1;
  
  const dailyChange = (latest - oldest) / days;
  const weeklyChange = dailyChange * 7;

  let direction: 'up' | 'down' | 'stable';
  if (Math.abs(dailyChange) < 0.02) {
    direction = 'stable';
  } else if (dailyChange > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  const changeRate = `${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)} kg/天`;

  return { direction, dailyChange, weeklyChange, changeRate };
}

export function estimateCompletionDate(
  currentWeight: number,
  targetWeight: number,
  recentWeights: WeightRecord[]
): string | null {
  if (recentWeights.length < 7) {
    return null;
  }

  const sorted = [...recentWeights].sort((a, b) => 
    dayjs(a.date).unix() - dayjs(b.date).unix()
  );
  
  const recent = sorted.slice(-7);
  const dailyChange = (recent[recent.length - 1].weight - recent[0].weight) / 6;
  
  if (Math.abs(dailyChange) < 0.01) {
    return null;
  }

  const weightDiff = currentWeight - targetWeight;
  
  if ((weightDiff > 0 && dailyChange <= 0) || (weightDiff < 0 && dailyChange >= 0)) {
    return null;
  }

  const daysNeeded = Math.abs(weightDiff / dailyChange);
  const targetDate = dayjs().add(Math.ceil(daysNeeded), 'day');
  
  return targetDate.format('YYYY-MM-DD');
}

export function getProgress(currentWeight: number, targetWeight: number, initialWeight?: number): {
  progress: number;
  remaining: number;
  isComplete: boolean;
} {
  if (!initialWeight) {
    return { progress: 0, remaining: Math.abs(currentWeight - targetWeight), isComplete: false };
  }

  const totalToLose = initialWeight - targetWeight;
  const totalLost = initialWeight - currentWeight;
  
  if (totalToLose === 0) {
    return { progress: 100, remaining: 0, isComplete: true };
  }

  const progress = Math.min(100, Math.max(0, (totalLost / totalToLose) * 100));
  const remaining = Math.abs(currentWeight - targetWeight);
  
  return {
    progress: Math.round(progress),
    remaining: Number(remaining.toFixed(1)),
    isComplete: remaining < 0.1
  };
}

export function filterByTimeRange(records: WeightRecord[], range: string): WeightRecord[] {
  const today = dayjs();
  
  switch (range) {
    case '7d':
      return records.filter(r => dayjs(r.date).isAfter(today.subtract(7, 'day')));
    case '30d':
      return records.filter(r => dayjs(r.date).isAfter(today.subtract(30, 'day')));
    case '90d':
      return records.filter(r => dayjs(r.date).isAfter(today.subtract(90, 'day')));
    default:
      return records;
  }
}
