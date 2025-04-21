"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, LockClosedIcon, ShoppingCartIcon, HeartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Данные для примера
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "+7 (999) 123-45-67", // Моковые данные
    address: "г. Москва, ул. Ленина, 42", // Моковые данные
    registeredDate: new Date(), // Текущая дата как заглушка
  });
  
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
    }
  }, [session, status, router]);

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
              <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-medium transition-colors">
                <LockClosedIcon className="h-4 w-4 mr-2" />
                Изменить пароль
              </button>
            </div>
          </div>
        </div>
        
        {/* Основные разделы */}
        <div className="md:col-span-2 flex flex-col space-y-6">
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
            
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Здесь будут отображаться ваши заказы</p>
              <Link 
                href="/profile/orders" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Перейти к моим заказам
              </Link>
            </div>
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
            
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Здесь будут отображаться ваши избранные туры</p>
              <Link 
                href="/profile/favorites" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Перейти к избранным турам
              </Link>
            </div>
          </div>
          
          {/* Раздел для администратора */}
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && (
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
              <h2 className="text-xl font-semibold mb-4">Панель управления</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/orders"
                  className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Управление заказами</p>
                    <p className="text-sm text-gray-500">Просмотр и редактирование заказов пользователей</p>
                  </div>
                </Link>
                
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 