'use client'; // Указываем, что это клиентский компонент для использования useEffect

import { useEffect, useState, useCallback } from 'react';
import Link from "next/link";
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
  const [popularTours, setPopularTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 6; // Количество туров для загрузки за один раз

  // Функция для загрузки туров с учетом фильтров
  const fetchTours = useCallback(async (newOffset: number = 0) => {
    if (newOffset === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedDestination) {
        params.append('destinationId', selectedDestination);
      }
      params.append('limit', limit.toString());
      params.append('offset', newOffset.toString());
      
      const response = await fetch(`/api/tours?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить туры');
      }
      const data: Tour[] = await response.json();
      
      if (newOffset === 0) {
        setTours(data);
      } else {
        setTours(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === limit);
      setOffset(newOffset);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке туров');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDestination, limit]);

  // Функция для загрузки популярных туров
  const fetchPopularTours = useCallback(async () => {
    setLoadingPopular(true);
    try {
      const params = new URLSearchParams();
      params.append('popular', 'true');
      params.append('limit', '3'); // Получаем только 3 популярных тура
      
      const response = await fetch(`/api/tours?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить популярные туры');
      }
      const data: Tour[] = await response.json();
      setPopularTours(data);
    } catch (err: any) {
      console.error('Ошибка загрузки популярных туров:', err);
    } finally {
      setLoadingPopular(false);
    }
  }, []);

  // Функция для загрузки дополнительных туров
  const loadMoreTours = () => {
    fetchTours(offset + limit);
  };

  // Функция для выбора случайного тура
  const selectRandomTour = useCallback(() => {
    if (tours.length > 0) {
      const randomIndex = Math.floor(Math.random() * tours.length);
      const randomTour = tours[randomIndex];
      window.location.href = `/tours/${randomTour.slug}`;
    }
  }, [tours]);

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
    fetchTours(0); // Сбрасываем смещение на 0 при изменении фильтров
    fetchPopularTours(); // Загружаем популярные туры
  }, [fetchTours, fetchPopularTours, searchTerm, selectedDestination]); // Зависимости

  // Обработчик для формы поиска (может быть пустым, т.к. используем onChange и useEffect)
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // fetchTours вызывается через useEffect при изменении searchTerm
  };

  return (
    <main className="min-h-screen flex flex-col items-center">
      {/* Героическая секция */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow max-w-4xl">
            Откройте мир удивительных путешествий
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-blue-100">
            Лучшие туры и направления по всему миру с турагентством "Полёт"
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={selectRandomTour}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold text-lg transition-colors shadow-lg">
              Подобрать тур
            </button>
          </div>
        </div>
      </section>

      {/* Популярные туры */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Популярные туры</h2>
          <p className="text-gray-600">Самые востребованные направления среди наших клиентов</p>
        </div>
        
        {loadingPopular ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {popularTours.length > 0 ? (
              popularTours.map((tour) => (
                <div key={tour.id} className="h-full">
                  <TourCard tour={tour} />
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-600">Популярные туры не найдены</p>
            )}
          </div>
        )}
      </section>

      {/* Форма поиска */}
      <div className="w-full max-w-7xl px-4 md:px-8 py-8">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Найдите свой идеальный тур</h2>
              <p className="text-gray-600">Выберите из сотен направлений по всему миру</p>
            </div>
          </div>

          {/* Форма поиска и фильтрации */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-xl shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <input
                type="text"
                placeholder="Название тура или направления..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <div className="flex-grow w-full md:w-auto">
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                disabled={loadingDestinations}
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
          </form>
        </div>

        <div className="w-full">
          {loading && offset === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8">
              <p className="font-medium">Ошибка: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {tours.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((tour) => (
                      <div key={tour.id} className="h-full">
                        <TourCard tour={tour} />
                      </div>
                    ))}
                  </div>
                  {hasMore && (
                    <div className="mt-12 text-center">
                      {loading && offset > 0 ? (
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <button 
                          onClick={loadMoreTours}
                          className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-6 rounded-full transition-colors">
                          Показать больше туров
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-blue-50 p-10 rounded-xl text-center flex flex-col items-center">
                  <div className="bg-blue-100 rounded-full p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xl font-medium text-gray-800 mb-2">Туры по вашему запросу не найдены</p>
                  <p className="text-gray-600 mb-4">Попробуйте изменить параметры поиска или выбрать другое направление</p>
                  <button onClick={() => {setSearchTerm(''); setSelectedDestination('');}} className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Секция с преимуществами */}
      <section className="w-full bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Лучшие цены",
                description: "Мы гарантируем самые выгодные предложения и специальные скидки для наших клиентов."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Безопасность и поддержка",
                description: "Наша команда доступна 24/7, чтобы обеспечить вам комфортное и безопасное путешествие."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                ),
                title: "Индивидуальный подход",
                description: "Мы создаем индивидуальные маршруты, учитывая все ваши пожелания и предпочтения."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
