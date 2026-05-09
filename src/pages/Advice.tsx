import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { generateHealthAdvice } from '@/services/adviceService';
import { Apple, Dumbbell, Target, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const typeConfig = {
  diet: { icon: Apple, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  exercise: { icon: Dumbbell, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  management: { icon: Target, color: 'text-purple-500', bgColor: 'bg-purple-50' },
};

export default function Advice() {
  const { profile, weights, meals } = useStore();

  const advices = useMemo(() => {
    if (!profile) return [];
    return generateHealthAdvice(profile, weights, meals);
  }, [profile, weights, meals]);

  if (!profile) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">健康建议</h1>
          <p className="text-gray-500 mt-1">获取个性化健康指导</p>
        </div>
        <div className="card bg-gradient-to-br from-turquoise-50 to-teal-50 border border-turquoise-100">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-turquoise-100 flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-turquoise-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">设置个人信息</h3>
            <p className="text-gray-600 mb-4">先在设置中完善您的个人信息，我会根据您的身体数据提供更精准的健康建议</p>
          </div>
        </div>
      </div>
    );
  }

  const highPriority = advices.filter(a => a.priority <= 2);
  const mediumPriority = advices.filter(a => a.priority === 3);
  const lowPriority = advices.filter(a => a.priority > 3);

  const renderAdviceCard = (advice: typeof advices[0], index: number) => {
    const config = typeConfig[advice.type];
    const Icon = config.icon;

    return (
      <div
        key={advice.id}
        className={clsx('card animate-fade-in')}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex items-start gap-4">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bgColor)}>
            <Icon className={clsx('w-5 h-5', config.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-800">{advice.title}</h3>
              {advice.priority <= 2 && (
                <span className={clsx(
                  'px-2 py-0.5 text-xs rounded-full',
                  advice.priority === 1 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                )}>
                  {advice.priority === 1 ? '重要' : '建议关注'}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{advice.content}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">健康建议</h1>
        <p className="text-gray-500 mt-1">根据您的数据生成的个性化建议</p>
      </div>

      {advices.length === 0 ? (
        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">状态良好！</h3>
            <p className="text-gray-600">继续保持目前的生活习惯，您的各项指标都在健康范围内</p>
          </div>
        </div>
      ) : (
        <>
          {highPriority.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-800">重点关注</h2>
              </div>
              {highPriority.map((advice, index) => renderAdviceCard(advice, index))}
            </div>
          )}

          {mediumPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">改善建议</h2>
              {mediumPriority.map((advice, index) => renderAdviceCard(advice, highPriority.length + index))}
            </div>
          )}

          {lowPriority.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">日常小贴士</h2>
              {lowPriority.map((advice, index) => 
                renderAdviceCard(advice, highPriority.length + mediumPriority.length + index)
              )}
            </div>
          )}
        </>
      )}

      <div className="card bg-gradient-to-r from-turquoise-400 to-teal-500 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">温馨提示</h3>
            <p className="text-sm opacity-90 mt-1">这些建议仅供参考，如有健康问题请咨询专业医生</p>
          </div>
        </div>
      </div>
    </div>
  );
}
