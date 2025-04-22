'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import ImageWithFallback from '@/components/ImageWithFallback';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  tourId: number;
  userId: string;
  quantity: number;
  totalPrice: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  contactPhone: string | null;
  contactEmail: string;
  tour: {
    title: string;
    imageUrl: string;
    price: string;
    currency: string;
    availableSeats: number;
    nextTourDate: string | null;
    slug: string;
  };
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Флаг для отслеживания загрузки данных
  const dataFetchedRef = useRef(false);

  // Мемоизированная функция для загрузки заказов
  const fetchOrders = useCallback(async () => {
    // Если данные уже загружены, не делаем повторный запрос
    if (dataFetchedRef.current) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить заказы');
      }
      
      const data = await response.json();
      setOrders(data);
      
      // Отмечаем, что данные загружены
      dataFetchedRef.current = true;
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
      setError('Произошла ошибка при загрузке заказов');
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

    // Загружаем заказы, если пользователь авторизован
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router, fetchOrders]);

  // Сбрасываем флаг загрузки при изменении пользователя
  useEffect(() => {
    if (session?.user?.email) {
      dataFetchedRef.current = false;
    }
  }, [session?.user?.email]);

  // Функция для определения статуса заказа
  const getStatusDetails = (status: string) => {
    switch(status) {
      case 'PENDING':
        return {
          icon: <ClockIcon className="h-5 w-5 text-yellow-500" />,
          text: 'Ожидает подтверждения',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      case 'CONFIRMED':
        return {
          icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
          text: 'Подтвержден',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'CANCELLED':
        return {
          icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
          text: 'Отменен',
          color: 'text-red-600 bg-red-50 border-red-200'
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircleIcon className="h-5 w-5 text-blue-500" />,
          text: 'Завершен',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      default:
        return {
          icon: <ExclamationCircleIcon className="h-5 w-5 text-gray-500" />,
          text: 'Статус неизвестен',
          color: 'text-gray-600 bg-gray-50 border-gray-200'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <h1 className="text-3xl font-bold text-gray-800">Мои заказы</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-600">
            <ExclamationCircleIcon className="h-5 w-5 inline mr-2" />
            {error}
          </div>
        )}

        {orders.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto mb-4 bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center">
              <ExclamationCircleIcon className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">У вас пока нет заказов</h2>
            <p className="text-gray-600 mb-6">Изучите наши туры и создайте ваш первый заказ</p>
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Перейти к турам
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusDetails = getStatusDetails(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 h-48 md:h-auto md:w-64 relative">
                      <ImageWithFallback
                        src={order.tour.imageUrl}
                        alt={order.tour.title}
                        layout="fill"
                        objectFit="cover"
                        fallbackSrc="/images/image-placeholder.svg"
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {order.tour.title}
                          </h2>
                          <div className="flex items-center mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm flex items-center border ${statusDetails.color}`}>
                              {statusDetails.icon}
                              <span className="ml-1">{statusDetails.text}</span>
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm">
                            Заказ №{order.id} от {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Количество мест:</span>
                          <span className="font-medium">{order.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Цена за место:</span>
                          <span className="font-medium">{order.tour.price} {order.tour.currency}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                          <span className="text-gray-700 font-medium">Итого:</span>
                          <span className="font-bold text-blue-600">{order.totalPrice} {order.tour.currency}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-500">
                          {order.status === 'PENDING' && 
                            <p>Ваш заказ ожидает подтверждения менеджером</p>
                          }
                          {order.status === 'CONFIRMED' && 
                            <p>Ваш заказ подтвержден. Мы с вами свяжемся</p>
                          }
                          {order.status === 'CANCELLED' && 
                            <p className="text-red-600">Денежные средства вернутся на привязанный банковский счет в течение 3 рабочих дней. Приносим свои извинения.</p>
                          }
                        </div>
                        <Link 
                          href={`/tours/${order.tour.slug}`} 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Просмотреть тур
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 