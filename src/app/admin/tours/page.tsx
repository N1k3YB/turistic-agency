'use client';

import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import ImageWithFallback from '@/components/ImageWithFallback';
import toast from 'react-hot-toast';
import { SearchParamsWrapper, useSearchParamsWithSuspense } from '@/hooks/useSearchParamsWithSuspense';

// Интерфейс для тура
interface Tour {
  id: number;
  title: string;
  slug: string;
  price: string;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  duration: number;
  groupSize: number;
  availableSeats: number;
  nextTourDate: string | null;
  destination: {
    name: string;
    slug: string;
  };
  _count?: {
    reviews: number;
    orders: number;
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

// Основной компонент страницы
export default function AdminToursPage() {
  return (
    <SearchParamsWrapper>
      <AdminToursContent />
    </SearchParamsWrapper>
  );
}

// Компонент с основной логикой
function AdminToursContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParamsWithSuspense();
  
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
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  const [processingDelete, setProcessingDelete] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [destinations, setDestinations] = useState<{id: number, name: string}[]>([]);
  
  // Refs для отслеживания загрузки данных
  const destinationsFetchedRef = useRef(false);
  const prevFetchParamsRef = useRef({
    page: 0,
    search: '',
    destinationFilter: null as number | null
  });
  
  // Получаем параметр фильтрации по направлению из URL
  useEffect(() => {
    const destinationId = searchParams?.get('destinationId');
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
  
  // Загрузка списка направлений для фильтрации (мемоизированная)
  const fetchDestinations = useCallback(async () => {
    // Проверяем, были ли уже загружены направления
    if (destinationsFetchedRef.current) return;
    
    try {
      const response = await fetch('/api/admin/destinations');
      if (!response.ok) {
        throw new Error('Не удалось загрузить направления');
      }
      
      const data = await response.json();
      if (data.destinations && Array.isArray(data.destinations)) {
        setDestinations(data.destinations.map((dest: any) => ({
          id: dest.id,
          name: dest.name
        })));
        
        // Отмечаем, что данные загружены
        destinationsFetchedRef.current = true;
      }
    } catch (error) {
      console.error("Ошибка при загрузке направлений:", error);
    }
  }, []);

  // Загружаем туры и направления при загрузке страницы
  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'ADMIN') {
      fetchDestinations();
    }
  }, [status, session, fetchDestinations]);
  
  // Загрузка данных (мемоизированная)
  const fetchTours = useCallback(async (forceRefresh = false) => {
    if (!isInitialized) return;
    
    // Проверяем, нужно ли выполнять повторный запрос
    const paramsChanged = 
      prevFetchParamsRef.current.page !== page ||
      prevFetchParamsRef.current.search !== search ||
      prevFetchParamsRef.current.destinationFilter !== destinationFilter;
      
    if (!forceRefresh && !paramsChanged && tours.length > 0) {
      setLoading(false);
      return;
    }
    
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
      
      // Обновляем предыдущие параметры запроса
      prevFetchParamsRef.current = {
        page,
        search,
        destinationFilter
      };
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  }, [page, search, destinationFilter, isInitialized, tours.length]);
  
