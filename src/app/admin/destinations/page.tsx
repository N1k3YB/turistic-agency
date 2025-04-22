'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  MapPinIcon
} from '@heroicons/react/24/outline';
import ImageWithFallback from '@/components/ImageWithFallback';
import toast from 'react-hot-toast';

interface Destination {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tours: number;
  };
}

export default function AdminDestinationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [destinationToDelete, setDestinationToDelete] = useState<Destination | null>(null);
  const [processingDelete, setProcessingDelete] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  
  // Ref для отслеживания загрузки данных
  const dataFetchedRef = useRef(false);

  // Мемоизированная функция для загрузки направлений
  const fetchDestinations = useCallback(async () => {
    // Проверяем, были ли данные уже загружены
    if (dataFetchedRef.current) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/destinations');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить направления');
      }
      
      const data = await response.json();
      
      // Проверяем структуру данных и преобразуем в массив если необходимо
      if (data && typeof data === 'object') {
        // Если это объект с полем destinations
        if (Array.isArray(data.destinations)) {
          setDestinations(data.destinations);
          setFilteredDestinations(data.destinations);
        } 
        // Если это объект с полем data, содержащим массив
        else if (Array.isArray(data.data)) {
          setDestinations(data.data);
          setFilteredDestinations(data.data);
        }
        // Если это массив
        else if (Array.isArray(data)) {
          setDestinations(data);
          setFilteredDestinations(data);
        }
        // Если у объекта есть перечисляемые свойства, преобразуем в массив
        else if (Object.keys(data).length > 0) {
          console.log('Получены данные в неожиданном формате:', data);
          const destinationsArray = Object.values(data) as unknown[];
          if (Array.isArray(destinationsArray) && destinationsArray.length > 0 && 
              typeof destinationsArray[0] === 'object' && destinationsArray[0] !== null && 'id' in destinationsArray[0]) {
            setDestinations(destinationsArray as Destination[]);
            setFilteredDestinations(destinationsArray as Destination[]);
          } else {
            setError('Формат данных от API не соответствует ожидаемому');
          }
        } else {
          setDestinations([]);
          setFilteredDestinations([]);
        }
      } else {
        setDestinations([]);
        setFilteredDestinations([]);
      }
      
      // Отмечаем, что данные были загружены
      dataFetchedRef.current = true;
    } catch (error) {
      console.error("Ошибка при загрузке направлений:", error);
      setError('Произошла ошибка при загрузке направлений');
    } finally {
      setLoading(false);
    }
  }, []);

  // Мемоизированная функция для удаления направления
  const deleteDestination = useCallback(async () => {
    if (!destinationToDelete) return;
    
    try {
      setProcessingDelete(true);
      const response = await fetch(`/api/admin/destinations/${destinationToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Не удалось удалить направление');
      }
      
      // Обновляем список направлений с использованием функциональных обновлений
      setDestinations(prev => prev.filter(d => d.id !== destinationToDelete.id));
      setFilteredDestinations(prev => prev.filter(d => d.id !== destinationToDelete.id));
      
      toast.success('Направление успешно удалено');
      setShowDeleteModal(false);
      setDestinationToDelete(null);
    } catch (error) {
      console.error("Ошибка при удалении направления:", error);
      toast.error('Произошла ошибка при удалении направления');
    } finally {
      setProcessingDelete(false);
    }
  }, [destinationToDelete]);

  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Проверяем роль пользователя
    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (userRole !== 'ADMIN') {
        router.push('/');
        return;
      }

      // Загружаем направления
      fetchDestinations();
    }
  }, [status, session, router, fetchDestinations]);
  
  // Сбрасываем флаг загрузки данных при смене пользователя
  useEffect(() => {
    if (session?.user?.email) {
      dataFetchedRef.current = false;
    }
  }, [session?.user?.email]);

  // Фильтрация направлений при изменении поискового запроса
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredDestinations(destinations);
    } else {
      const searchLower = search.toLowerCase();
      setFilteredDestinations(
        destinations.filter(
          dest => 
            dest.name.toLowerCase().includes(searchLower) || 
            dest.description.toLowerCase().includes(searchLower)
        )
      );
    }
  }, [search, destinations]);

  // Функция для подготовки к удалению направления
  const confirmDelete = (destination: Destination) => {
    setDestinationToDelete(destination);
    setShowDeleteModal(true);
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
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

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Вернуться в панель администратора
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Управление направлениями</h1>
            <p className="text-gray-600 mt-1">Всего направлений: {destinations.length}</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск направлений..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
              onClick={() => router.push('/admin/destinations/create')}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Добавить направление
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-600">
            <ExclamationCircleIcon className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        )}

        {filteredDestinations.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto mb-4 bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center">
              <ExclamationCircleIcon className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Направления не найдены</h2>
            <p className="text-gray-600 mb-6">
              {search ? `По запросу "${search}" ничего не найдено` : 'На данный момент в системе нет направлений'}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors mx-auto"
              onClick={() => router.push('/admin/destinations/create')}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Добавить первое направление
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <div key={destination.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-48 relative">
                  <ImageWithFallback
                    src={destination.imageUrl}
                    alt={destination.name}
                    layout="fill"
                    objectFit="cover"
                    fallbackSrc="/images/image-placeholder.svg"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {destination.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Добавлено {formatDate(destination.createdAt)}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {destination._count?.tours || 0} {destination._count?.tours === 1 ? 'тур' : destination._count?.tours && destination._count.tours < 5 ? 'тура' : 'туров'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-6 line-clamp-2">
                    {destination.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link
                        href={`/destinations/${destination.slug}`}
                        className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-md text-sm transition-colors"
                        target="_blank"
                      >
                        Просмотр
                      </Link>
                      <Link
                        href={`/admin/tours?destinationId=${destination.id}`}
                        className="text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 py-2 px-3 rounded-md text-sm transition-colors flex items-center"
                      >
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        Туры
                      </Link>
                    </div>
                      <div className="flex space-x-2">
                      <Link
                        href={`/admin/destinations/edit/${destination.id}`}
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 py-2 px-3 rounded-md text-sm transition-colors flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Изменить
                      </Link>
                      <button
                        onClick={() => confirmDelete(destination)}
                        className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 py-2 px-3 rounded-md text-sm transition-colors flex items-center"
                        disabled={(destination._count?.tours || 0) > 0}
                        title={(destination._count?.tours || 0) > 0 ? "Нельзя удалить направление с турами" : ""}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить направление "{destinationToDelete?.name}"? Это также удалит все связанные туры. Это действие нельзя будет отменить.
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
                onClick={deleteDestination}
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