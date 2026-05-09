import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { User, Scale, Download, Upload, Trash2, Save, Check, Activity, Bookmark } from 'lucide-react';
import { clsx } from 'clsx';

export default function Settings() {
  const { profile, weights, meals, goal, customFoods, setProfile, exportData, importData, clearAllData, setInitialized, removeCustomFood } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    height: profile?.height?.toString() || '',
    gender: profile?.gender || 'male',
    age: profile?.age?.toString() || '',
    activityLevel: profile?.activityLevel || 'moderate',
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSaveProfile = () => {
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    
    if (height > 0 && height < 300 && age > 0 && age < 150) {
      setProfile({
        height,
        gender: formData.gender as 'male' | 'female',
        age,
        activityLevel: formData.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active',
      });
      setInitialized();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportSuccess(true);
        setImportError('');
        setTimeout(() => setImportSuccess(false), 3000);
        const imported = JSON.parse(content);
        if (imported.profile) {
          setFormData({
            height: imported.profile.height?.toString() || '',
            gender: imported.profile.gender || 'male',
            age: imported.profile.age?.toString() || '',
            activityLevel: imported.profile.activityLevel || 'moderate',
          });
        }
      } else {
        setImportError('数据格式不正确，导入失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    clearAllData();
    setFormData({
      height: '',
      gender: 'male',
      age: '',
      activityLevel: 'moderate',
    });
    setShowClearConfirm(false);
  };

  const activityOptions: Array<{ value: 'sedentary' | 'light' | 'moderate' | 'active'; label: string; desc: string }> = [
    { value: 'sedentary', label: '久坐（很少运动）', desc: '办公室工作，几乎不运动' },
    { value: 'light', label: '轻度活动', desc: '每周运动1-3天' },
    { value: 'moderate', label: '中度活动', desc: '每周运动3-5天' },
    { value: 'active', label: '重度活动', desc: '每周运动6-7天' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">设置</h1>
        <p className="text-gray-500 mt-1">管理个人信息和数据</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-turquoise-100 flex items-center justify-center">
            <User className="w-5 h-5 text-turquoise-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">个人信息</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="例如：170"
                  className="input-field pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">cm</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="例如：25"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className={clsx(
                  'flex-1 py-3 rounded-xl border-2 transition-all',
                  formData.gender === 'male'
                    ? 'border-turquoise-400 bg-turquoise-50 text-turquoise-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                男
              </button>
              <button
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className={clsx(
                  'flex-1 py-3 rounded-xl border-2 transition-all',
                  formData.gender === 'female'
                    ? 'border-turquoise-400 bg-turquoise-50 text-turquoise-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                女
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                活动水平
              </div>
            </label>
            <div className="space-y-2">
              {activityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, activityLevel: option.value })}
                  className={clsx(
                    'w-full p-3 rounded-xl border-2 text-left transition-all',
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
          </div>

          <button onClick={handleSaveProfile} className="btn-primary w-full flex items-center justify-center gap-2">
            {showSaveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                保存成功
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">数据统计</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{weights.length}</p>
            <p className="text-sm text-gray-500">体重记录</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{meals.length}</p>
            <p className="text-sm text-gray-500">饮食记录</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{customFoods.length}</p>
            <p className="text-sm text-gray-500">自定义食物</p>
          </div>
        </div>
      </div>

      {customFoods.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">我的食物库</h2>
          </div>
          <div className="space-y-2">
            {customFoods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{food.name}</p>
                  <p className="text-sm text-gray-500">{food.caloriesPer100g} kcal/100g · {food.category}</p>
                </div>
                <button
                  onClick={() => removeCustomFood(food.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Download className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">数据管理</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">备份数据</h3>
            <p className="text-sm text-gray-500 mb-3">导出所有数据为 JSON 文件，方便备份或转移到其他设备</p>
            <button onClick={handleExport} className="btn-secondary w-full flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              导出数据
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">恢复数据</h3>
            <p className="text-sm text-gray-500 mb-3">从备份文件恢复数据</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              选择备份文件
            </button>
            {importError && (
              <p className="mt-2 text-sm text-red-500">{importError}</p>
            )}
            {importSuccess && (
              <p className="mt-2 text-sm text-emerald-500">数据导入成功！</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">清除数据</h3>
            <p className="text-sm text-gray-500 mb-3">删除所有本地数据，此操作不可恢复</p>
            {showClearConfirm ? (
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600 mb-3">确定要清除所有数据吗？此操作不可恢复！</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    确认清除
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                清除所有数据
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-turquoise-50 to-teal-50 border border-turquoise-100">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 mb-2">FitTrack</h3>
          <p className="text-sm text-gray-500">版本 1.0.0</p>
          <p className="text-xs text-gray-400 mt-2">您的个人健康管理助手</p>
        </div>
      </div>
    </div>
  );
}
