'use client'; // Указываем, что это клиентский компонент для использования useEffect

import { useEffect, useState, useCallback } from 'react';
import Link from "next/link";
import UserInfo from "@/components/auth/UserInfo";
import TourCard from '../../components/TourCard'; // Исправленный путь
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Определение типа для тура (согласовано с API и TourCard)
interface Tour {
  id: number;
  title: string;
  slug: string;
  price: string; // Цена приходит как строка из API
  currency: string;
  imageUrl: string;
  shortDescription: string;
  createdAt: string; // Добавим для полноты
  updatedAt: string; // Добавим для полноты
  destination?: {
    name: string;
  }; // Направление может быть включено
}

// Тип для направления (для фильтра)
interface Destination {
  id: number;
  name: string;
  slug: string;
}

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  // Функция для загрузки туров с учетом фильтров
  const fetchTours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedDestination) {
        params.append('destinationId', selectedDestination);
      }
      const response = await fetch(`/api/tours?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить туры');
      }
      const data: Tour[] = await response.json();
      setTours(data);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке туров');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDestination]); // Зависимости для useCallback

  // Загрузка направлений один раз при монтировании
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoadingDestinations(true);
      try {
        const response = await fetch('/api/destinations');
        if (!response.ok) {
          throw new Error('Не удалось загрузить направления');
        }
        const data: Destination[] = await response.json();
        setDestinations(data);
      } catch (err: any) {
        console.error('Ошибка загрузки направлений:', err);
        // Не блокируем страницу из-за ошибки загрузки направлений
      } finally {
        setLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, []);

  // Загрузка туров при изменении фильтров или при первом рендере
  useEffect(() => {
    fetchTours();
  }, [fetchTours]); // Зависимость от fetchTours

  // Обработчик для формы поиска (может быть пустым, т.к. используем onChange и useEffect)
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // fetchTours вызывается через useEffect при изменении searchTerm
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-6xl mb-8">
        <div className="flex justify-between items-center mb-4">
           <h1 className="text-3xl font-bold text-gray-800">
            Поиск туров
           </h1>
           <div className="w-full max-w-md">
             <UserInfo />
           </div>
        </div>

         {/* Форма поиска и фильтрации */}
         <form onSubmit={handleSearchSubmit} className="bg-gray-100 p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-grow w-full md:w-auto">
             <input
               type="text"
               placeholder="Название тура..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
             />
             <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
           </div>
           <div className="flex-grow w-full md:w-auto">
             <select
               value={selectedDestination}
               onChange={(e) => setSelectedDestination(e.target.value)}
               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
               disabled={loadingDestinations} // Блокируем, пока грузятся направления
             >
               <option value="">Все направления</option>
               {loadingDestinations ? (
                 <option disabled>Загрузка...</option>
               ) : (
                 destinations.map((dest) => (
                   <option key={dest.id} value={dest.id.toString()}>
                     {dest.name}
                   </option>
                 ))
               )}
             </select>
           </div>
           {/* Кнопка не обязательна, если используем onChange */}
           {/* <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Найти</button> */}
         </form>
      </div>

      <div className="w-full max-w-6xl">
          {loading && <p className="text-center text-gray-500 py-10">Загрузка туров...</p>}
          {error && <p className="text-center text-red-500 py-10">Ошибка: {error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.length > 0 ? (
                tours.map((tour) => (
                   // TourCard уже содержит Link
                  <TourCard key={tour.id} tour={tour} />
                ))
              ) : (
                <p className="text-center text-gray-500 col-span-full py-10">Туры по вашему запросу не найдены.</p>
              )}
            </div>
          )}
       </div>
    </main>
  );
}
