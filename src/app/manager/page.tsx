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

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Моковые данные для примера
  const mockOrders = [
    { 
      id: "ORD-12345", 
      date: "15.05.2023", 
      client: "Иван Иванов", 
      contact: "+7 (999) 123-45-67", 
      destination: "Сочи", 
      status: "Оплачен", 
      amount: "30 000 ₽" 
    },
    { 
      id: "ORD-12346", 
      date: "20.08.2023", 
      client: "Анна Петрова", 
      contact: "+7 (999) 234-56-78", 
      destination: "Алтай", 
      status: "Ожидает подтверждения", 
      amount: "45 000 ₽" 
    },
    { 
      id: "ORD-12347", 
      date: "10.01.2024", 
      client: "Сергей Сидоров", 
      contact: "+7 (999) 345-67-89", 
      destination: "Золотое кольцо", 
      status: "Забронирован", 
      amount: "25 000 ₽" 
    },
    { 
      id: "ORD-12348", 
      date: "05.02.2024", 
      client: "Ольга Кузнецова", 
      contact: "+7 (999) 456-78-90", 
      destination: "Алтай", 
      status: "Требует внимания", 
      amount: "50 000 ₽" 
    },
  ];
  
  const mockRequests = [
    {
      id: "REQ-001",
      date: "05.03.2024",
      name: "Мария Иванова",
      phone: "+7 (999) 987-65-43",
      email: "maria@example.com",
      message: "Интересует тур на Алтай, нужна информация о возможности путешествия с детьми",
      status: "Новый"
    },
    {
      id: "REQ-002",
      date: "03.03.2024",
      name: "Дмитрий Смирнов",
      phone: "+7 (999) 876-54-32",
      email: "dmitry@example.com",
      message: "Хотел бы узнать детали тура в Сочи и возможность бронирования на июнь",
      status: "В обработке"
    },
    {
      id: "REQ-003",
      date: "01.03.2024",
      name: "Екатерина Петрова",
      phone: "+7 (999) 765-43-21",
      email: "ekaterina@example.com",
      message: "Прошу связаться со мной по поводу тура по Золотому кольцу на 4 персоны",
      status: "Обработан"
    }
  ];

  const mockStatistics = {
    ordersThisMonth: 24,
    requestsThisMonth: 38,
    ordersProcessed: 18,
    ordersAwaitingAction: 6,
    averageResponseTime: "2 часа",
  };

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль MANAGER
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "MANAGER") {
      router.push("/profile");
    }
  }, [session, status, router]);

  if (status === "loading") {
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
                    <p className="text-3xl font-bold">{mockStatistics.ordersThisMonth}</p>
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
                    <p className="text-3xl font-bold">{mockStatistics.requestsThisMonth}</p>
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
                    <p className="text-3xl font-bold">{mockStatistics.averageResponseTime}</p>
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
                    <p className="text-xl font-semibold">{mockStatistics.ordersProcessed}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <p className="text-gray-600">Ожидают действий</p>
                    </div>
                    <p className="text-xl font-semibold">{mockStatistics.ordersAwaitingAction}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => setActiveTab("orders")}
                  >
                    Просмотреть все заказы
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Последние запросы</h3>
                {mockRequests.slice(0, 2).map((request) => (
                  <div key={request.id} className="mb-4 p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between">
                      <p className="font-medium">{request.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === "Новый" 
                          ? "bg-red-100 text-red-800" 
                          : request.status === "В обработке"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{request.message}</p>
                    <div className="flex mt-2 text-xs text-gray-500">
                      <p>{request.date}</p>
                      <p className="ml-2">{request.phone}</p>
                    </div>
                  </div>
                ))}
                <button 
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={() => setActiveTab("requests")}
                >
                  Все запросы
                </button>
              </div>
            </div>
          </div>
        );
      
      case "orders":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Управление заказами</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакт</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Направление</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          <Link href={`#order-${order.id}`}>{order.id}</Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.contact}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.destination}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "Оплачен" ? "bg-green-100 text-green-800" : 
                            order.status === "Забронирован" ? "bg-blue-100 text-blue-800" : 
                            order.status === "Ожидает подтверждения" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">Детали</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case "requests":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Запросы клиентов</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {mockRequests.map((request) => (
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
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Выберите раздел из меню слева</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Панель менеджера</h1>
      <p className="text-gray-600 mb-8">Управление заказами и запросами клиентов</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Боковое меню */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md">
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
                  <button 
                    className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                      activeTab === "orders" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("orders")}
                  >
                    <ShoppingBagIcon className="h-5 w-5 mr-3" />
                    Заказы
                  </button>
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
                    Запросы клиентов
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                      activeTab === "tours" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("tours")}
                  >
                    <GlobeAltIcon className="h-5 w-5 mr-3" />
                    Туры
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        {/* Основной контент */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 