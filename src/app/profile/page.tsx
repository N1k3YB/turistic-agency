"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, LockClosedIcon, ShoppingCartIcon, HeartIcon, XMarkIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { toast } from "react-hot-toast";

// Интерфейсы для данных
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
    groupSize: number;
    nextTourDate: string | null;
    slug: string;
  };
}

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
    groupSize: number;
    nextTourDate: string | null;
    slug: string;
  };
}

// Интерфейс для тикета
interface Ticket {
  id: number;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  responses: {
    id: number;
    message: string;
    isFromStaff: boolean;
    createdAt: string;
  }[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Данные для примера
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    registeredDate: new Date(), // Текущая дата как заглушка
  });

  // Состояния для заказов и избранных туров
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTour[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  
  // Упрощенный интерфейс для пользователя
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    
    if (session?.user) {
      setUserData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));

      // Загружаем пользовательские данные
      fetchUserData();

      // Загружаем заказы и избранные туры
      fetchOrders();
      fetchFavorites();
      
      // Загружаем последний тикет
      fetchLastTicket();
    }
  }, [session, status, router]);

  // Функция для загрузки дополнительных данных пользователя
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные пользователя');
      }
      
      const userData = await response.json();
      setUserData(prev => ({
        ...prev,
        phone: userData.phone || "",
        address: userData.address || "",
        registeredDate: userData.createdAt ? new Date(userData.createdAt) : new Date(),
      }));
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя:", error);
    }
  };

  // Функция для загрузки заказов
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить заказы');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Функция для загрузки избранных туров
  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const response = await fetch('/api/favorites');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить избранные туры');
      }
      
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error("Ошибка при загрузке избранных туров:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Функция для загрузки последнего тикета
  const fetchLastTicket = async () => {
    try {
      setLoadingTickets(true);
      const response = await fetch('/api/tickets');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить тикеты');
      }
      
      const tickets = await response.json();
      // Получаем самый последний тикет (первый в списке, так как они отсортированы по дате)
      if (tickets.length > 0) {
        setLastTicket(tickets[0]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке тикетов:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Даты уточняйте';
    
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Функция для определения статуса заказа
  const getOrderStatusText = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Ожидает подтверждения';
      case 'CONFIRMED': return 'Подтвержден';
      case 'CANCELLED': return 'Отменен';
      case 'COMPLETED': return 'Завершен';
      default: return 'Статус неизвестен';
    }
  };

  // Функция для определения статуса тикета
  const getTicketStatusText = (status: string) => {
    switch(status) {
      case 'OPEN': return 'Открыт';
      case 'IN_PROGRESS': return 'В обработке';
      case 'CLOSED': return 'Закрыт';
      case 'RESOLVED': return 'Решен';
      default: return 'Неизвестен';
    }
  };
  
  // Функция для получения цвета статуса тикета
  const getTicketStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Функция для изменения пароля
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    // Валидация
    if (!password) {
      setPasswordError("Введите текущий пароль");
      return;
    }
    
    if (!newPassword) {
      setPasswordError("Введите новый пароль");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Новый пароль должен содержать не менее 6 символов");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: password,
          newPassword: newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Не удалось изменить пароль');
      }
      
      // Успешное изменение пароля
      toast.success("Пароль успешно изменен");
      setShowPasswordModal(false);
      
      // Сбрасываем форму
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.message || "Произошла ошибка при изменении пароля");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Личный кабинет</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Информация о пользователе */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <UserIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">{userData.name || "Пользователь"}</h2>
              <p className="text-sm text-gray-500">{session?.user?.role === 'ADMIN' ? 'Администратор' : 
                session?.user?.role === 'MANAGER' ? 'Менеджер' : 'Пользователь'}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{userData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Адрес</p>
                  <p className="font-medium">{userData.address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Дата регистрации</p>
                  <p className="font-medium">{userData.registeredDate.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-medium transition-colors"
              >
                <LockClosedIcon className="h-4 w-4 mr-2" />
                Изменить пароль
              </button>
            </div>
          </div>
        </div>
        
        {/* Основные разделы */}
        <div className="md:col-span-2 flex flex-col space-y-6">
          {/* Раздел для администратора и менеджера */}
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && (
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
              <h2 className="text-xl font-semibold mb-4">Панель управления</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href={session?.user?.role === 'ADMIN' ? "/admin/orders" : "/manager/orders"}
                  className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Управление заказами</p>
                    <p className="text-sm text-gray-500">Просмотр и редактирование заказов пользователей</p>
                  </div>
                </Link>
                
                {session?.user?.role === 'ADMIN' ? (
                  <Link
                    href="/admin"
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center transition-colors"
                  >
                    <UserIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Панель администратора</p>
                      <p className="text-sm text-gray-500">Полный доступ к администрированию сайта</p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/manager"
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center transition-colors"
                  >
                    <UserIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Панель менеджера</p>
                      <p className="text-sm text-gray-500">Управление турами и заказами</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}
          {/* Раздел "Мои заказы" */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2 text-blue-600" />
                Мои заказы
              </h2>
              <Link 
                href="/profile/orders" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Просмотреть все
              </Link>
            </div>
            
            {loadingOrders ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
                <Link 
                  href="/" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Перейти к турам
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center">
                      <div className="h-16 w-16 mr-4 relative rounded-md overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={order.tour.imageUrl}
                          alt={order.tour.title}
                          layout="fill"
                          objectFit="cover"
                          fallbackSrc="/images/image-placeholder.svg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 truncate">{order.tour.title}</h3>
                        <div className="flex items-center text-xs mt-1">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{getOrderStatusText(order.status)}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-gray-500">{formatDate(order.tour.nextTourDate)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{order.quantity} {order.quantity === 1 ? 'место' : order.quantity < 5 ? 'места' : 'мест'}</span>
                          <span className="font-medium text-sm">{order.totalPrice} {order.tour.currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length > 3 && (
                  <div className="pt-2 text-center">
                    <Link href="/profile/orders" className="text-blue-600 hover:text-blue-800 text-sm">
                      Показать все заказы ({orders.length})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Раздел "Избранные туры" */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                Избранные туры
              </h2>
              <Link 
                href="/profile/favorites" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Просмотреть все
              </Link>
            </div>
            
            {loadingFavorites ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">У вас пока нет избранных туров</p>
                <Link 
                  href="/" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Перейти к турам
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {favorites.slice(0, 3).map((favorite) => (
                  <Link 
                    key={favorite.id}
                    href={`/tours/${favorite.tour.slug}`}
                    className="block group border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 relative">
                      <ImageWithFallback
                        src={favorite.tour.imageUrl}
                        alt={favorite.tour.title}
                        layout="fill"
                        objectFit="cover"
                        fallbackSrc="/images/image-placeholder.svg"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{favorite.tour.title}</h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">{formatDate(favorite.tour.nextTourDate)}</p>
                      <p className="mt-2 text-sm font-bold">{favorite.tour.price} {favorite.tour.currency}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {favorites.length > 3 && (
              <div className="pt-4 text-center">
                <Link href="/profile/favorites" className="text-blue-600 hover:text-blue-800 text-sm">
                  Показать все избранные туры ({favorites.length})
                </Link>
              </div>
            )}
          </div>
          
          {/* Раздел "Мои обращения" */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-purple-600" />
                Мои обращения
              </h2>
              <Link 
                href="/profile/tickets" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Просмотреть все
              </Link>
            </div>
            
            {loadingTickets ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : lastTicket ? (
              <div className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-800">{lastTicket.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTicketStatusColor(lastTicket.status)}`}>
                    {getTicketStatusText(lastTicket.status)}
                  </span>
                </div>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{lastTicket.message}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {lastTicket.id}</span>
                  <span>Создан: {formatDate(lastTicket.createdAt)}</span>
                </div>
                <div className="mt-3 text-center">
                  <Link 
                    href={`/profile/tickets/${lastTicket.id}`} 
                    className="text-blue-600 hover:text-blue-800 text-sm inline-block"
                  >
                    Перейти к обращению
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">У вас пока нет обращений</p>
                <Link 
                  href="/profile/tickets/new" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Создать обращение
                </Link>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link 
                href="/profile/tickets/new" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Создать новое обращение
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для изменения пароля */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Изменение пароля</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {passwordError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {passwordError}
              </div>
            )}
            
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Текущий пароль
                </label>
                <input
                  type="password"
                  id="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Новый пароль
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Подтвердите новый пароль
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  {isChangingPassword ? "Изменение..." : "Изменить пароль"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 