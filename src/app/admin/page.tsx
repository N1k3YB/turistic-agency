"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  TrashIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Моковые данные для примера
  const mockUsers = [
    { id: "USR-001", name: "Иван Иванов", email: "ivan@example.com", role: "USER", registeredDate: "01.01.2023" },
    { id: "USR-002", name: "Менеджер", email: "manager@example.com", role: "MANAGER", registeredDate: "15.02.2023" },
    { id: "USR-003", name: "Ольга Петрова", email: "olga@example.com", role: "USER", registeredDate: "20.03.2023" },
    { id: "USR-004", name: "Администратор", email: "admin@example.com", role: "ADMIN", registeredDate: "01.12.2022" },
  ];
  
  const mockStatistics = {
    users: 350,
    orders: 1280,
    destinations: 15,
    tours: 48,
    revenue: "5 420 000 ₽",
    averageOrderValue: "42 345 ₽",
  };

  useEffect(() => {
    // Проверяем, что пользователь авторизован и имеет роль ADMIN
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
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

  // Если пользователь не админ, не показываем контент
  if (status === "authenticated" && session.user.role !== "ADMIN") {
    return null;
  }

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
                    <p className="text-3xl font-bold">{mockStatistics.users}</p>
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
                    <p className="text-3xl font-bold">{mockStatistics.orders}</p>
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
                    <p className="text-3xl font-bold">{mockStatistics.revenue}</p>
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
                    <p className="text-2xl font-bold">{mockStatistics.destinations}</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-gray-600">Туры</p>
                    </div>
                    <p className="text-2xl font-bold">{mockStatistics.tours}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    href="/admin/destinations"
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    Управление направлениями
                  </Link>
                  <Link 
                    href="/admin/tours"
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
                    <p className="text-xl font-semibold">{mockStatistics.averageOrderValue}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Новых заказов (за месяц)</p>
                    <p className="text-xl font-semibold">124</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Отмененные заказы</p>
                    <p className="text-xl font-semibold">12 (0.9%)</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/orders"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <ShoppingBagIcon className="h-4 w-4 mr-1" />
                    Просмотр заказов
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "users":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Управление пользователями</h2>
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Добавить пользователя
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата регистрации</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : 
                            user.role === "MANAGER" ? "bg-blue-100 text-blue-800" : 
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role === "ADMIN" ? "Администратор" : 
                             user.role === "MANAGER" ? "Менеджер" : "Пользователь"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.registeredDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <TrashIcon className="h-5 w-5" />
                            </button>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Панель администратора</h1>
      <p className="text-gray-600 mb-8">Управление сайтом и всеми функциями</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Боковое меню */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md">
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
                  <button 
                    className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                      activeTab === "users" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("users")}
                  >
                    <UsersIcon className="h-5 w-5 mr-3" />
                    Пользователи
                  </button>
                </li>
                <li>
                  <button 
                    className={`w-full flex items-center px-4 py-2 rounded-md text-left ${
                      activeTab === "destinations" 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab("destinations")}
                  >
                    <MapIcon className="h-5 w-5 mr-3" />
                    Направления
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