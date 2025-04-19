'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Destination {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Компонент карточки направления
const DestinationCard: React.FC<{ destination: Destination }> = ({ destination }) => {
  return (
    <Link href={`/destinations/${destination.slug}`} passHref>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out group">
        <div className="relative h-48 w-full">
          <Image
            src={destination.imageUrl}
            alt={destination.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate group-hover:text-blue-600">{destination.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{destination.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/destinations');
        if (!response.ok) {
          throw new Error('Не удалось загрузить направления');
        }
        const data: Destination[] = await response.json();
        setDestinations(data);
      } catch (err: any) {
        setError(err.message || 'Произошла ошибка при загрузке');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Направления для путешествий</h1>

      {loading && <p className="text-center text-gray-500">Загрузка направлений...</p>}
      {error && <p className="text-center text-red-500">Ошибка: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.length > 0 ? (
            destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">Направления не найдены.</p>
          )}
        </div>
      )}
    </div>
  );
} 