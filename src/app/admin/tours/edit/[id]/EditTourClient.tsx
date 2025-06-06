'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Типы данных
interface Destination {
  id: number;
  name: string;
}

interface TourData {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  inclusions: string | null;
  exclusions: string | null;
  itinerary: string | null;
  imageUrls: string[];
  destinationId: number;
  destination?: {
    id: number;
    name: string;
  };
  duration: number;
  groupSize: number;
  availableSeats: number;
  nextTourDate: string | null;
  _count?: {
    orders: number;
  };
}

export function EditTourClient({ tourId }: { tourId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Состояния для формы
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('RUB');
  const [imageUrl, setImageUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [duration, setDuration] = useState('7');
  const [groupSize, setGroupSize] = useState('10');
  const [availableSeats, setAvailableSeats] = useState('10');
  const [nextTourDate, setNextTourDate] = useState('');
  
  // Состояния для дополнительных данных
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<TourData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Ref для отслеживания загрузки данных
  const dataFetchedRef = useRef(false);
  const destinationsLoadedRef = useRef(false);
  
  // Проверка аутентификации и роли пользователя
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (userRole !== 'ADMIN') {
        router.push('/');
        return;
      }
      
      // Загружаем список направлений
      fetchDestinations();
      // Загружаем данные тура
      fetchTourData();
    }
  }, [status, session, router]);
  
  // Сбрасываем флаг загрузки данных при смене пользователя или идентификатора тура
  useEffect(() => {
    if (session?.user?.email || tourId) {
      dataFetchedRef.current = false;
      destinationsLoadedRef.current = false;
    }
  }, [session?.user?.email, tourId]);
  
  // Загрузка списка направлений
  const fetchDestinations = useCallback(async () => {
    // Проверяем, были ли направления уже загружены
    if (destinationsLoadedRef.current) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/destinations');
      if (!response.ok) {
        throw new Error('Не удалось загрузить направления');
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.destinations)) {
        setDestinations(data.destinations);
      } else if (data && Array.isArray(data)) {
        setDestinations(data);
      } else {
        console.error('Неожиданный формат данных:', data);
      }
      
      // Отмечаем, что направления были загружены
      destinationsLoadedRef.current = true;
    } catch (error) {
      console.error('Ошибка при загрузке направлений:', error);
      toast.error('Не удалось загрузить список направлений');
    }
  }, []);
  
  // Загрузка данных тура
  const fetchTourData = useCallback(async () => {
    // Проверяем, были ли данные уже загружены
    if (dataFetchedRef.current) {
      setLoadingData(false);
      return;
    }
    
    try {
      setLoadingData(true);
      setLoadError('');
      
      const response = await fetch(`/api/admin/tours/${tourId}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные тура');
      }
      
      const data = await response.json();
      // Извлекаем данные тура из ответа API
      const tourData = data.tour || data;
      setOriginalData(tourData);
      
      // Заполняем форму данными
      setTitle(tourData.title || '');
      setSlug(tourData.slug || '');
      setPrice(tourData.price ? tourData.price.toString() : '');
      setCurrency(tourData.currency || 'RUB');
      setImageUrl(tourData.imageUrl || '');
      setShortDescription(tourData.shortDescription || '');
      setFullDescription(tourData.fullDescription || '');
      setInclusions(tourData.inclusions || '');
      setExclusions(tourData.exclusions || '');
      setItinerary(tourData.itinerary || '');
      setImageUrls(tourData.imageUrls || []);
      setDestinationId(tourData.destinationId ? tourData.destinationId.toString() : '');
      setDuration(tourData.duration ? tourData.duration.toString() : '7');
      setGroupSize(tourData.groupSize ? tourData.groupSize.toString() : '10');
      setAvailableSeats(tourData.availableSeats ? tourData.availableSeats.toString() : '10');
      setNextTourDate(tourData.nextTourDate ? new Date(tourData.nextTourDate).toISOString().slice(0, 10) : '');
      
      // Отмечаем, что данные были загружены
      dataFetchedRef.current = true;
    } catch (error: any) {
      console.error('Ошибка при загрузке данных тура:', error);
      setLoadError(error.message || 'Не удалось загрузить данные тура');
      toast.error('Не удалось загрузить данные тура');
    } finally {
      setLoadingData(false);
    }
  }, [tourId]);
  
  // Генерация slug из названия
  const generateSlug = () => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\sа-яё-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/[а-яё]/g, char => {
        const cyrillicToLatin: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return cyrillicToLatin[char] || char;
      });
    
    setSlug(generatedSlug);
  };
  
  // Добавление URL изображения
  const addImageUrl = () => {
    if (tempImageUrl && tempImageUrl.trim() !== '') {
      if (imageUrls.includes(tempImageUrl)) {
        toast.error('Это изображение уже добавлено');
        return;
      }
      
      setImageUrls([...imageUrls, tempImageUrl]);
      setTempImageUrl('');
    }
  };
  
  // Удаление URL изображения
  const removeImageUrl = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };
  
  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Название тура обязательно';
    if (!slug.trim()) newErrors.slug = 'URL-идентификатор обязателен';
    if (!price.trim()) newErrors.price = 'Цена обязательна';
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = 'Цена должна быть положительным числом';
    if (!currency.trim()) newErrors.currency = 'Валюта обязательна';
    if (!imageUrl.trim()) newErrors.imageUrl = 'URL основного изображения обязателен';
    if (!shortDescription.trim()) newErrors.shortDescription = 'Краткое описание обязательно';
    if (shortDescription.length > 250) newErrors.shortDescription = 'Краткое описание не должно превышать 250 символов';
    if (!fullDescription.trim()) newErrors.fullDescription = 'Полное описание обязательно';
    if (!destinationId) newErrors.destinationId = 'Необходимо выбрать направление';
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) newErrors.duration = 'Длительность должна быть положительным числом';
    if (isNaN(parseInt(groupSize)) || parseInt(groupSize) <= 0) newErrors.groupSize = 'Размер группы должен быть положительным числом';
    if (isNaN(parseInt(availableSeats)) || parseInt(availableSeats) <= 0) newErrors.availableSeats = 'Количество мест должно быть положительным числом';
    if (nextTourDate && isNaN(Date.parse(nextTourDate))) newErrors.nextTourDate = 'Некорректная дата';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Добавляем обработчик изменения размера группы для синхронизации с доступными местами
  const handleGroupSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGroupSize = e.target.value;
    setGroupSize(newGroupSize);
    
    // Проверяем, совпадают ли текущие доступные места с предыдущим размером группы
    // Если совпадают или availableSeats не инициализировано, обновляем доступные места
    if (originalData && (availableSeats === groupSize || !availableSeats)) {
      setAvailableSeats(newGroupSize);
    }
  };
  
  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    try {
      setLoading(true);
      
      const tourData = {
        title,
        slug,
        price: parseFloat(price),
        currency,
        imageUrl,
        shortDescription,
        fullDescription,
        inclusions,
        exclusions,
        itinerary,
        imageUrls,
        destinationId: parseInt(destinationId),
        duration: parseInt(duration),
        groupSize: parseInt(groupSize),
        availableSeats: parseInt(availableSeats),
        nextTourDate: nextTourDate || null
      };
      
      const response = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tourData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении тура');
      }
      
      toast.success('Тур успешно обновлен');
      router.push('/admin/tours');
    } catch (error: any) {
      console.error('Ошибка при обновлении тура:', error);
      toast.error(error.message || 'Произошла ошибка при обновлении тура');
    } finally {
      setLoading(false);
    }
  };
  
  // Если данные загружаются, показываем спиннер
  if (loadingData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Если произошла ошибка при загрузке, показываем сообщение
  if (loadError) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 p-4 rounded-xl shadow max-w-md">
          <h2 className="text-red-800 text-xl font-bold mb-2">Ошибка</h2>
          <p className="text-red-700">{loadError}</p>
          <div className="mt-4">
            <Link href="/admin/tours" className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Вернуться к списку туров
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/admin/tours" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Назад к списку
        </Link>
        <h1 className="text-2xl font-bold ml-4">Редактирование тура</h1>
      </div>
      
      {loadingData ? (
        <div className="text-center my-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Загрузка данных тура...</p>
        </div>
      ) : loadError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Ошибка:</strong> {loadError}</p>
          <button 
            onClick={fetchTourData}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Основная информация</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Название тура */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Название тура *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={generateSlug}
                  className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Название тура"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              {/* URL-идентификатор */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  URL-идентификатор *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="url-identifier"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Создать
                  </button>
                </div>
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              </div>
              
              {/* Цена */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Цена *
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="100000"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
              
              {/* Валюта */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Валюта *
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.currency ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="RUB">₽ (RUB)</option>
                </select>
                {errors.currency && <p className="mt-1 text-sm text-red-600">{errors.currency}</p>}
              </div>
              
              {/* Длительность */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Длительность (дней) *
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="7"
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>
              
              {/* Размер группы */}
              <div>
                <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Размер группы *
                </label>
                <input
                  type="number"
                  id="groupSize"
                  value={groupSize}
                  onChange={handleGroupSizeChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md ${errors.groupSize ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="10"
                />
                {errors.groupSize && <p className="mt-1 text-sm text-red-600">{errors.groupSize}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {originalData && originalData.availableSeats === originalData.groupSize 
                    ? "Количество доступных мест будет обновлено вместе с размером группы" 
                    : "Количество доступных мест не будет изменено, так как есть активные заказы"}
                </p>
              </div>
              
              {/* Дата следующего тура */}
              <div>
                <label htmlFor="nextTourDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Дата следующего тура
                </label>
                <input
                  type="date"
                  id="nextTourDate"
                  value={nextTourDate}
                  onChange={(e) => setNextTourDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.nextTourDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nextTourDate && <p className="mt-1 text-sm text-red-600">{errors.nextTourDate}</p>}
              </div>
              
              {/* Выбор направления */}
              <div>
                <label htmlFor="destinationId" className="block text-sm font-medium text-gray-700 mb-1">
                  Направление *
                </label>
                <select
                  id="destinationId"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.destinationId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Выберите направление</option>
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
                {errors.destinationId && <p className="mt-1 text-sm text-red-600">{errors.destinationId}</p>}
              </div>
            </div>
          </div>
          
          {/* Изображения */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Изображения</h2>
            
            <div className="mb-4">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Основное изображение (обложка) *
              </label>
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дополнительные изображения
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md border-gray-300"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Добавить
                </button>
              </div>
              
              {imageUrls.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Добавленные изображения:</p>
                  <ul className="bg-gray-50 p-3 rounded-md">
                    {imageUrls.map((url, index) => (
                      <li key={index} className="flex justify-between items-center text-sm py-1 px-2 border-b last:border-0">
                        <span className="truncate flex-1">{url}</span>
                        <button
                          type="button"
                          onClick={() => removeImageUrl(url)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Удалить
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Описания */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Описания</h2>
            
            <div className="mb-4">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Краткое описание * (до 250 символов)
              </label>
              <textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                className={`w-full px-3 py-2 border rounded-md ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Краткое описание тура для отображения в карточках и списках"
              ></textarea>
              <div className="flex justify-between text-xs mt-1">
                <span className={shortDescription.length > 250 ? 'text-red-500' : 'text-gray-500'}>
                  {shortDescription.length}/250 символов
                </span>
              </div>
              {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Полное описание *
              </label>
              <textarea
                id="fullDescription"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md ${errors.fullDescription ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Подробное описание тура"
              ></textarea>
              {errors.fullDescription && <p className="mt-1 text-sm text-red-600">{errors.fullDescription}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="inclusions" className="block text-sm font-medium text-gray-700 mb-1">
                Что включено
              </label>
              <textarea
                id="inclusions"
                value={inclusions}
                onChange={(e) => setInclusions(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-md border-gray-300"
                placeholder="Проживание, питание, трансфер и т.д."
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="exclusions" className="block text-sm font-medium text-gray-700 mb-1">
                Что не включено
              </label>
              <textarea
                id="exclusions"
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-md border-gray-300"
                placeholder="Авиабилеты, страховка, дополнительные экскурсии и т.д."
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="itinerary" className="block text-sm font-medium text-gray-700 mb-1">
                Маршрут / Программа тура
              </label>
              <textarea
                id="itinerary"
                value={itinerary}
                onChange={(e) => setItinerary(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border rounded-md border-gray-300"
                placeholder="День 1: ...&#10;День 2: ...&#10;День 3: ..."
              ></textarea>
            </div>
          </div>
          
          {/* Кнопки формы */}
          <div className="flex justify-end pt-4 border-t border-gray-200 gap-4">
            <Link
              href="/admin/tours"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 