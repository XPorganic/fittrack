import { HealthAdvice, Profile, WeightRecord, MealRecord } from '@/types';
import { calculateBMI, getBMICategory } from './bmiService';
import { calculateTrend } from './trendService';
import { getCaloriesConsumed, calculateTDEE, calculateBMR } from './calorieService';
import dayjs from 'dayjs';

export function generateHealthAdvice(
  profile: Profile,
  weights: WeightRecord[],
  meals: MealRecord[]
): HealthAdvice[] {
  const advice: HealthAdvice[] = [];
  const today = dayjs().format('YYYY-MM-DD');
  
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const bmi = profile.height > 0 ? calculateBMI(currentWeight, profile.height) : 0;
  const bmiInfo = getBMICategory(bmi);
  const trend = calculateTrend(weights.slice(-14));
  const consumed = getCaloriesConsumed(meals, today);
  const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const deficit = tdee - consumed;

  if (bmi < 18.5) {
    advice.push({
      id: 'bmi-low',
      type: 'diet',
      title: '体重偏低建议',
      content: `您的BMI为${bmi}，属于偏瘦范围。建议增加营养摄入，每餐适当增加优质蛋白质（如鸡胸肉、鱼、豆腐）和健康脂肪（如坚果、橄榄油）的摄入。少食多餐可以帮助您更有效地增加体重。`,
      priority: 1
    });
  } else if (bmi >= 24) {
    advice.push({
      id: 'bmi-high',
      type: 'management',
      title: '体重管理建议',
      content: `您的BMI为${bmi}，属于${bmiInfo.label}范围。建议控制饮食份量，增加蔬菜水果摄入，减少高热量、高脂肪食物。建议每天快走30分钟以上，或进行其他中等强度运动。`,
      priority: 1
    });
  }

  if (trend.direction === 'up' && trend.dailyChange > 0.05) {
    advice.push({
      id: 'weight-up',
      type: 'management',
      title: '体重持续上升提醒',
      content: `最近一周您的体重呈上升趋势，平均每天增加约${trend.dailyChange.toFixed(2)}kg。建议回顾近期饮食情况，减少高热量食物摄入，增加运动量。`,
      priority: 2
    });
  }

  if (deficit < -300) {
    advice.push({
      id: 'calorie-over',
      type: 'diet',
      title: '热量摄入过多',
      content: `今日摄入热量已超过建议值${Math.abs(deficit)}kcal。建议减少晚餐份量，避免睡前吃东西，适当增加运动消耗多余热量。`,
      priority: 2
    });
  } else if (deficit > 700 && consumed > 0) {
    advice.push({
      id: 'calorie-low',
      type: 'diet',
      title: '热量摄入偏低',
      content: `今日摄入热量较低，长期热量缺口过大会影响基础代谢。建议确保每日摄入至少达到基础代谢率(${bmr}kcal)，保持营养均衡。`,
      priority: 3
    });
  }

  if (trend.direction === 'down' && Math.abs(trend.dailyChange) >= 0.1) {
    advice.push({
      id: 'weight-down-fast',
      type: 'management',
      title: '减重速度较快',
      content: `您的减重速度较快，建议确保减重期间保持营养均衡，每天摄入不低于基础代谢所需热量。适当补充蛋白质和维生素，避免肌肉流失。`,
      priority: 2
    });
  }

  if (trend.direction === 'stable' && weights.length >= 14) {
    advice.push({
      id: 'weight-stable',
      type: 'management',
      title: '体重进入平台期',
      content: `您的体重已保持稳定一段时间。如果希望继续改变体重，建议调整饮食结构或增加运动强度。可以尝试HIIT训练或调整碳水化合物摄入时机。`,
      priority: 3
    });
  }

  advice.push({
    id: 'general-exercise',
    type: 'exercise',
    title: '运动建议',
    content: `根据您的活动水平，建议每周进行${profile.activityLevel === 'sedentary' ? '150' : profile.activityLevel === 'light' ? '180' : profile.activityLevel === 'moderate' ? '200' : '250'}分钟中等强度有氧运动，配合力量训练效果更佳。`,
    priority: 4
  });

  if (consumed === 0 && weights.length > 0) {
    advice.push({
      id: 'no-food-log',
      type: 'diet',
      title: '记得记录饮食',
      content: '今日还没有记录饮食。养成记录饮食的习惯有助于了解每日热量摄入，是体重管理的重要环节。',
      priority: 5
    });
  }

  return advice.sort((a, b) => a.priority - b.priority);
}
