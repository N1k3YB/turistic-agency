"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NewTicketPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Создание нового тикета
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при создании обращения");
      }
      
      // Перенаправляем на страницу со списком тикетов
      router.push('/profile/tickets');
    } catch (error) {
      console.error("Ошибка:", error);
      setError(error instanceof Error ? error.message : "Ошибка при создании обращения");
    } finally {
      setLoading(false);
    }
  };

  // Если пользователь не аутентифицирован
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Если идет загрузка сессии
  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/profile/tickets"
            className="mr-3 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Новое обращение</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Тема обращения
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Укажите тему обращения"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                placeholder="Опишите вашу проблему или вопрос как можно подробнее..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Link
                href="/profile/tickets"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? "Отправка..." : "Отправить обращение"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <p className="mb-2 font-medium">Примечание:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Обычно мы отвечаем на обращения в течение 24 часов в рабочие дни.</li>
            <li>Постарайтесь описать вашу проблему максимально подробно.</li>
            <li>Если ваш вопрос касается конкретного тура или заказа, укажите его номер.</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 