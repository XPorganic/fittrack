import { useState } from 'react';
import { Profile } from '@/types';
import { User, Ruler, Calendar, Activity, ChevronRight, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface OnboardingProps {
  onComplete: (profile: Profile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    height: '',
    gender: 'male' as 'male' | 'female',
    age: '',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { icon: User, title: '欢迎使用 FitTrack', subtitle: '让我们先了解一下您的基本信息' },
    { icon: Ruler, title: '您的身高', subtitle: '用于计算 BMI 指数' },
    { icon: User, title: '您的性别', subtitle: '影响基础代谢率计算' },
    { icon: Calendar, title: '您的年龄', subtitle: '帮助我们更准确地估算' },
    { icon: Activity, title: '活动水平', subtitle: '影响每日热量消耗' },
  ];

  const activityOptions = [
    { value: 'sedentary', label: '久坐', desc: '办公室工作，几乎不运动' },
    { value: 'light', label: '轻度', desc: '每周运动 1-3 天' },
    { value: 'moderate', label: '中度', desc: '每周运动 3-5 天' },
    { value: 'active', label: '活跃', desc: '每周运动 6-7 天' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1 && (!formData.height || parseFloat(formData.height) <= 0 || parseFloat(formData.height) > 300)) {
      newErrors.height = '请输入有效的身高 (1-300 cm)';
    }
    if (step === 3 && (!formData.age || parseInt(formData.age) <= 0 || parseInt(formData.age) > 150)) {
      newErrors.age = '请输入有效的年龄 (1-150)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        height: parseFloat(formData.height),
        gender: formData.gender,
        age: parseInt(formData.age),
        activityLevel: formData.activityLevel,
      });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const Icon = steps[step].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-400 via-teal-400 to-cyan-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-turquoise-400 to-teal-500 flex items-center justify-center shadow-lg">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            {steps[step].title}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {steps[step].subtitle}
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === step ? 'w-6 bg-turquoise-400' : i < step ? 'bg-turquoise-300' : 'bg-gray-200'
                )}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="例如：170"
                  className={clsx(
                    'input-field pr-12 text-center text-2xl',
                    errors.height && 'border-red-500 focus:ring-red-400'
                  )}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
              </div>
              {errors.height && (
                <p className="text-red-500 text-sm mt-2">{errors.height}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className={clsx(
                  'p-6 rounded-2xl border-2 transition-all text-center',
                  formData.gender === 'male'
                    ? 'border-turquoise-400 bg-turquoise-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="text-4xl mb-2">👨</div>
                <div className={clsx(
                  'font-medium',
                  formData.gender === 'male' ? 'text-turquoise-600' : 'text-gray-700'
                )}>男</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className={clsx(
                  'p-6 rounded-2xl border-2 transition-all text-center',
                  formData.gender === 'female'
                    ? 'border-turquoise-400 bg-turquoise-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="text-4xl mb-2">👩</div>
                <div className={clsx(
                  'font-medium',
                  formData.gender === 'female' ? 'text-turquoise-600' : 'text-gray-700'
                )}>女</div>
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="例如：25"
                className={clsx(
                  'input-field text-center text-2xl',
                  errors.age && 'border-red-500 focus:ring-red-400'
                )}
                autoFocus
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-2">{errors.age}</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="mb-6 space-y-3">
              {activityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, activityLevel: option.value as any })}
                  className={clsx(
                    'w-full p-4 rounded-xl border-2 text-left transition-all',
                    formData.activityLevel === option.value
                      ? 'border-turquoise-400 bg-turquoise-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={clsx(
                    'font-medium',
                    formData.activityLevel === option.value ? 'text-turquoise-600' : 'text-gray-700'
                  )}>
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          )}

          {step === 0 && (
            <div className="mb-6 text-center">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="font-medium text-gray-800">体重追踪</div>
                  <div className="text-sm text-gray-500">记录每日体重变化</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">🍽️</div>
                  <div className="font-medium text-gray-800">饮食记录</div>
                  <div className="text-sm text-gray-500">追踪每日热量摄入</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-medium text-gray-800">目标设定</div>
                  <div className="text-sm text-gray-500">设定并追踪健康目标</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">💡</div>
                  <div className="font-medium text-gray-800">健康建议</div>
                  <div className="text-sm text-gray-500">获取个性化建议</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="btn-secondary flex-1"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  开始使用
                </>
              ) : (
                <>
                  下一步
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-white/70 text-center mt-6 text-sm">
          您的数据仅保存在本地设备中
        </p>
      </div>
    </div>
  );
}
