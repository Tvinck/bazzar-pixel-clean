import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateBanner = () => {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  
  if (!needRefresh) return null;
  
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50
                    bg-purple-600 rounded-2xl p-4 
                    flex items-center justify-between
                    shadow-lg shadow-purple-500/20">
      <div>
        <p className="text-white font-medium text-sm">
          🚀 Доступно обновление
        </p>
        <p className="text-purple-200 text-xs">
          Новые функции уже готовы
        </p>
      </div>
      <button
        onClick={() => {
          console.log('🔄 Triggering PWA Update...');
          updateServiceWorker(true);
          // Fallback reload if updateServiceWorker doesn't trigger it automatically
          setTimeout(() => window.location.reload(), 500);
        }}
        className="px-4 py-2 bg-white rounded-xl 
                   text-purple-600 text-sm font-medium
                   active:scale-95 transition-transform"
      >
        Обновить
      </button>
    </div>
  );
};

export default UpdateBanner;
