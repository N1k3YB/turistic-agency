"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  UserIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  ArrowPathIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  EnvelopeIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

// Определение типов
interface TicketResponse {
  id: number;
  ticketId: number;
  message: string;
  isFromStaff: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
}

interface Ticket {
  id: number;
  userId: string;
  subject: string;
  message: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  user: User;
  responses: TicketResponse[];
}

export default function UserTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Состояния
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [newResponse, setNewResponse] = useState("");

  // Проверка авторизации
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Загрузка тикетов пользователя
  useEffect(() => {
    if (status === "authenticated") {
      fetchTickets();
    }
  }, [status, statusFilter, sortOption]);

  // Установка выбранного тикета из URL
  useEffect(() => {
    const ticketId = searchParams?.get("id");
    if (ticketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.id.toString() === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    } else if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [searchParams, tickets, selectedTicket]);

  // Функция для загрузки тикетов
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/tickets?sort=${sortOption}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Ошибка при загрузке обращений");
      }
      
      const data = await response.json();
      setTickets(data);
      
      // Установка первого тикета как выбранного, если еще нет выбранного
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setError("Не удалось загрузить обращения. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // Отправка ответа на тикет
  const sendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket || !newResponse.trim()) return;
    
    try {
      const response = await fetch('/api/tickets/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: newResponse
        }),
      });
      
      if (!response.ok) {
        throw new Error("Ошибка при отправке ответа");
      }
      
      const data = await response.json();
      
      // Обновляем выбранный тикет с новым ответом
      if (selectedTicket) {
        const updatedTicket = {
          ...selectedTicket,
          responses: [...selectedTicket.responses, data]
        };
        
        setSelectedTicket(updatedTicket);
        
        // Обновляем тикет в общем списке
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === selectedTicket.id ? updatedTicket : ticket
          )
        );
      }
      
      // Очищаем поле ввода
      setNewResponse("");
    } catch (error) {
      console.error("Ошибка:", error);
      setError("Не удалось отправить ответ");
    }
  };

  // Выполнение поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
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

  // Если пользователь не аутентифицирован или загружается
  if (status === "loading" || loading && !tickets.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link 
            href="/profile"
            className="mr-3 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Мои обращения</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link 
            href="/profile/tickets/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Новое обращение
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Левая панель - список тикетов */}
        <div className="w-full md:w-1/3 flex flex-col">
          <div className="bg-white rounded-lg shadow mb-4 p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Поиск по теме..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 absolute top-2.5 right-3 text-gray-400" />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Найти
              </button>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between flex-wrap gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full bg-gray-50 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  <option value="">Все статусы</option>
                  <option value="OPEN">Новые</option>
                  <option value="IN_PROGRESS">В обработке</option>
                  <option value="RESOLVED">Решенные</option>
                  <option value="CLOSED">Закрытые</option>
                </select>
                <ChevronDownIcon className="h-5 w-5 absolute top-2.5 right-3 text-gray-400" />
              </div>
              
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none w-full bg-gray-50 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="oldest">Сначала старые</option>
                  <option value="updated">По обновлению</option>
                </select>
                <ChevronDownIcon className="h-5 w-5 absolute top-2.5 right-3 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow flex-grow overflow-auto">
            {tickets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {loading ? 
                  "Загрузка обращений..." : 
                  "У вас пока нет обращений"
                }
                {!loading && (
                  <div className="mt-4">
                    <Link
                      href="/profile/tickets/new"
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Создать обращение
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <li 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{ticket.message}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatDate(ticket.createdAt)}</span>
                      <span className="flex items-center">
                        <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-1" />
                        {ticket.responses.length}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Правая панель - детали тикета */}
        <div className="w-full md:w-2/3 flex flex-col">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow flex-grow flex flex-col overflow-auto">
              {/* Заголовок тикета */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{selectedTicket.subject}</h2>
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-sm text-gray-500">ID: {selectedTicket.id}</p>
                  <p className="text-sm text-gray-500">Создано: {formatDate(selectedTicket.createdAt)}</p>
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
                    <p className="whitespace-pre-wrap break-words">{selectedTicket.message}</p>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500">{formatDate(selectedTicket.createdAt)}</span>
                  </div>
                </div>
                
                {/* Ответы на тикет */}
                {selectedTicket.responses.map((response) => (
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
              {selectedTicket.status !== "CLOSED" && (
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
                        disabled={!newResponse.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Отправить ответ
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Сообщение о закрытом тикете */}
              {selectedTicket.status === "CLOSED" && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-center text-gray-500">Этот запрос закрыт и не может быть обновлен</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow flex-grow flex items-center justify-center text-gray-500 flex-col p-6">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mb-4" />
              <p className="text-lg">Выберите обращение из списка слева</p>
              {tickets.length === 0 && !loading && (
                <p className="mt-2">У вас пока нет обращений</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}   