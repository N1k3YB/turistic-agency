'use client';

import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { createContext, useContext, ReactNode, Suspense } from 'react';

// Создаем контекст для хранения параметров поиска
const SearchParamsContext = createContext<ReturnType<typeof useNextSearchParams> | null>(null);

// Компонент провайдера, который будет обернут в Suspense
function SearchParamsProvider({ children }: { children: ReactNode }) {
  const searchParams = useNextSearchParams();
  
  return (
    <SearchParamsContext.Provider value={searchParams}>
      {children}
    </SearchParamsContext.Provider>
  );
}

// Компонент-обертка с Suspense
export function SearchParamsWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <SearchParamsProvider>
        {children}
      </SearchParamsProvider>
    </Suspense>
  );
}

// Хук для использования searchParams внутри компонентов
export function useSearchParamsWithSuspense() {
  const searchParams = useContext(SearchParamsContext);
  
  if (searchParams === null) {
    throw new Error(
      'useSearchParamsWithSuspense должен использоваться внутри SearchParamsWrapper'
    );
  }
  
  return searchParams;
}

// Пример использования:
/*
import { SearchParamsWrapper, useSearchParamsWithSuspense } from '@/hooks/useSearchParamsWithSuspense';

function MyComponent() {
  // Используем searchParams внутри компонента
  const searchParams = useSearchParamsWithSuspense();
  // ...
}

// В родительском компоненте или на странице
export default function Page() {
  return (
    <SearchParamsWrapper>
      <MyComponent />
    </SearchParamsWrapper>
  );
}
*/ 