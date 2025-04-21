import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationCircleIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Destination {
  id: number;
  name: string;
  slug: string;
}

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: {
    id?: number;
    title?: string;
    slug?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    shortDescription?: string;
    fullDescription?: string;
    inclusions?: string;
    exclusions?: string;
    itinerary?: string;
    imageUrls?: string[];
    destinationId?: number;
    duration?: number;
    groupSize?: number;
    nextTourDate?: string;
    error?: string;
  } | null;
  onSave: (tourData: {
    id?: number;
    title: string;
    slug: string;
    price: number;
    currency: string;
    imageUrl: string;
    shortDescription: string;
    fullDescription: string;
    inclusions: string;
    exclusions: string;
    itinerary: string;
    imageUrls: string[];
    destinationId: number;
    duration: number;
    groupSize: number;
    nextTourDate?: string;
  }) => void;
}

export default function TourModal({ isOpen, onClose, tour, onSave }: TourModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [currency, setCurrency] = useState('RUB');
  const [imageUrl, setImageUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [destinationId, setDestinationId] = useState<number | string>('');
  const [duration, setDuration] = useState<number | string>(7);
  const [groupSize, setGroupSize] = useState<number | string>(10);
  const [nextTourDate, setNextTourDate] = useState<string>('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Загрузка списка направлений
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/destinations?limit=100');
        if (response.ok) {
          const data = await response.json();
          setDestinations(data.destinations);
        }
      } catch (err) {
        console.error('Ошибка при загрузке направлений:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen) {
      fetchDestinations();
    }
  }, [isOpen]);
  
  // Сбрасываем форму при открытии/закрытии или изменении тура
  useEffect(() => {
    if (tour) {
      setTitle(tour.title || '');
      setSlug(tour.slug || '');
      setPrice(tour.price || '');
      setCurrency(tour.currency || 'RUB');
      setImageUrl(tour.imageUrl || '');
      setShortDescription(tour.shortDescription || '');
      setFullDescription(tour.fullDescription || '');
      setInclusions(tour.inclusions || '');
      setExclusions(tour.exclusions || '');
      setItinerary(tour.itinerary || '');
      setImageUrls(tour.imageUrls || []);
      setDestinationId(tour.destinationId || '');
      setDuration(tour.duration || 7);
      setGroupSize(tour.groupSize || 10);
      setNextTourDate(tour.nextTourDate || '');
      
      // Устанавливаем ошибку из пропсов, если она есть
      if (tour.error) {
        parseApiError(tour.error);
      } else {
        setErrors({});
      }
    } else {
      setTitle('');
      setSlug('');
      setPrice('');
      setCurrency('RUB');
      setImageUrl('');
      setShortDescription('');
      setFullDescription('');
      setInclusions('');
      setExclusions('');
      setItinerary('');
      setImageUrls([]);
      setDestinationId('');
      setDuration(7);
      setGroupSize(10);
      setNextTourDate('');
      setErrors({});
    }
    setNewImageUrl('');
  }, [tour, isOpen]);
  
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
            case 'title':
              newErrors.title = Array.isArray(value) ? value[0] : 'Некорректное название тура';
              break;
            case 'slug':
              newErrors.slug = Array.isArray(value) ? value[0] : 'Некорректный URL-идентификатор';
              break;
            case 'price':
              newErrors.price = Array.isArray(value) ? value[0] : 'Некорректная цена';
              break;
            case 'currency':
              newErrors.currency = Array.isArray(value) ? value[0] : 'Некорректная валюта';
              break;
            case 'imageUrl':
              newErrors.imageUrl = Array.isArray(value) ? value[0] : 'Некорректный URL изображения';
              break;
            case 'shortDescription':
              newErrors.shortDescription = Array.isArray(value) ? value[0] : 'Некорректное краткое описание';
              break;
            case 'fullDescription':
              newErrors.fullDescription = Array.isArray(value) ? value[0] : 'Некорректное полное описание';
              break;
            case 'destinationId':
              newErrors.destinationId = Array.isArray(value) ? value[0] : 'Некорректное направление';
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
  const validateTitle = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо указать название тура';
    }
    if (value.trim().length < 3) {
      return 'Название должно содержать минимум 3 символа';
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
  
  const validatePrice = (value: number | string) => {
    if (!value) {
      return 'Необходимо указать цену';
    }
    
    const numericPrice = Number(value);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return 'Цена должна быть положительным числом';
    }
    return '';
  };
  
  const validateImageUrl = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо указать URL основного изображения';
    }
    return '';
  };
  
  const validateShortDescription = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо добавить краткое описание';
    }
    if (value.trim().length < 10) {
      return 'Краткое описание должно содержать минимум 10 символов';
    }
    return '';
  };
  
  const validateFullDescription = (value: string) => {
    if (!value.trim()) {
      return 'Необходимо добавить полное описание';
    }
    if (value.trim().length < 50) {
      return 'Полное описание должно содержать минимум 50 символов';
    }
    return '';
  };
  
  const validateDestinationId = (value: number | string) => {
    if (!value) {
      return 'Необходимо выбрать направление';
    }
    
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      return 'Некорректный ID направления';
    }
    return '';
  };
  
  // Добавляем валидацию для новых полей
  const validateDuration = (value: number | string) => {
    if (!value) {
      return 'Необходимо указать длительность тура';
    }
    
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue <= 0 || !Number.isInteger(numericValue)) {
      return 'Длительность должна быть положительным целым числом';
    }
    return '';
  };
  
  const validateGroupSize = (value: number | string) => {
    if (!value) {
      return 'Необходимо указать размер группы';
    }
    
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue <= 0 || !Number.isInteger(numericValue)) {
      return 'Размер группы должен быть положительным целым числом';
    }
    return '';
  };
  
  const validateNextTourDate = (value: string) => {
    if (value && isNaN(Date.parse(value))) {
      return 'Некорректный формат даты';
    }
    return '';
  };
  
  // Автоматическое создание слага при изменении названия
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Валидация поля title
    const titleError = validateTitle(newTitle);
    setErrors(prev => ({
      ...prev,
      title: titleError
    }));
    
    // Генерация слага только если это новый тур или слаг еще не был изменен вручную
    if (!tour?.id || slug === tour.slug) {
      const newSlug = newTitle
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
  
  // Обработчики изменений с валидацией
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    setSlug(newSlug);
    
    const slugError = validateSlug(newSlug);
    setErrors(prev => ({
      ...prev,
      slug: slugError
    }));
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    
    const priceError = validatePrice(newPrice);
    setErrors(prev => ({
      ...prev,
      price: priceError
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
  
  const handleShortDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newShortDescription = e.target.value;
    setShortDescription(newShortDescription);
    
    const shortDescriptionError = validateShortDescription(newShortDescription);
    setErrors(prev => ({
      ...prev,
      shortDescription: shortDescriptionError
    }));
  };
  
  const handleFullDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newFullDescription = e.target.value;
    setFullDescription(newFullDescription);
    
    const fullDescriptionError = validateFullDescription(newFullDescription);
    setErrors(prev => ({
      ...prev,
      fullDescription: fullDescriptionError
    }));
  };
  
  const handleDestinationIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDestinationId = e.target.value;
    setDestinationId(newDestinationId);
    
    const destinationIdError = validateDestinationId(newDestinationId);
    setErrors(prev => ({
      ...prev,
      destinationId: destinationIdError
    }));
  };
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDuration(value);
    
    const validationError = validateDuration(value);
    if (validationError) {
      setErrors(prev => ({ ...prev, duration: validationError }));
    } else {
      setErrors(prev => {
        const { duration, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const handleGroupSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGroupSize(value);
    
    const validationError = validateGroupSize(value);
    if (validationError) {
      setErrors(prev => ({ ...prev, groupSize: validationError }));
    } else {
      setErrors(prev => {
        const { groupSize, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const handleNextTourDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNextTourDate(value);
    
    const validationError = validateNextTourDate(value);
    if (validationError) {
      setErrors(prev => ({ ...prev, nextTourDate: validationError }));
    } else {
      setErrors(prev => {
        const { nextTourDate, ...rest } = prev;
        return rest;
      });
    }
  };
  
  // Добавление изображения в галерею
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };
  
  // Удаление изображения из галереи
  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Выполнение всех валидаций
    const titleError = validateTitle(title);
    const slugError = validateSlug(slug);
    const priceError = validatePrice(price);
    const imageUrlError = validateImageUrl(imageUrl);
    const shortDescriptionError = validateShortDescription(shortDescription);
    const fullDescriptionError = validateFullDescription(fullDescription);
    const destinationIdError = validateDestinationId(destinationId);
    const durationError = validateDuration(duration);
    const groupSizeError = validateGroupSize(groupSize);
    const nextTourDateError = validateNextTourDate(nextTourDate);
    
    // Обновляем состояние ошибок
    const newErrors: Record<string, string> = {};
    if (titleError) newErrors.title = titleError;
    if (slugError) newErrors.slug = slugError;
    if (priceError) newErrors.price = priceError;
    if (imageUrlError) newErrors.imageUrl = imageUrlError;
    if (shortDescriptionError) newErrors.shortDescription = shortDescriptionError;
    if (fullDescriptionError) newErrors.fullDescription = fullDescriptionError;
    if (destinationIdError) newErrors.destinationId = destinationIdError;
    if (durationError) newErrors.duration = durationError;
    if (groupSizeError) newErrors.groupSize = groupSizeError;
    if (nextTourDateError) newErrors.nextTourDate = nextTourDateError;
    
    setErrors(newErrors);
    
    // Если есть ошибки, не отправляем форму
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Преобразование строковых значений в числовые
    const numericPrice = Number(price);
    const numericDuration = Number(duration);
    const numericGroupSize = Number(groupSize);
    
    // Формирование данных
    const destinationIdNum = Number(destinationId);
    
    // Формирование данных
    const tourData = {
      ...(tour?.id && { id: tour.id }),
      title: title.trim(),
      slug: slug.trim(),
      price: numericPrice,
      currency,
      imageUrl: imageUrl.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      inclusions: inclusions.trim(),
      exclusions: exclusions.trim(),
      itinerary: itinerary.trim(),
      imageUrls,
      destinationId: destinationIdNum,
      duration: numericDuration,
      groupSize: numericGroupSize,
      nextTourDate: nextTourDate || undefined
    };
    
    console.log('Отправка данных:', tourData);
    onSave(tourData);
  };
  
  // Проверка на наличие ошибок для блокировки кнопки сохранения
  const isSaveDisabled = Object.values(errors).some(error => error !== '') || loading;
  
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  {tour?.id ? 'Редактирование тура' : 'Создание тура'}
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
                          <h4 className="font-semibold text-sm mb-1">Ошибка при сохранении тура</h4>
                          <p className="text-sm">{errors.general}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Название тура
                      </label>
                      <input
                        type="text"
                        id="title"
                        className={`w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                        value={title}
                        onChange={handleTitleChange}
                        required
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>
                    
                    <div>
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
                          Используется в URL: /tour/{slug}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Цена
                      </label>
                      <input
                        type="number"
                        id="price"
                        min="0"
                        step="0.01"
                        className={`w-full rounded-md border ${errors.price ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                        value={price}
                        onChange={handlePriceChange}
                        required
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                        Валюта
                      </label>
                      <select
                        id="currency"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        required
                      >
                        <option value="RUB">RUB - Российский рубль</option>
                        <option value="USD">USD - Доллар США</option>
                        <option value="EUR">EUR - Евро</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="destinationId" className="block text-sm font-medium text-gray-700 mb-1">
                        Направление
                      </label>
                      <select
                        id="destinationId"
                        className={`w-full rounded-md border ${errors.destinationId ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                        value={destinationId}
                        onChange={handleDestinationIdChange}
                        required
                      >
                        <option value="">Выберите направление</option>
                        {destinations.map((destination) => (
                          <option key={destination.id} value={destination.id}>
                            {destination.name}
                          </option>
                        ))}
                      </select>
                      {errors.destinationId && (
                        <p className="mt-1 text-sm text-red-600">{errors.destinationId}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        URL основного изображения
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
                  </div>
                  
                  {imageUrl && (
                    <div className="mt-2 mb-4">
                      <p className="text-sm text-gray-500 mb-1">Предпросмотр основного изображения:</p>
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
                  
                  <div className="mt-4">
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Краткое описание
                    </label>
                    <textarea
                      id="shortDescription"
                      rows={2}
                      className={`w-full rounded-md border ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={shortDescription}
                      onChange={handleShortDescriptionChange}
                      required
                    />
                    {errors.shortDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Полное описание
                    </label>
                    <textarea
                      id="fullDescription"
                      rows={4}
                      className={`w-full rounded-md border ${errors.fullDescription ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                      value={fullDescription}
                      onChange={handleFullDescriptionChange}
                      required
                    />
                    {errors.fullDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullDescription}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="inclusions" className="block text-sm font-medium text-gray-700 mb-1">
                        Что включено
                      </label>
                      <textarea
                        id="inclusions"
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        value={inclusions}
                        onChange={(e) => setInclusions(e.target.value)}
                        placeholder="- Проживание&#10;- Питание&#10;- Экскурсии"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="exclusions" className="block text-sm font-medium text-gray-700 mb-1">
                        Что не включено
                      </label>
                      <textarea
                        id="exclusions"
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        value={exclusions}
                        onChange={(e) => setExclusions(e.target.value)}
                        placeholder="- Авиабилеты&#10;- Визы&#10;- Страховка"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="itinerary" className="block text-sm font-medium text-gray-700 mb-1">
                      Маршрут (программа тура)
                    </label>
                    <textarea
                      id="itinerary"
                      rows={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      value={itinerary}
                      onChange={(e) => setItinerary(e.target.value)}
                      placeholder="День 1: Прибытие&#10;День 2: Экскурсия&#10;День 3: Отъезд"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дополнительные изображения
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Введите URL изображения"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="bg-blue-600 text-white rounded-r-md px-3 hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {imageUrls.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Изображение ${index + 1}`} 
                              className="h-24 w-full object-cover rounded-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/300x150?text=Ошибка';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Удалить изображение"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Длительность тура (дни)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        min="1"
                        step="1"
                        className={`w-full rounded-md border ${errors.duration ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                        value={duration}
                        onChange={handleDurationChange}
                        required
                      />
                      {errors.duration && (
                        <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-1">
                        Размер группы (человек)
                      </label>
                      <input
                        type="number"
                        id="groupSize"
                        min="1"
                        step="1"
                        className={`w-full rounded-md border ${errors.groupSize ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                        value={groupSize}
                        onChange={handleGroupSizeChange}
                        required
                      />
                      {errors.groupSize && (
                        <p className="mt-1 text-sm text-red-600">{errors.groupSize}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="nextTourDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Дата ближайшего тура
                      </label>
                      <input
                        type="date"
                        id="nextTourDate"
                        className={`w-full rounded-md border ${errors.nextTourDate ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                        value={nextTourDate}
                        onChange={handleNextTourDateChange}
                      />
                      {errors.nextTourDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.nextTourDate}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Оставьте пустым, если дата не определена
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
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
                      {tour?.id ? 'Сохранить' : 'Создать'}
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