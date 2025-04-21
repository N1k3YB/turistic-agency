import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@prisma/client';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
    phone?: string;
    address?: string;
    error?: string;
  } | null;
  onSave: (userData: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
    address?: string;
  }) => void;
}

export default function UserModal({ isOpen, onClose, user, onSave }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Сбрасываем форму при открытии/закрытии или изменении пользователя
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRole(user.role || UserRole.USER);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      
      // Устанавливаем ошибку из пропсов, если она есть
      if (user.error) {
        parseApiError(user.error);
      } else {
        setErrors({});
      }
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole(UserRole.USER);
      setPhone('');
      setAddress('');
      setErrors({});
    }
  }, [user, isOpen]);
  
  // Парсинг ошибки API и преобразование в объект ошибок по полям
  const parseApiError = (error: string) => {
    // Проверяем, является ли ошибка объектом с ошибками валидации
    try {
      const errorObj = JSON.parse(error);
      if (typeof errorObj === 'object' && errorObj !== null) {
        const newErrors: Record<string, string> = {};
        
        // Формируем понятные сообщения об ошибках
        Object.entries(errorObj).forEach(([key, value]) => {
          switch (key) {
            case 'name':
              newErrors.name = Array.isArray(value) ? value[0] : 'Некорректное имя';
              break;
            case 'email':
              newErrors.email = Array.isArray(value) ? value[0] : 'Некорректный email';
              break;
            case 'password':
              newErrors.password = Array.isArray(value) ? value[0] : 'Некорректный пароль';
              break;
            case 'role':
              newErrors.role = Array.isArray(value) ? value[0] : 'Некорректная роль';
              break;
            default:
              // Для общих ошибок или неизвестных полей
              newErrors.general = Array.isArray(value) ? value[0] : String(value);
          }
        });
        
        setErrors(newErrors);
        return;
      }
    } catch (e) {
      // Если ошибка не в формате JSON, используем как общую ошибку
    }
    
    // Если не удалось распарсить или это просто строка
    setErrors({ general: error });
  };
  
  // Валидация отдельных полей
  const validateName = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо указать имя';
    }
    return '';
  };
  
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо указать email';
    }
    
    // Валидация email с помощью регулярного выражения
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Некорректный формат email';
    }
    return '';
  };
  
  const validatePassword = (value: string) => {
    // Если это создание нового пользователя (нет id)
    if (!user?.id && !value.trim()) {
      return 'Необходимо указать пароль';
    }
    
    // Если пароль был введен (для нового пользователя или изменения существующего)
    if (value.trim() && value.length < 6) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    
    return '';
  };
  
  // Обработчики изменения полей
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setErrors((prev) => ({ ...prev, name: validateName(value) }));
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    // Валидируем пароль только если он не пустой или если это новый пользователь
    if (value.length > 0 || !user?.id) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    } else {
      // Если пароль пустой и это существующий пользователь, убираем ошибку
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  };
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Полная валидация всех полей перед отправкой
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError
    };
    
    // Фильтруем пустые ошибки
    const validationErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    );
    
    setErrors(validationErrors);
    
    // Проверяем наличие ошибок
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    
    // Если ошибок нет, отправляем данные
    const userData = {
      ...(user?.id && { id: user.id }),
      name: name.trim(),
      email: email.trim(),
      role,
      ...(password && { password: password.trim() }),
      phone: phone.trim(),
      address: address.trim()
    };
    
    onSave(userData);
  };
  
  // Проверка на наличие ошибок для блокировки кнопки сохранения
  const isSaveDisabled = Object.values(errors).some(error => error !== '');
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {user?.id ? 'Редактирование пользователя' : 'Создание пользователя'}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 cursor-pointer"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  {errors.general && (
                    <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">
                      <div className="flex items-start">
                        <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Ошибка при сохранении пользователя</h4>
                          <p className="text-sm">{errors.general}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={name}
                      onChange={handleNameChange}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Пароль {user?.id && '(оставьте пустым, чтобы не менять)'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      className={`w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={password}
                      onChange={handlePasswordChange}
                      {...(!user?.id && { required: true })}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Роль
                    </label>
                    <select
                      id="role"
                      className={`w-full rounded-md border ${errors.role ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={role}
                      onChange={handleRoleChange}
                      required
                    >
                      <option value="USER">Пользователь</option>
                      <option value="MANAGER">Менеджер</option>
                      <option value="ADMIN">Администратор</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      value={phone}
                      onChange={handlePhoneChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес
                    </label>
                    <input
                      type="text"
                      id="address"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      value={address}
                      onChange={handleAddressChange}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                      onClick={onClose}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSaveDisabled}
                      className={`px-4 py-2 rounded-md
                        ${isSaveDisabled
                          ? "bg-gray-400 text-white cursor-not-allowed" 
                          : "bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                        }`}
                    >
                      {user?.id ? 'Сохранить' : 'Создать'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 