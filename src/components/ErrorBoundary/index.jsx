import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// 1. For full screens (critical)
export const ScreenErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <div className="flex flex-col items-center justify-center 
                      min-h-screen p-6 text-center bg-bg-primary relative z-50">
        <div className="text-6xl mb-4">🔧</div>
        <h2 className="text-white text-xl font-bold mb-2">
          Упс, экран сломался
        </h2>
        <p className="text-gray-400 mb-6">
          Мы уже знаем об ошибке и скоро исправим
        </p>
        <button onClick={reset}
          className="px-6 py-3 bg-purple-600 rounded-2xl text-white font-bold active:scale-95 transition-all">
          Обновить
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

// 2. For local blocks (soft)
export const BlockErrorBoundary = ({ children }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

// 3. For AI generation workflows (with custom alert)
export const GenerationErrorBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <div className="flex flex-col items-center justify-center 
                      p-6 text-center rounded-2xl bg-red-500/10 
                      border border-red-500/20 my-4 shadow-xl backdrop-blur-md">
        <div className="text-3xl mb-2">⚡</div>
        <p className="text-white font-medium mb-1">
          Генерация недоступна
        </p>
        <p className="text-gray-400 text-sm mb-3">
          Попробуй через несколько секунд
        </p>
        <button onClick={reset}
          className="px-4 py-2 bg-red-500/20 rounded-xl 
                     text-red-400 text-sm font-semibold active:scale-95 transition-all">
          Повторить
        </button>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export { default } from './ErrorBoundary';
