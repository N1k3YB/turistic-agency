'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import TourModal from '@/components/admin/TourModal';
import ErrorNotification from '@/components/admin/ErrorNotification';

// Интерфейс для тура
interface Tour {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  createdAt: string;
  updatedAt: string;
  destinationId: number;
  duration: number;
  groupSize: number;
  nextTourDate: string | null;
  destination: {
    name: string;
    slug: string;
  };
  _count: {
    reviews: number;
  };
}

// Интерфейс для данных ответа API
interface ToursResponse {
  tours: Tour[];
  pagination: {
    page: number;
    limit: number;
    totalTours: number;
    totalPages: number;
  };
}

export default function AdminToursPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Состояния для данных и управления
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTours, setTotalTours] = useState(0);
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<number | null>(null);
  const [showTourModal, setShowTourModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<{
    id?: number;
    title?: string;
    slug?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    shortDescription?: string;
    fullDescription?: string;
    inclusions?: string;
    exclusions?: string;
    itinerary?: string;
    imageUrls?: string[];
    destinationId?: number;
    error?: string;
    duration?: number;
    groupSize?: number;
    nextTourDate?: string;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Получаем параметр фильтрации по направлению из URL
  useEffect(() => {
    const destinationId = searchParams.get('destinationId');
    if (destinationId) {
      const id = parseInt(destinationId);
      if (!isNaN(id) && id > 0) {
        setDestinationFilter(id);
        // Также сбрасываем на первую страницу при изменении направления
        setPage(1);
      } else {
        setDestinationFilter(null);
      }
    } else {
      setDestinationFilter(null);
    }
    
    // Устанавливаем флаг инициализации, чтобы запустить загрузку данных
    setIsInitialized(true);
  }, [searchParams]);
  
  // Загрузка данных
  const fetchTours = async () => {
    if (!isInitialized) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Формируем URL с параметрами
      let url = `/api/admin/tours?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (destinationFilter) url += `&destinationId=${destinationFilter}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке туров');
      }
      
      const data: ToursResponse = await response.json();
      setTours(data.tours);
      setTotalPages(data.pagination.totalPages);
      setTotalTours(data.pagination.totalTours);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };
  
  // Загружаем туры при изменении параметров
  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'ADMIN' && isInitialized) {
      fetchTours();
    }
  }, [page, search, destinationFilter, status, session, isInitialized]);
  
  // Проверка на авторизацию и роль администратора
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/profile');
    }
  }, [session, status, router]);
  
  // Функции для управления
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Сбрасываем на первую страницу
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  const handleEditTour = async (tourId: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/tours/${tourId}`);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных тура');
      }
      
      const { tour } = await response.json();
      
      setSelectedTour({
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        price: tour.price,
        currency: tour.currency,
        imageUrl: tour.imageUrl,
        shortDescription: tour.shortDescription,
        fullDescription: tour.fullDescription,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        itinerary: tour.itinerary,
        imageUrls: tour.imageUrls,
        destinationId: tour.destinationId,
        duration: tour.duration,
        groupSize: tour.groupSize,
        nextTourDate: tour.nextTourDate ? new Date(tour.nextTourDate).toISOString().split('T')[0] : '',
      });
      
      setShowTourModal(true);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке данных тура');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTour = () => {
    setSelectedTour(destinationFilter ? { destinationId: destinationFilter } : null);
    setShowTourModal(true);
  };
  
  const handleSaveTour = async (tourData: any) => {
    try {
      setError(null);
      
      // Определяем URL и метод в зависимости от типа операции
      const url = tourData.id 
        ? `/api/admin/tours/${tourData.id}` 
        : '/api/admin/tours';
      
      const method = tourData.id ? 'PUT' : 'POST';
      
      console.log('Отправляем данные тура:', JSON.stringify(tourData, null, 2));
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка от сервера:', errorData);
        // Вместо установки ошибки на странице, передаем ее обратно в модальное окно
        throw new Error(errorData.error || 'Ошибка при сохранении тура');
      }
      
      // Закрываем модальное окно и обновляем список
      setShowTourModal(false);
      fetchTours();
    } catch (err: any) {
      console.error('Детали ошибки:', err);
      // Обновляем состояние с выбранным туром, добавляя туда ошибку
      setSelectedTour(prev => ({ ...prev, error: err.message }));
      // Не закрываем модальное окно при ошибке
    }
  };
  
  const confirmDeleteTour = (tourId: number) => {
    setTourToDelete(tourId);
    setShowDeleteModal(true);
  };
  
  const handleDeleteTour = async () => {
    if (!tourToDelete) return;
    
    try {
      setError(null);
      
      const response = await fetch(`/api/admin/tours/${tourToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении тура');
      }
      
      // Закрываем модальное окно и обновляем список
      setShowDeleteModal(false);
      setTourToDelete(null);
      fetchTours();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при удалении тура');
    }
  };
  
  // Добавляем функцию для перехода к детальной странице тура
  const handleRowClick = (slug: string) => {
    router.push(`/tours/${slug}`);
  };
  
  // Проверка на наличие ошибок
  const hasErrors = error !== null;
  
  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Если пользователь не администратор, не показываем контент
  if (status === 'authenticated' && session.user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 p-8 rounded-xl inline-block mx-auto">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600 mb-6">Эта страница доступна только администраторам.</p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      {/* Глобальное уведомление об ошибке */}
      <ErrorNotification error={error} onDismiss={() => setError(null)} />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {destinationFilter ? 
            `Туры по направлению "${tours.length > 0 ? tours[0].destination.name : ''}"` : 
            'Управление турами'}
        </h1>
        <div className="flex space-x-4">
          {destinationFilter && (
            <Link href="/admin/destinations" className="text-blue-600 hover:text-blue-800">
              Назад к направлениям
            </Link>
          )}
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            Назад к панели администратора
          </Link>
        </div>
      </div>
      
      {/* Панель фильтров и поиска */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по названию тура..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={handleSearchChange}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div>
            <button
              onClick={handleCreateTour}
              disabled={hasErrors || loading}
              className={`w-full md:w-auto flex items-center justify-center px-4 py-2 rounded-lg
                ${hasErrors || loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                }`}
            >
              <PlusCircleIcon className="h-5 w-5 mr-1" />
              Добавить тур
            </button>
          </div>
        </div>
      </div>
      
      {/* Таблица туров */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Изображение</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Направление</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Отзывы</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : tours.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Туры не найдены
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <tr key={tour.id} 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => handleRowClick(tour.slug)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                      {tour.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <img 
                        src={tour.imageUrl} 
                        alt={tour.title} 
                        className="h-10 w-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tour.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {tour.shortDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                      <Link 
                        href={`/admin/tours?destinationId=${tour.destinationId}`} 
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tour.destination.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tour.price} {tour.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tour._count.reviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTour(tour.id);
                          }}
                          aria-label="Редактировать тур"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteTour(tour.id);
                          }}
                          aria-label="Удалить тур"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link
                          href={`/tours/${tour.slug}`}
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Просмотреть тур"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Пагинация */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Показано {tours.length} из {totalTours} туров
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`flex items-center px-3 py-1 rounded-md cursor-pointer ${
                page === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Назад
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                .map((p, i, arr) => (
                  <Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-3 py-1 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 rounded-md cursor-pointer ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {p}
                    </button>
                  </Fragment>
                ))}
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`flex items-center px-3 py-1 rounded-md cursor-pointer ${
                page === totalPages 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Далее
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-lg p-6 z-10 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-700 mb-6">Вы уверены, что хотите удалить этот тур? Это также удалит все связанные отзывы. Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                onClick={handleDeleteTour}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно тура */}
      <TourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        tour={selectedTour}
        onSave={handleSaveTour}
      />
    </div>
  );
} 