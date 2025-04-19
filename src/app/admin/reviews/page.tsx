'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  StarIcon, 
  TrashIcon, 
  UserCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Tour {
  title: string;
  slug: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  tour: Tour;
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReviews = async () => {
      if (status === 'loading') return;
      
      if (!session || session.user.role !== 'ADMIN') {
        setError('Доступ запрещен. Эта страница доступна только администраторам.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/admin/reviews');
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить отзывы');
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [session, status]);
  
  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}/approve`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Не удалось одобрить отзыв');
      }
      
      // Обновляем состояние после успешного одобрения
      setReviews(reviews.map(review => 
        review.id === id ? { ...review, isApproved: true } : review
      ));
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Не удалось удалить отзыв');
      }
      
      // Обновляем состояние после успешного удаления
      setReviews(reviews.filter(review => review.id !== id));
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!session || session.user.role !== 'ADMIN') {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Модерация отзывов</h1>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Назад к панели администратора
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">Отзывы отсутствуют</h2>
              <p className="text-gray-500">На данный момент нет отзывов для модерации.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-gray-700 border-b">
                <div className="col-span-2">Тур</div>
                <div className="col-span-2">Пользователь</div>
                <div className="col-span-1">Оценка</div>
                <div className="col-span-4">Отзыв</div>
                <div className="col-span-1">Статус</div>
                <div className="col-span-2">Действия</div>
              </div>
              
              {reviews.map((review) => (
                <div key={review.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50">
                  <div className="col-span-2">
                    <Link 
                      href={`/tours/${review.tour.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {review.tour.title}
                    </Link>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center">
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user.name || 'Пользователь'}
                          width={32}
                          height={32}
                          className="rounded-full mr-2"
                        />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                      )}
                      <div>
                        <div className="font-medium text-gray-800">
                          {review.user.name || 'Пользователь'}
                        </div>
                        <div className="text-xs text-gray-500">{review.user.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="flex items-center text-yellow-400">
                      {review.rating}
                      <StarIcon className="h-4 w-4 ml-1" />
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(review.createdAt), 'dd.MM.yyyy', { locale: ru })}
                    </div>
                  </div>
                  
                  <div className="col-span-4">
                    <p className="text-gray-700 line-clamp-3">{review.comment}</p>
                  </div>
                  
                  <div className="col-span-1">
                    {review.isApproved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Одобрен
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        Ожидает
                      </span>
                    )}
                  </div>
                  
                  <div className="col-span-2 flex space-x-2">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-1 px-3 rounded flex items-center text-sm"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Одобрить
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded flex items-center text-sm"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 