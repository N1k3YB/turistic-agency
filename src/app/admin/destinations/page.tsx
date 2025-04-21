'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import DestinationModal from '@/components/admin/DestinationModal';
import ErrorNotification from '@/components/admin/ErrorNotification';

// Интерфейс для направления
interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    tours: number;
  };
}

// Интерфейс для данных ответа API
interface DestinationsResponse {
  destinations: Destination[];
  pagination: {
    page: number;
    limit: number;
    totalDestinations: number;
    totalPages: number;
  };
}

export default function AdminDestinationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Состояния для данных и управления
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<number | null>(null);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{
    id?: number;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    error?: string;
  } | null>(null);
  
  // Загрузка данных
  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Формируем URL с параметрами
      let url = `/api/admin/destinations?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке направлений');
      }
      
      const data: DestinationsResponse = await response.json();
      setDestinations(data.destinations);
      setTotalPages(data.pagination.totalPages);
      setTotalDestinations(data.pagination.totalDestinations);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };
  
  // Загружаем направления при изменении параметров
  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'ADMIN') {
      fetchDestinations();
    }
  }, [page, search, status, session]);
  
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
  
  const handleEditDestination = async (destinationId: number) => {
    try {
      setLoading(true);
      
      // Загружаем полные данные направления с сервера
      const response = await fetch(`/api/admin/destinations/${destinationId}`);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных направления');
      }
      
      const { destination } = await response.json();
      
      setSelectedDestination({
        id: destination.id,
        name: destination.name,
        slug: destination.slug,
        description: destination.description,
        imageUrl: destination.imageUrl
      });
      
      setShowDestinationModal(true);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке данных направления');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateDestination = () => {
    setSelectedDestination(null);
    setShowDestinationModal(true);
  };
  
  const handleSaveDestination = async (destinationData: any) => {
    try {
      setError(null);
      
      // Определяем URL и метод в зависимости от типа операции
      const url = destinationData.id 
        ? `/api/admin/destinations/${destinationData.id}` 
        : '/api/admin/destinations';
      
      const method = destinationData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(destinationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка от сервера:', errorData);
        throw new Error(errorData.error || 'Ошибка при сохранении направления');
      }
      
      // Закрываем модальное окно и обновляем список
      setShowDestinationModal(false);
      fetchDestinations();
    } catch (err: any) {
      setSelectedDestination(prev => ({ ...prev, error: err.message }));
    }
  };
  
  const confirmDeleteDestination = (destinationId: number) => {
    setDestinationToDelete(destinationId);
    setShowDeleteModal(true);
  };
  
  const handleDeleteDestination = async () => {
    if (!destinationToDelete) return;
    
    try {
      setError(null);
      
      const response = await fetch(`/api/admin/destinations/${destinationToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении направления');
      }
      
      // Закрываем модальное окно и обновляем список
      setShowDeleteModal(false);
      setDestinationToDelete(null);
      fetchDestinations();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при удалении направления');
    }
  };
  
  // Добавим обработчик для перехода к турам по направлению
  const handleRowClick = (destinationId: number) => {
    router.push(`/admin/tours?destinationId=${destinationId}`);
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
        <h1 className="text-2xl font-bold text-gray-800">Управление направлениями</h1>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Назад к панели администратора
        </Link>
      </div>
      
      {/* Панель фильтров и поиска */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по названию..."
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
              onClick={handleCreateDestination}
              disabled={hasErrors || loading}
              className={`w-full md:w-auto flex items-center justify-center px-4 py-2 rounded-lg
                ${hasErrors || loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                }`}
            >
              <PlusCircleIcon className="h-5 w-5 mr-1" />
              Добавить направление
            </button>
          </div>
        </div>
      </div>
      
      {/* Таблица направлений */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Изображение</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Туры</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : destinations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Направления не найдены
                  </td>
                </tr>
              ) : (
                destinations.map((destination) => (
                  <tr key={destination.id} 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => handleRowClick(destination.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                      {destination.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <img 
                        src={destination.imageUrl} 
                        alt={destination.name} 
                        className="h-10 w-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {destination.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        /destinations/{destination.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {destination.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {destination._count.tours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDestination(destination.id);
                          }}
                          aria-label="Редактировать направление"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteDestination(destination.id);
                          }}
                          aria-label="Удалить направление"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/tours?destinationId=${destination.id}`);
                          }}
                          aria-label="Просмотреть туры"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
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
            Показано {destinations.length} из {totalDestinations} направлений
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
            <p className="text-gray-700 mb-6">Вы уверены, что хотите удалить это направление? Это также удалит все связанные туры. Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                onClick={handleDeleteDestination}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно направления */}
      <DestinationModal
        isOpen={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        destination={selectedDestination}
        onSave={handleSaveDestination}
      />
    </div>
  );
} 