'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Проверка на авторизацию и роль администратора
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/profile');
    }
  }, [session, status, router]);
  
  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Если пользователь не администратор, не показываем контент
  if (status === 'authenticated' && session.user.role !== 'ADMIN') {
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
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Управление заказами</h1>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Назад к панели администратора
        </Link>
      </div>
      
      {/* Сообщение "В разработке" */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <ClockIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Раздел в разработке</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Функционал управления заказами находится в разработке и будет доступен в ближайшее время.
        </p>
        <Link 
          href="/admin" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Вернуться к панели администратора
        </Link>
      </div>
    </div>
  );
} 