'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import ImageWithFallback from '@/components/ImageWithFallback';
import toast from 'react-hot-toast';

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
  };
  orders?: {
    id: number;
    status: string;
    quantity: number;
  }[];
  _count?: {
    orders: number;
  };
}

export default function ManagerToursPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);
  const [processingDelete, setProcessingDelete] = useState<boolean>(false);

  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Проверяем роль пользователя
    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (userRole !== 'MANAGER') {
        router.push('/');
        return;
      }

      // Загружаем туры
      fetchTours();
    }
  }, [status, session, router]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/tours');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить туры');
      }
      
      const data = await response.json();
      
      // Проверяем структуру данных и преобразуем в массив если необходимо
      if (data && typeof data === 'object') {
        // Если это объект с полем tours или другим массивом
        if (Array.isArray(data.tours)) {
          setTours(data.tours as Tour[]);
        } 
        // Если это объект с полем data, содержащим массив
        else if (Array.isArray(data.data)) {
          setTours(data.data as Tour[]);
        }
        // Если это массив
        else if (Array.isArray(data)) {
          setTours(data as Tour[]);
        }
        // Если у объекта есть перечисляемые свойства, преобразуем в массив
        else if (Object.keys(data).length > 0) {
          console.log('Получены данные в неожиданном формате:', data);
          const toursArray = Object.values(data) as unknown[];
          if (Array.isArray(toursArray) && toursArray.length > 0 && typeof toursArray[0] === 'object' && toursArray[0] !== null && 'id' in toursArray[0]) {
            setTours(toursArray as Tour[]);
          } else {
            setError('Формат данных от API не соответствует ожидаемому');
          }
        } else {
          setTours([]);
        }
      } else {
        setTours([]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке туров:", error);
      setError('Произошла ошибка при загрузке туров');
    } finally {
      setLoading(false);
    }
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
      const response = await fetch(`/api/manager/tours/${tourToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Не удалось удалить тур');
      }
      
      // Обновляем список туров
      setTours(tours.filter(tour => tour.id !== tourToDelete.id));
      toast.success('Тур успешно удален');
      setShowDeleteModal(false);
      setTourToDelete(null);
    } catch (error) {
      console.error("Ошибка при удалении тура:", error);
      toast.error('Произошла ошибка при удалении тура');
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

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/manager" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Вернуться в панель менеджера
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Управление турами</h1>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
            onClick={() => router.push('/manager/tours/create')}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Добавить тур
          </button>
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
            <p className="text-gray-600 mb-6">На данный момент в системе нет туров</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors mx-auto"
              onClick={() => router.push('/manager/tours/create')}
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
                        <p className="font-medium">{tour.duration} {tour.duration === 1 ? 'день' : tour.duration < 5 ? 'дня' : 'дней'}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Размер группы</p>
                        <p className="font-medium">до {tour.groupSize} чел.</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Свободных мест</p>
                        <p className="font-medium">{tour.availableSeats}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-xs text-gray-500">Ближ. дата</p>
                        <p className="font-medium">{formatDate(tour.nextTourDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">
                          {tour._count?.orders || 0} {tour._count?.orders === 1 ? 'заказ' : tour._count?.orders && tour._count?.orders < 5 ? 'заказа' : 'заказов'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/tours/${tour.slug}`}
                          className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-md text-sm transition-colors"
                          target="_blank"
                        >
                          Просмотр
                        </Link>
                        <Link
                          href={`/manager/tours/edit/${tour.id}`}
                          className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 py-2 px-3 rounded-md text-sm transition-colors flex items-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Изменить
                        </Link>
                        <button
                          onClick={() => confirmDelete(tour)}
                          className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 py-2 px-3 rounded-md text-sm transition-colors flex items-center"
                          disabled={(tour._count?.orders || 0) > 0}
                          title={(tour._count?.orders || 0) > 0 ? "Нельзя удалить тур с активными заказами" : ""}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Удалить
                        </button>
                      </div>
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Подтверждение удаления</h3>
            <p className="mb-6">
              Вы уверены, что хотите удалить тур "{tourToDelete?.title}"? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                disabled={processingDelete}
              >
                Отмена
              </button>
              <button
                onClick={deleteTour}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center transition-colors"
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
                  <>
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Удалить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 