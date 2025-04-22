"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { 
  UserIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  ChartBarIcon, 
  MapIcon, 
  ShoppingBagIcon, 
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    users: 0,
    orders: 0,
    destinations: 0,
    tours: 0,
    revenue: 0,
    averageOrderValue: 0,
    newOrdersLastMonth: 0,
    cancelledOrders: 0,
    cancelledOrdersPercentage: "0"
  });
  
  // Ref для отслеживания загрузки данных
  const dataFetchedRef = useRef(false);

  // Функция для загрузки статистики (мемоизированная)
  const fetchStatistics = useCallback(async () => {
    // Проверяем, были ли данные уже загружены
    if (dataFetchedRef.current) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/statistics');
      
      if (!response.ok) {
        throw new Error('Ошибка при получении статистики');
      }
      
      const data = await response.json();
      setStatistics(data);
      
      // Отмечаем, что данные были загружены
      dataFetchedRef.current = true;
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль ADMIN
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/profile");
    } else if (status === "authenticated" && session.user.role === "ADMIN") {
      // Загружаем статистику с сервера
      fetchStatistics();
    }
  }, [session, status, router, fetchStatistics]);

  // Сбрасываем флаг загрузки данных при смене пользователя
  useEffect(() => {
    if (session?.user?.email) {
      dataFetchedRef.current = false;
    }
  }, [session?.user?.email]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Если пользователь не админ, не показываем контент
  if (status === "authenticated" && session.user.role !== "ADMIN") {
    return null;
  }

  // Форматирование валюты
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Статистика</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Пользователи</h3>
                    <p className="text-3xl font-bold">{statistics.users}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <ShoppingBagIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Заказы</h3>
                    <p className="text-3xl font-bold">{statistics.orders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Выручка</h3>
                    <p className="text-3xl font-bold">{formatCurrency(statistics.revenue)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Направления и туры</h3>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="flex items-center">
                      <MapIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-gray-600">Направления</p>
                    </div>
                    <p className="text-2xl font-bold">{statistics.destinations}</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-gray-600">Туры</p>
                    </div>
                    <p className="text-2xl font-bold">{statistics.tours}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    href="/admin/destinations"
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    Управление направлениями
                  </Link>
                  <Link 
                    href="/admin/tours"
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-1" />
                    Управление турами
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Данные по заказам</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Средний чек</p>
                    <p className="text-xl font-semibold">{formatCurrency(statistics.averageOrderValue)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Новых заказов (за месяц)</p>
                    <p className="text-xl font-semibold">{statistics.newOrdersLastMonth}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Отмененные заказы</p>
                    <p className="text-xl font-semibold">{statistics.cancelledOrders} ({statistics.cancelledOrdersPercentage}%)</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/orders"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <ShoppingBagIcon className="h-4 w-4 mr-1" />
                    Просмотр заказов
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Выберите раздел из меню слева</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Панель администратора</h1>
      <p className="text-gray-600 mb-8">Управление сайтом и всеми функциями</p>
      
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Боковое меню */}
        <div className="w-full md:w-64 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-full">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{session?.user.name || "Администратор"}</p>
                  <p className="text-xs text-gray-500">Администратор</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <button 
                    className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                      activeTab === "dashboard" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <ChartBarIcon className="h-5 w-5 mr-3" />
                    Обзор
                  </button>
                </li>
                <li>
                  <Link 
                    href="/admin/users"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <UsersIcon className="h-5 w-5 mr-3" />
                    Пользователи
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/destinations"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <MapIcon className="h-5 w-5 mr-3" />
                    Направления
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/tours"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <GlobeAltIcon className="h-5 w-5 mr-3" />
                    Туры
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/orders"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <ShoppingBagIcon className="h-5 w-5 mr-3" />
                    Заказы
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/reviews"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100"
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-3" />
                    Модерация отзывов
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Основной контент */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-lg shadow p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 