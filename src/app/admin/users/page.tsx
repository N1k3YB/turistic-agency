'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircleIcon, 
  XCircleIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { UserRole } from '@prisma/client';
import UserModal from '@/components/admin/UserModal';
import ErrorNotification from '@/components/admin/ErrorNotification';

// Интерфейс для пользователя
interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  emailVerified: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string | null;
  _count: {
    reviews: number;
  };
}

// Интерфейс для данных ответа API
interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Состояния для данных и управления
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
    phone?: string;
    address?: string;
    error?: string;
  } | null>(null);
  
  // Загрузка данных
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Формируем URL с параметрами
      let url = `/api/admin/users?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedRole) url += `&role=${selectedRole}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке пользователей');
      }
      
      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
      setTotalUsers(data.pagination.totalUsers);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };
  
  // Загружаем пользователей при изменении параметров
  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'ADMIN') {
      fetchUsers();
    }
  }, [page, search, selectedRole, status, session]);
  
  // Проверка на авторизацию и роль администратора
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/profile');
    }
  }, [session, status, router]);
  
  // Функции для управления
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Сбрасываем на первую страницу
  };
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setPage(1); // Сбрасываем на первую страницу
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        role: user.role,
        phone: user.phone || '',
        address: user.address || ''
      });
      setShowUserModal(true);
    }
  };
  
  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };
  
  const handleSaveUser = async (userData: any) => {
    try {
      setError(null);
      
      // Определяем URL и метод в зависимости от типа операции
      const url = userData.id 
        ? `/api/admin/users/${userData.id}` 
        : '/api/admin/users';
      
      const method = userData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка от сервера:', errorData);
        // Передаем ошибку в модальное окно
        throw new Error(errorData.error || 'Ошибка при сохранении пользователя');
      }
      
      // Закрываем модальное окно и обновляем список
      setShowUserModal(false);
      fetchUsers();
    } catch (err: any) {
      // Обновляем состояние выбранного пользователя, добавляя туда ошибку
      setSelectedUser(prev => ({ ...prev, error: err.message }));
      // Не закрываем модальное окно при ошибке
    }
  };
  
  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setError(null);
      
      const response = await fetch(`/api/admin/users/${userToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении пользователя');
      }
      
      // Закрываем модальное окно и обновляем список
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при удалении пользователя');
    }
  };
  
  // Проверка на наличие ошибок
  const hasErrors = error !== null;
  
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
      {/* Глобальное уведомление об ошибке */}
      <ErrorNotification error={error} onDismiss={() => setError(null)} />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Управление пользователями</h1>
        <Link href="/admin" className="text-blue-600 hover:text-blue-800">
          Назад к панели администратора
        </Link>
      </div>
      
      {/* Панель фильтров и поиска */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={handleSearchChange}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div>
            <select
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="">Все роли</option>
              <option value="USER">Пользователи</option>
              <option value="MANAGER">Менеджеры</option>
              <option value="ADMIN">Администраторы</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={handleCreateUser}
              disabled={hasErrors || loading}
              className={`w-full md:w-auto flex items-center justify-center px-4 py-2 rounded-lg
                ${hasErrors || loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                }`}
            >
              <PlusCircleIcon className="h-5 w-5 mr-1" />
              Добавить пользователя
            </button>
          </div>
        </div>
      </div>
      
      {/* Таблица пользователей */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Подтверждение</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата регистрации</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Отзывы</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Пользователи не найдены
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || 'Пользователь'}
                            className="h-8 w-8 rounded-full mr-3"
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Неизвестный пользователь'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || '-'}
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.emailVerified ? 'Подтвержден' : 'Не подтвержден'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count.reviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => handleEditUser(user.id)}
                          aria-label="Редактировать пользователя"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={() => confirmDeleteUser(user.id)}
                          aria-label="Удалить пользователя"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Пагинация */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Показано {users.length} из {totalUsers} пользователей
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`flex items-center px-3 py-1 rounded-md cursor-pointer ${
                page === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Назад
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                .map((p, i, arr) => (
                  <Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-3 py-1 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 rounded-md cursor-pointer ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {p}
                    </button>
                  </Fragment>
                ))}
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`flex items-center px-3 py-1 rounded-md cursor-pointer ${
                page === totalPages 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Далее
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-lg p-6 z-10 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-700 mb-6">Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                onClick={handleDeleteUser}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно пользователя */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
} 