  // Загружаем туры при изменении параметров
  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'ADMIN' && isInitialized) {
      fetchTours();
    }
  }, [page, search, destinationFilter, status, session, isInitialized, fetchTours]);
  
  // Сбрасываем кэширование при смене пользователя
  useEffect(() => {
    if (session?.user?.email) {
      destinationsFetchedRef.current = false;
      prevFetchParamsRef.current = {
        page: 0,
        search: '',
        destinationFilter: null
      };
    }
  }, [session?.user?.email]);
  
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
  
  // Обработчик изменения фильтра направления
  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const id = value ? parseInt(value) : null;
    
    // Обновляем URL с параметром destinationId
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set('destinationId', id.toString());
    } else {
      url.searchParams.delete('destinationId');
    }
    router.push(url.pathname + url.search);
    
    setDestinationFilter(id);
    setPage(1); // Сбрасываем на первую страницу
  };
  
  // Функция для подготовки к удалению тура
  const confirmDelete = (tour: Tour) => {
    setTourToDelete(tour);
    setShowDeleteModal(true);
  };
  
  // Функция для удаления тура
  const deleteTour = async () => {
    if (!tourToDelete) return;
    
    try {
      setProcessingDelete(true);
      const response = await fetch(`/api/admin/tours/${tourToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Не удалось удалить тур');
      }
      
      // Обновляем список туров
      toast.success('Тур успешно удален');
      fetchTours();
      setShowDeleteModal(false);
      setTourToDelete(null);
    } catch (error: any) {
      console.error("Ошибка при удалении тура:", error);
      toast.error(error.message || 'Произошла ошибка при удалении тура');
    } finally {
      setProcessingDelete(false);
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указана';
    
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Вернуться в панель администратора
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Управление турами</h1>
            <p className="text-gray-600 mt-1">Всего туров: {totalTours}</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск туров..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <div className="relative">
              <select
                value={destinationFilter?.toString() || ''}
                onChange={handleDestinationChange}
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Все направления</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>{dest.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
              onClick={() => router.push('/admin/tours/create')}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Добавить тур
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-600">
            <ExclamationCircleIcon className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        )}

        {tours.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto mb-4 bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center">
              <ExclamationCircleIcon className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Туры не найдены</h2>
            <p className="text-gray-600 mb-6">
              {search ? `По запросу "${search}" ничего не найдено` : 'На данный момент в системе нет туров'}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors mx-auto"
              onClick={() => router.push('/admin/tours/create')}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Добавить первый тур
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tours.map((tour) => (
              <div key={tour.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 h-48 md:h-auto md:w-48 relative">
                    <ImageWithFallback
                      src={tour.imageUrl}
                      alt={tour.title}
                      layout="fill"
                      objectFit="cover"
                      fallbackSrc="/images/image-placeholder.svg"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-semibold text-gray-800">
                            {tour.title}
                          </h2>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tour.destination.name}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                          {tour.shortDescription}
                        </p>
                      </div>
                      <p className="font-bold text-lg text-blue-600">
                        {tour.price} {tour.currency}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Длительность</p>
                        <p className="font-medium">{tour.duration} {tour.duration === 1 ? 'день' : 'дней'}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Размер группы</p>
                        <p className="font-medium">до {tour.groupSize} чел.</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Мест осталось</p>
                        <p className="font-medium">{tour.availableSeats}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Ближайшая дата</p>
                        <p className="font-medium">{formatDate(tour.nextTourDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/tours/${tour.slug}`}
                          className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-md text-sm transition-colors"
                          target="_blank"
                        >
                          Просмотр
                        </Link>
                        <Link
                          href={`/admin/tours/edit/${tour.id}`}
                          className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 py-2 px-3 rounded-md text-sm transition-colors flex items-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Изменить
                        </Link>
                        <button
                          onClick={() => confirmDelete(tour)}
                          className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 py-2 px-3 rounded-md text-sm transition-colors flex items-center"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Удалить
                        </button>
                      </div>
                      <div className="flex space-x-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs">
                            {tour._count?.reviews || 0} отзыв(ов)
                          </span>
                        </span>
                        <span className="flex items-center">
                          <span className="bg-green-100 text-green-800 py-1 px-2 rounded-full text-xs">
                            {tour._count?.orders || 0} заказ(ов)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Назад
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-4 py-2 rounded-md ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить тур "{tourToDelete?.title}"? Это действие нельзя будет отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setShowDeleteModal(false)}
                disabled={processingDelete}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center"
                onClick={deleteTour}
                disabled={processingDelete}
              >
                {processingDelete ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Удаление...
                  </>
                ) : (
                  <>Удалить</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 