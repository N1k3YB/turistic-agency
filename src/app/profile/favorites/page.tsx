'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ExclamationCircleIcon, 
  HeartIcon,
  ArrowLeftIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ImageWithFallback from '@/components/ImageWithFallback';
import toast from 'react-hot-toast';

interface FavoriteTour {
  id: number;
  userId: string;
  tourId: number;
  createdAt: string;
  tour: {
    id: number;
    title: string;
    imageUrl: string;
    price: string;
    currency: string;
    shortDescription: string;
    availableSeats: number;
    nextTourDate: string | null;
    slug: string;
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Флаг для отслеживания загрузки данных
  const dataFetchedRef = useRef(false);

  // Мемоизированная функция для загрузки избранных туров
  const fetchFavorites = useCallback(async () => {
    // Если данные уже загружены, не делаем повторный запрос
    if (dataFetchedRef.current) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/favorites');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить избранные туры');
      }
      
      const data = await response.json();
      setFavorites(data);
      
      // Отмечаем, что данные загружены
      dataFetchedRef.current = true;
    } catch (error) {
      console.error("Ошибка при загрузке избранных туров:", error);
      setError('Произошла ошибка при загрузке избранных туров');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Загружаем избранные туры, если пользователь авторизован
    if (status === 'authenticated') {
      fetchFavorites();
    }
  }, [status, router, fetchFavorites]);

  // Сбрасываем флаг загрузки при изменении пользователя
  useEffect(() => {
    if (session?.user?.email) {
      dataFetchedRef.current = false;
    }
  }, [session?.user?.email]);

  // Мемоизированная функция для удаления из избранного
  const removeFromFavorites = useCallback(async (tourId: number) => {
    try {
      const response = await fetch(`/api/favorites?tourId=${tourId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Обновляем состояние, удаляя выбранный тур из избранного
        setFavorites(favorites.filter(fav => fav.tourId !== tourId));
        toast.success('Тур удален из избранного');
      } else {
        toast.error('Не удалось удалить тур из избранного');
      }
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error);
      toast.error('Произошла ошибка');
    }
  }, [favorites]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Даты уточняйте у менеджера';
    
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Вернуться в профиль
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Избранные туры</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-600">
            <ExclamationCircleIcon className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        )}

        {favorites.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto mb-4 bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center">
              <HeartIcon className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">У вас пока нет избранных туров</h2>
            <p className="text-gray-600 mb-6">Добавляйте понравившиеся туры в избранное, чтобы вернуться к ним позже</p>
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Перейти к турам
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                <div className="relative h-48">
                  <ImageWithFallback
                    src={favorite.tour.imageUrl}
                    alt={favorite.tour.title}
                    layout="fill"
                    objectFit="cover"
                    fallbackSrc="/images/image-placeholder.svg"
                  />
                  <button 
                    onClick={() => removeFromFavorites(favorite.tourId)}
                    className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                  >
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {favorite.tour.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {favorite.tour.shortDescription}
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-gray-500 text-sm">Ближайшая дата:</span>
                        <p className="text-sm font-medium">{formatDate(favorite.tour.nextTourDate)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 text-sm">Свободных мест:</span>
                        <p className="text-sm font-medium">{favorite.tour.availableSeats}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="font-bold text-xl">
                        {favorite.tour.price} {favorite.tour.currency}
                      </div>
                      <Link 
                        href={`/tours/${favorite.tour.slug}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center text-sm transition-colors"
                      >
                        <ShoppingCartIcon className="h-4 w-4 mr-1" />
                        Забронировать
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 