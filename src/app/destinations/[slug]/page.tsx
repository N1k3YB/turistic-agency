'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import TourCard from '../../../../components/TourCard';

// Тип для тура (из TourCard, но с добавлением slug)
interface TourSummary {
  id: number;
  title: string;
  slug: string;
  price: string;
  currency: string;
  imageUrl: string;
  shortDescription: string;
  createdAt: string;
  updatedAt: string;
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
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке');
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [slug]);

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

      {/* Список туров в этом направлении */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Туры в направлении "{destination.name}"</h2>
        {destination.tours && destination.tours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destination.tours.map((tour) => (
              // Оборачиваем TourCard в Link
              <Link key={tour.id} href={`/tours/${tour.slug}`} passHref>
                <TourCard tour={tour} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">В этом направлении пока нет доступных туров.</p>
        )}
      </section>
    </div>
  );
} 