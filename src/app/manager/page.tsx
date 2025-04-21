"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  UserIcon, 
  GlobeAltIcon, 
  ChartBarIcon, 
  MapIcon, 
  ShoppingBagIcon, 
  ChatBubbleLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

// Определяем тип для запроса клиента
interface ClientRequest {
  id: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
}

// Определяем тип для статистики
interface ManagerStatistics {
  ordersThisMonth: number;
  requestsThisMonth: number;
  ordersProcessed: number;
  ordersAwaitingAction: number;
  averageResponseTime: string;
  recentRequests: ClientRequest[];
}

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<ManagerStatistics>({
    ordersThisMonth: 0,
    requestsThisMonth: 0,
    ordersProcessed: 0,
    ordersAwaitingAction: 0,
    averageResponseTime: "",
    recentRequests: []
  });
  
  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль MANAGER
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "MANAGER") {
      router.push("/profile");
    } else if (status === "authenticated" && session.user.role === "MANAGER") {
      // Загружаем статистику с сервера
      fetchStatistics();
    }
  }, [session, status, router]);

  // Функция для загрузки статистики
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/manager/statistics');
      
      if (!response.ok) {
        throw new Error('Ошибка при получении статистики');
      }
      
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Если пользователь не менеджер, не показываем контент
  if (status === "authenticated" && session.user.role !== "MANAGER") {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Обзор</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Заказы в этом месяце</h3>
                    <p className="text-3xl font-bold">{statistics.ordersThisMonth}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <ChatBubbleLeftIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Запросы</h3>
                    <p className="text-3xl font-bold">{statistics.requestsThisMonth}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Среднее время ответа</h3>
                    <p className="text-3xl font-bold">{statistics.averageResponseTime}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Статус заказов</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-gray-600">Обработано заказов</p>
                    </div>
                    <p className="text-xl font-semibold">{statistics.ordersProcessed}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <p className="text-gray-600">Ожидают действий</p>
                    </div>
                    <p className="text-xl font-semibold">{statistics.ordersAwaitingAction}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/manager/orders"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Просмотреть все заказы
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
                <div className="space-y-3">
                  <Link 
                    href="/manager/orders"
                    className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <ShoppingBagIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-gray-700">Управление заказами</span>
                    </div>
                    <span className="text-blue-600">→</span>
                  </Link>
                  
                  <Link 
                    href="/manager/tours"
                    className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-gray-700">Управление турами</span>
                    </div>
                    <span className="text-blue-600">→</span>
                  </Link>
                  
                  <Link 
                    href="/manager/destinations"
                    className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <MapIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-gray-700">Управление направлениями</span>
                    </div>
                    <span className="text-blue-600">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "orders":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Управление заказами</h2>
              <Link
                href="/manager/orders"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Перейти в раздел заказов
              </Link>
            </div>
          </div>
        );
      
      case "requests":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Запросы клиентов</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {statistics.recentRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex flex-wrap justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-medium">{request.name}</h3>
                      <p className="text-sm text-gray-500">{request.date}</p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      request.status === "Новый" 
                        ? "bg-red-100 text-red-800" 
                        : request.status === "В обработке"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{request.message}</p>
                  
                  <div className="border-t pt-3 flex flex-col space-y-2">
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{request.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{request.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Обработан
                    </button>
                    <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      В обработке
                    </button>
                    <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case "destinations":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Управление направлениями</h2>
              <Link
                href="/manager/destinations"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Перейти в раздел направлений
              </Link>
            </div>
          </div>
        );

      case "tours":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Управление турами</h2>
              <Link
                href="/manager/tours"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Перейти в раздел туров
              </Link>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Панель менеджера</h1>
      <p className="text-gray-600 mb-8">Управление заказами и обращениями клиентов</p>
      
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Боковое меню */}
        <div className="w-full md:w-64 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{session?.user.name || "Менеджер"}</p>
                  <p className="text-xs text-gray-500">Менеджер</p>
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
                    href="/manager/orders"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100"
                  >
                    <ShoppingBagIcon className="h-5 w-5 mr-3" />
                    Заказы
                  </Link>
                </li>
                <li>
                  <button 
                    className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                      activeTab === "requests" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("requests")}
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-3" />
                    Обращения клиентов
                  </button>
                </li>
                <li>
                  <Link 
                    href="/manager/destinations"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100"
                  >
                    <MapIcon className="h-5 w-5 mr-3" />
                    Направления
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/manager/tours"
                    className="w-full flex items-center px-4 py-2 rounded-md text-left text-gray-700 hover:bg-gray-100"
                  >
                    <GlobeAltIcon className="h-5 w-5 mr-3" />
                    Туры
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