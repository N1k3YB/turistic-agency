'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
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
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function ManagerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);

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

      // Загружаем заказы
      fetchOrders();
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить заказы');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
      setError('Произошла ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId: number, newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    try {
      setProcessingOrderId(orderId);
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось обновить статус заказа');
      }
      
      // Обновляем список заказов
      const updatedOrder = await response.json();
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Статус заказа изменен на "${getStatusName(newStatus)}"`);
    } catch (error: any) {
      console.error("Ошибка при обновлении статуса:", error);
      toast.error(error.message || 'Произошла ошибка');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Возвращает название статуса на русском
  const getStatusName = (status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    switch(status) {
      case 'PENDING': return 'Ожидает подтверждения';
      case 'CONFIRMED': return 'Подтвержден';
      case 'CANCELLED': return 'Отменен';
      case 'COMPLETED': return 'Завершен';
      default: return 'Неизвестный статус';
    }
  };

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
            <Link href="/manager" className="text-blue-600 hover:text-blue-800 flex items-center mb-2">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Вернуться в панель менеджера
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Управление заказами</h1>
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Заказы не найдены</h2>
            <p className="text-gray-600 mb-6">На данный момент в системе нет заказов</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Клиент</h3>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{order.user.name || 'Не указано'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{order.contactEmail}</span>
                            </div>
                            {order.contactPhone && (
                              <div className="flex items-center text-sm">
                                <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{order.contactPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Детали заказа</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Количество мест:</span>
                              <span className="font-medium">{order.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Цена за место:</span>
                              <span className="font-medium">{order.tour.price} {order.tour.currency}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                              <span className="text-gray-700 font-medium">Итого:</span>
                              <span className="font-bold text-blue-600">{order.totalPrice} {order.tour.currency}</span>
                            </div>
                            {order.status === 'CANCELLED' && (
                              <div className="mt-2 text-red-600 text-xs">
                                Денежные средства вернутся на привязанный банковский счет в течение 3 рабочих дней. Приносим свои извинения.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                              disabled={processingOrderId === order.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Подтвердить
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              disabled={processingOrderId === order.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Отменить
                            </button>
                          </>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                              disabled={processingOrderId === order.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Завершить
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              disabled={processingOrderId === order.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Отменить
                            </button>
                          </>
                        )}
                        {processingOrderId === order.id && (
                          <span className="inline-flex items-center text-blue-600">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Обновление...
                          </span>
                        )}
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