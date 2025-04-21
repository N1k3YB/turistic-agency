import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    id?: number;
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    error?: string;
  } | null;
  onSave: (destinationData: {
    id?: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
  }) => void;
}

export default function DestinationModal({ isOpen, onClose, destination, onSave }: DestinationModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Сбрасываем форму при открытии/закрытии или изменении направления
  useEffect(() => {
    if (destination) {
      setName(destination.name || '');
      setSlug(destination.slug || '');
      setDescription(destination.description || '');
      setImageUrl(destination.imageUrl || '');
      
      // Устанавливаем ошибку из пропсов, если она есть
      if (destination.error) {
        parseApiError(destination.error);
      } else {
        setErrors({});
      }
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('');
      setErrors({});
    }
  }, [destination, isOpen]);
  
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
              newErrors.name = Array.isArray(value) ? value[0] : 'Некорректное название';
              break;
            case 'slug':
              newErrors.slug = Array.isArray(value) ? value[0] : 'Некорректный URL-идентификатор';
              break;
            case 'description':
              newErrors.description = Array.isArray(value) ? value[0] : 'Некорректное описание';
              break;
            case 'imageUrl':
              newErrors.imageUrl = Array.isArray(value) ? value[0] : 'Некорректный URL изображения';
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
      return 'Необходимо указать название направления';
    }
    if (value.trim().length < 2) {
      return 'Название должно содержать минимум 2 символа';
    }
    return '';
  };
  
  const validateSlug = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо указать URL-идентификатор';
    }
    
    // Валидация слага (только буквы, цифры, дефисы)
    const slugRegex = /^[a-z0-9а-яё-]+$/i;
    if (!slugRegex.test(value)) {
      return 'URL-идентификатор может содержать только буквы, цифры и дефисы';
    }
    return '';
  };
  
  const validateDescription = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо добавить описание';
    }
    if (value.trim().length < 10) {
      return 'Описание должно содержать минимум 10 символов';
    }
    return '';
  };
  
  const validateImageUrl = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо указать URL изображения';
    }
    return '';
  };
  
  // Обновление названия и автоматическая генерация слага
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Валидация поля name
    const nameError = validateName(newName);
    setErrors(prev => ({
      ...prev,
      name: nameError
    }));
    
    // Генерация слага только если это новое направление или слаг еще не был изменен вручную
    if (!destination?.id || slug === destination.slug) {
      const newSlug = newName
        .toLowerCase()
        .replace(/[^\wа-яё]/gi, '-') // Заменяем не-буквенные и не-цифровые символы на дефис
        .replace(/[-]+/g, '-') // Заменяем множественные дефисы на один
        .replace(/^-+|-+$/g, ''); // Удаляем дефисы в начале и конце
      
      setSlug(newSlug);
      
      // Валидация автоматически сгенерированного слага
      const slugError = validateSlug(newSlug);
      setErrors(prev => ({
        ...prev,
        slug: slugError
      }));
    }
  };
  
  // Обработчики изменения с валидацией
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    setSlug(newSlug);
    
    const slugError = validateSlug(newSlug);
    setErrors(prev => ({
      ...prev,
      slug: slugError
    }));
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    
    const descriptionError = validateDescription(newDescription);
    setErrors(prev => ({
      ...prev,
      description: descriptionError
    }));
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImageUrl = e.target.value;
    setImageUrl(newImageUrl);
    
    const imageUrlError = validateImageUrl(newImageUrl);
    setErrors(prev => ({
      ...prev,
      imageUrl: imageUrlError
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Полная валидация всех полей перед отправкой
    const nameError = validateName(name);
    const slugError = validateSlug(slug);
    const descriptionError = validateDescription(description);
    const imageUrlError = validateImageUrl(imageUrl);
    
    const newErrors = {
      name: nameError,
      slug: slugError,
      description: descriptionError,
      imageUrl: imageUrlError
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
    const destinationData = {
      ...(destination?.id && { id: destination.id }),
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim()
    };
    
    onSave(destinationData);
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
                  {destination?.id ? 'Редактирование направления' : 'Создание направления'}
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
                          <h4 className="font-semibold text-sm mb-1">Ошибка при сохранении направления</h4>
                          <p className="text-sm">{errors.general}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Название направления
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
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      URL-идентификатор
                    </label>
                    <input
                      type="text"
                      id="slug"
                      className={`w-full rounded-md border ${errors.slug ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={slug}
                      onChange={handleSlugChange}
                      required
                    />
                    {errors.slug ? (
                      <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Используется в URL: /destination/{slug}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      className={`w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={description}
                      onChange={handleDescriptionChange}
                      required
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      URL изображения
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      className={`w-full rounded-md border ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={imageUrl}
                      onChange={handleImageUrlChange}
                      required
                    />
                    {errors.imageUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
                    )}
                  </div>
                  
                  {imageUrl && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-1">Предпросмотр изображения:</p>
                      <img 
                        src={imageUrl} 
                        alt="Предпросмотр" 
                        className="h-32 w-full object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x150?text=Ошибка+загрузки+изображения';
                        }}
                      />
                    </div>
                  )}
                  
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
                      {destination?.id ? 'Сохранить' : 'Создать'}
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