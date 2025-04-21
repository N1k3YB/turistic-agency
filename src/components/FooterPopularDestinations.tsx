'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Тип для популярного направления
interface PopularDestination {
  id: number;
  name: string;
  slug: string;
  totalOrders: number;
  tourCount: number;
}

const FooterPopularDestinations = () => {
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularDestinations = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/destinations?popular=true&limit=6');
        if (!response.ok) {
          throw new Error('Не удалось загрузить популярные направления');
        }
        const data = await response.json();
        setPopularDestinations(data);
      } catch (error) {
        console.error('Ошибка при загрузке популярных направлений:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDestinations();
  }, []);

  if (loading) {
    return (
      <ul className="space-y-2">
        <li><div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div></li>
        <li><div className="h-5 w-28 bg-gray-700 rounded animate-pulse"></div></li>
        <li><div className="h-5 w-20 bg-gray-700 rounded animate-pulse"></div></li>
        <li><div className="h-5 w-26 bg-gray-700 rounded animate-pulse"></div></li>
        <li><div className="h-5 w-22 bg-gray-700 rounded animate-pulse"></div></li>
        <li><div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div></li>
      </ul>
    );
  }

  if (popularDestinations.length === 0) {
    return (
      <p className="text-gray-400">Направления загружаются...</p>
    );
  }

  return (
    <ul className="space-y-2">
      {popularDestinations.map((destination) => (
        <li key={destination.id}>
          <Link 
            href={`/destinations/${destination.slug}`} 
            className="text-gray-300 hover:text-white transition-colors"
          >
            {destination.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default FooterPopularDestinations; 