'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import ImageWithFallback from '@/components/ImageWithFallback';

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
    <Link href={`/destinations/${destination.slug}`} passHref className="block group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out card-hover-effect relative h-full">
        <div className="relative h-56 w-full hover-scale">
          <ImageWithFallback
            src={destination.imageUrl}
            alt={destination.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out"
            fallbackSrc="/images/image-placeholder.svg"
          />
          <div className="absolute top-0 left-0 p-3 z-10">
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
              <MapPinIcon className="h-4 w-4 text-blue-600 mr-1" />
              <h3 className="text-base font-semibold text-gray-800">{destination.name}</h3>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-600 line-clamp-2 mb-3">{destination.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-blue-600 font-medium group-hover:text-blue-700 group-hover:translate-x-1 transition-all inline-flex items-center">
              Просмотреть туры
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Фильтрация направлений по поисковому запросу
  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dest.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Героическая секция */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-900 opacity-90 z-10"></div>
        <div className="relative h-72 overflow-hidden">
          <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
          <div className="h-full w-full flex items-center justify-center">
            <GlobeAltIcon className="h-32 w-32 text-white opacity-10" />
          </div>
        </div>
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <GlobeAltIcon className="h-16 w-16 text-white mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow">Направления путешествий</h1>
          <p className="text-xl text-blue-100 max-w-2xl">Выберите свое идеальное направление для незабываемого отдыха</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Поисковая строка */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Найти направление..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8">
            <p className="font-medium">Ошибка: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((dest) => (
                  <DestinationCard key={dest.id} destination={dest} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-xl text-gray-600">Направления не найдены. Попробуйте изменить поисковый запрос.</p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-4 text-blue-600 font-medium hover:text-blue-800"
                    >
                      Сбросить поиск
                    </button>
                  )}
                </div>
              )}
            </div>

            
          </>
        )}
      </div>
    </div>
  );
} 