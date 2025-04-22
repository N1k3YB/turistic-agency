'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import TourCard from '../../../components/TourCard';

// Тип для тура (из TourCard, но с добавлением slug)
interface TourSummary {
  id: number;
  title: string;
  slug: string;
  price: string;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  availableSeats?: number;
  averageRating?: number;
  _count?: {
    orders?: number;
    reviews?: number;
  };
}

// Тип для направления, включая список туров
interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  tours: TourSummary[];
  createdAt: string;
  updatedAt: string;
}

export default function DestinationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedTours, setDisplayedTours] = useState<TourSummary[]>([]);
  const [popularTour, setPopularTour] = useState<TourSummary | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 6; // Количество туров для отображения за один раз

  useEffect(() => {
    if (!slug) return;

    const fetchDestination = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/destinations/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Направление с таким адресом не найдено.');
          }
          throw new Error('Не удалось загрузить данные направления');
        }
        const data: Destination = await response.json();
        setDestination(data);

        // Запрашиваем популярные туры для этого направления
        const popularResponse = await fetch(`/api/tours?destinationId=${data.id}&popular=true&limit=1`);
        if (popularResponse.ok) {
          const popularData = await popularResponse.json();
          if (popularData.length > 0) {
            setPopularTour(popularData[0]);
          }
        }

        // Получаем первые limit туров для начального отображения
        const toursResponse = await fetch(`/api/tours?destinationId=${data.id}&limit=${limit}`);
        if (toursResponse.ok) {
          const toursData = await toursResponse.json();
          setDisplayedTours(toursData);
          setOffset(limit);
        }
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке');
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [slug]);

  // Функция для загрузки дополнительных туров
  const loadMoreTours = async () => {
    if (!destination) return;
    
    try {
      const response = await fetch(`/api/tours?destinationId=${destination.id}&limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить больше туров');
      }
      const data = await response.json();
      if (data.length > 0) {
        setDisplayedTours(prev => [...prev, ...data]);
        setOffset(prev => prev + limit);
      }
    } catch (err) {
      console.error('Ошибка при загрузке дополнительных туров:', err);
    }
  };


  if (loading) {
    return <div className="container mx-auto px-4 py-8 min-h-screen text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 min-h-screen text-center text-red-600">Ошибка: {error}</div>;
  }

  if (!destination) {
    return <div className="container mx-auto px-4 py-8 min-h-screen text-center">Направление не найдено.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Изображение и название направления */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-8">
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{destination.name}</h1>
        </div>
      </div>

      {/* Описание направления */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">О направлении</h2>
        <p className="text-gray-700 whitespace-pre-line">{destination.description}</p>
      </section>

      {/* Самый популярный тур в этом направлении */}
      {popularTour && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Самый популярный тур</h2>
          <div className="max-w-md mx-auto h-full">
            <TourCard tour={popularTour} />
          </div>
        </section>
      )}

      {/* Список туров в этом направлении */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Туры в направлении "{destination.name}"</h2>
        {displayedTours && displayedTours.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedTours.map((tour) => (
                <div key={tour.id} className="h-full">
                  <TourCard tour={tour} />
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button 
                onClick={loadMoreTours}
                className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-6 rounded-full transition-colors">
                Показать больше туров
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">В этом направлении пока нет доступных туров.</p>
        )}
      </section>
    </div>
  );
} 