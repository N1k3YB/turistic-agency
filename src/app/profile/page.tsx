"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Моковые данные для примера
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "+7 (999) 123-45-67", // Моковые данные
    address: "г. Москва, ул. Ленина, 42", // Моковые данные
    registeredDate: new Date(), // Текущая дата как заглушка
  });
  
  // Моковые данные для истории заказов
  const mockOrders = [
    {
      id: "ORD-12345",
      date: "15.05.2023",
      destination: "Сочи",
      status: "Оплачен",
      amount: "30 000 ₽",
    },
    {
      id: "ORD-12346",
      date: "20.08.2023",
      destination: "Алтай",
      status: "Завершен",
      amount: "45 000 ₽",
    },
    {
      id: "ORD-12347",
      date: "10.01.2024",
      destination: "Золотое кольцо",
      status: "Забронирован",
      amount: "25 000 ₽",
    },
  ];

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
    <div className="container mx-auto px-4 py-8">
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
              <p className="text-sm text-gray-500">Пользователь</p>
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
        
        {/* История заказов */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">История заказов</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Направление</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`#order-${order.id}`}>{order.id}</Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.destination}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "Оплачен" ? "bg-green-100 text-green-800" : 
                          order.status === "Забронирован" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {mockOrders.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">У вас еще нет заказов</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Избранные туры</h2>
            
            <div className="text-center py-8">
              <p className="text-gray-500">У вас нет избранных туров</p>
              <Link href="/" className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                Перейти к поиску туров
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 