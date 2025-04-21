"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  UserIcon, 
  ArrowLeftIcon,
  ChatBubbleOvalLeftIcon
} from "@heroicons/react/24/outline";

// Определение типов
interface TicketResponse {
  id: number;
  ticketId: number;
  message: string;
  isFromStaff: boolean;
  createdAt: string;
}

interface Ticket {
  id: number;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newResponse, setNewResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Загрузка данных тикета
  useEffect(() => {
    const fetchTicket = async () => {
      if (status !== "authenticated") return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/tickets/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Обращение не найдено");
          } else {
            throw new Error("Ошибка при загрузке обращения");
          }
        }
        
        const data = await response.json();
        setTicket(data);
      } catch (error) {
        console.error("Ошибка:", error);
        setError(error instanceof Error ? error.message : "Ошибка при загрузке обращения");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTicket();
    }
  }, [params.id, status]);

  // Отправка ответа на тикет
  const sendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticket || !newResponse.trim()) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/tickets/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          message: newResponse
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при отправке ответа");
      }
      
      const data = await response.json();
      
      // Обновляем тикет с новым ответом
      setTicket(prev => {
        if (prev) {
          return {
            ...prev,
            responses: [...prev.responses, data]
          };
        }
        return prev;
      });
      
      // Очищаем поле ввода
      setNewResponse("");
    } catch (error) {
      console.error("Ошибка:", error);
      setError(error instanceof Error ? error.message : "Ошибка при отправке ответа");
    } finally {
      setSubmitting(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  // Получение цвета для статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Получение текста для статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Новый";
      case "IN_PROGRESS":
        return "В обработке";
      case "RESOLVED":
        return "Решен";
      case "CLOSED":
        return "Закрыт";
      default:
        return status;
    }
  };

  // Если идет загрузка данных
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Если произошла ошибка
  if (error || !ticket) {
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
            <h1 className="text-2xl font-bold text-gray-800">Обращение</h1>
          </div>
          
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || "Обращение не найдено"}
          </div>
          
          <div className="mt-4 text-center">
            <Link
              href="/profile/tickets"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Вернуться к списку обращений
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/profile/tickets"
            className="mr-3 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Обращение #{ticket.id}</h1>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow flex flex-col">
          {/* Заголовок тикета */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{ticket.subject}</h2>
              <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                {getStatusText(ticket.status)}
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <p className="text-sm text-gray-500">Создано: {formatDate(ticket.createdAt)}</p>
              <p className="text-sm text-gray-500 flex items-center">
                <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-1" />
                Ответов: {ticket.responses.length}
              </p>
            </div>
          </div>
          
          {/* Содержимое тикета */}
          <div className="flex-grow overflow-y-auto max-h-[60vh] min-h-[200px] p-4">
            {/* Исходное сообщение — всегда справа */}
            <div className="mb-6 ml-12">
              <div className="flex items-center mb-2 justify-end">
                <span className="font-medium text-sm mr-2">Вы</span>
                {session?.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Пользователь"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg max-w-[80%] w-fit ml-auto">
                <p className="whitespace-pre-wrap break-words">{ticket.message}</p>
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
            
            {/* Ответы на тикет */}
            {ticket.responses.map((response) => (
              <div key={response.id} className={`mb-6 ${response.isFromStaff ? "mr-12" : "ml-12"}`}>
                <div className={`flex items-center mb-2 ${response.isFromStaff ? "" : "justify-end"}`}>
                  {response.isFromStaff ? (
                    <>
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">Агент тех. поддержки</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-sm mr-2">Вы</span>
                      {session?.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Пользователь"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className={`${response.isFromStaff ? "bg-blue-50" : "bg-gray-50"} p-4 rounded-lg max-w-[80%] w-fit ${response.isFromStaff ? "ml-0" : "ml-auto"}`}>
                  <p className="whitespace-pre-wrap break-words">{response.message}</p>
                </div>
                <div className={`mt-1 ${response.isFromStaff ? "text-left" : "text-right"}`}>
                  <span className="text-xs text-gray-500">{formatDate(response.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Форма ответа (только если тикет не закрыт) */}
          {ticket.status !== "CLOSED" && (
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={sendResponse}>
                <div className="mb-3">
                  <textarea
                    placeholder="Введите ваш ответ..."
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !newResponse.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Отправка..." : "Отправить ответ"}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Сообщение о закрытом тикете */}
          {ticket.status === "CLOSED" && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-center text-gray-500">Этот запрос закрыт и не может быть обновлен</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 