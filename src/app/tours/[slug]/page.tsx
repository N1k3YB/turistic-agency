'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CalendarDaysIcon, CheckCircleIcon, ExclamationCircleIcon, MapPinIcon, PhotoIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

// Обновленный интерфейс для тура, включая данные направления
interface Tour {
  id: number;
  title: string;
  slug: string;
  price: string;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  fullDescription: string;
  itinerary: string;
  inclusions: string;
  exclusions: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  destinationId: number;
  destination: {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function TourDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTour = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tours/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Тур с таким адресом не найден.');
          }
          throw new Error('Не удалось загрузить данные тура');
        }
        const data: Tour = await response.json();
        setTour(data);
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Ошибка: {error}</div>;
  }

  if (!tour) {
    // Это состояние не должно достигаться при ошибке 404, но на всякий случай
    return <div className="container mx-auto px-4 py-8 text-center">Тур не найден.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Основное изображение и название */}
      <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <Image
          src={tour.imageUrl}
          alt={tour.title}
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{tour.title}</h1>
          <p className="text-lg md:text-xl text-gray-200">Направление: {tour.destination.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка: Описание, Маршрут, Услуги */}
        <div className="lg:col-span-2 space-y-6">
          {/* Краткое и полное описание */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">Описание тура</h2>
            <p className="text-gray-600 mb-4">{tour.shortDescription}</p>
            <p className="text-gray-700 whitespace-pre-line">{tour.fullDescription}</p>
          </section>

          {/* Маршрут */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 flex items-center">
              <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-600" />
              Маршрут
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{tour.itinerary}</p>
          </section>

          {/* Включено */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" />
              Что включено
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{tour.inclusions}</p>
          </section>

          {/* Не включено */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 flex items-center">
              <ExclamationCircleIcon className="h-6 w-6 mr-2 text-red-600" />
              Что не включено
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{tour.exclusions}</p>
          </section>

          {/* Галерея изображений */}
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800 flex items-center">
              <PhotoIcon className="h-6 w-6 mr-2 text-purple-600" />
              Галерея
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tour.imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={url}
                    alt={`${tour.title} - Фото ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Правая колонка: Цена, Заказ */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="sticky top-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {tour.price} {tour.currency}
            </h2>
            <p className="text-gray-600 mb-4">Цена за одного человека</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out">
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Забронировать
            </button>
            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>Направление: {tour.destination.name}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
} 