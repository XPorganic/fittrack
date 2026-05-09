export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

export function getBMICategory(bmi: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (bmi < 18.5) {
    return { label: '偏瘦', color: '#3B82F6', bgColor: 'bg-blue-100' };
  } else if (bmi < 24) {
    return { label: '正常', color: '#10B981', bgColor: 'bg-emerald-100' };
  } else if (bmi < 28) {
    return { label: '超重', color: '#F59E0B', bgColor: 'bg-amber-100' };
  } else {
    return { label: '肥胖', color: '#EF4444', bgColor: 'bg-red-100' };
  }
}

export function getBMIRange(bmi: number): { min: number; max: number } {
  if (bmi < 18.5) {
    return { min: 18.5, max: 24 };
  } else if (bmi < 24) {
    return { min: 18.5, max: 24 };
  } else if (bmi < 28) {
    return { min: 24, max: 28 };
  } else {
    return { min: 28, max: 35 };
  }
}
