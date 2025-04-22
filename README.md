<p align="center">
  <img src="public/airplane-flight.svg" alt="АВИАВЭЙС" width="120" height="120" />
</p>

<h1 align="center">АВИАВЭЙС</h1>
<h3 align="center">Современная платформа для поиска и бронирования туров</h3>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/next.js-15.3.1-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/react-19.0.0-blue?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/tailwindcss-4.0.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/prisma-6.6.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/typescript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

---

## 📋 Содержание

- [О проекте](#-о-проекте)
- [Архитектура проекта](#-архитектура-проекта)
- [Модели данных](#-модели-данных)
- [Функциональность](#-функциональность)
- [Роли пользователей](#-роли-пользователей)
- [Основные страницы](#-основные-страницы)
- [API эндпоинты](#-api-эндпоинты)
- [Установка и запуск](#-установка-и-запуск)
- [Среда разработки](#-среда-разработки)
- [FAQ](#-часто-задаваемые-вопросы)

---

## 🌟 О проекте

**АВИАВЭЙС** — это современный веб-сервис, который позволяет пользователям искать, бронировать и управлять турами по различным направлениям. Платформа предоставляет широкий спектр функций для посетителей сайта, авторизованных пользователей, менеджеров и администраторов.

### Основные возможности:

- 🔍 Поиск и фильтрация туров по различным критериям
- 🌍 Просмотр направлений и доступных туров
- 💰 Бронирование и оплата туров
- ⭐ Система рейтингов и отзывов
- 👤 Личный кабинет с историей заказов
- 📞 Система обращений в службу поддержки
- 👨‍💼 Панель управления для менеджеров и администраторов

---

## 🏗 Архитектура проекта

Проект разработан с использованием современного стека технологий:

- **Frontend**: Next.js 15.3.1, React 19.0.0, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: PostgreSQL
- **Аутентификация**: NextAuth.js
- **Валидация**: Zod
- **UI компоненты**: Headless UI, Heroicons

### Структура проекта

```mermaid
graph TD
    A[src/] --> B[app/]
    A --> C[components/]
    A --> D[lib/]
    A --> E[types/]
    A --> F[hooks/]
    A --> G[generated/]
    
    B --> B1[page.tsx - Главная страница]
    B --> B2[layout.tsx - Основной лейаут]
    B --> B3[api/ - API эндпоинты]
    B --> B4[tours/ - Страницы туров]
    B --> B5[destinations/ - Страницы направлений]
    B --> B6[auth/ - Авторизация]
    B --> B7[admin/ - Админ-панель]
    B --> B8[manager/ - Панель менеджера]
    B --> B9[profile/ - Личный кабинет]
    
    C --> C1[TourCard.tsx - Карточка тура]
    C --> C2[Другие компоненты...]
    
    D --> D1[prisma.ts - Клиент Prisma]
    D --> D2[auth.ts - Аутентификация]
    D --> D3[utils.ts - Утилиты]
    
    subgraph "Корень проекта"
    Z[prisma/] --> Z1[schema.prisma - Схема БД]
    Z --> Z2[migrations/ - Миграции]
    Z --> Z3[seed.ts - Заполнение БД]
    end
```

---

## 📊 Модели данных

Структура базы данных представлена следующими основными моделями:

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : has
    User ||--o{ Review : writes
    User ||--o{ Favorite : has
    User ||--o{ Order : makes
    User ||--o{ Ticket : creates
    
    Tour ||--o{ Review : receives
    Tour ||--o{ Favorite : in
    Tour ||--o{ Order : ordered
    Tour }|--|| Destination : belongs_to
    
    Ticket ||--o{ TicketResponse : has
    
    User {
        string id PK
        string name
        string email UK
        string hashedPassword
        enum role
        string phone
        string address
        datetime createdAt
    }
    
    Tour {
        int id PK
        string title
        string slug UK
        decimal price
        string currency
        string imageUrl
        string shortDescription
        string fullDescription
        string[] imageUrls
        string inclusions
        string exclusions
        string itinerary
        int duration
        int groupSize
        int availableSeats
        datetime nextTourDate
        int destinationId FK
    }
    
    Destination {
        int id PK
        string name
        string slug UK
        string description
        string imageUrl
    }
    
    Review {
        int id PK
        int rating
        string comment
        boolean isApproved
        int tourId FK
        string userId FK
    }
    
    Order {
        int id PK
        string userId FK
        int tourId FK
        int quantity
        decimal totalPrice
        enum status
        string contactPhone
        string contactEmail
    }
    
    Ticket {
        int id PK
        string userId FK
        string subject
        string message
        enum status
    }
    
    TicketResponse {
        int id PK
        int ticketId FK
        string message
        boolean isFromStaff
    }
```

### Ключевые связи между моделями:

- **User ↔ Tour**: через таблицы Reviews, Favorites и Orders
- **Tour ↔ Destination**: каждый тур принадлежит к определенному направлению
- **User ↔ Ticket**: пользователи создают обращения в службу поддержки
- **Ticket ↔ TicketResponse**: обращения содержат ответы от пользователей и персонала

---

## 🛠 Функциональность

### Процесс бронирования тура

```mermaid
sequenceDiagram
    actor User as Пользователь
    participant Frontend as Клиентская часть
    participant API as API сервер
    participant DB as База данных
    participant Manager as Менеджер
    
    User->>Frontend: Выбирает тур
    Frontend->>API: GET /api/tours/{id}
    API->>DB: Запрос данных тура
    DB-->>API: Данные тура
    API-->>Frontend: Детали тура
    Frontend-->>User: Показывает детали тура
    
    User->>Frontend: Бронирует тур
    Frontend->>API: POST /api/orders
    API->>DB: Создает заказ
    DB-->>API: Данные о заказе
    API-->>Frontend: Подтверждение заказа
    Frontend-->>User: Показывает подтверждение
    
    API->>Manager: Уведомление о новом заказе
    Manager->>API: PUT /api/orders/{id} (изменение статуса)
    API->>DB: Обновляет статус заказа
    DB-->>API: Обновленные данные
    API-->>Frontend: Обновление статуса заказа
    Frontend-->>User: Уведомление об изменении статуса
```

### Процесс обработки отзывов

```mermaid
flowchart TD
    A[Пользователь оставляет отзыв] --> B{Требуется модерация?}
    B -->|Да| C[Отзыв в статусе ожидания]
    C --> D[Менеджер проверяет отзыв]
    D --> E{Решение менеджера}
    E -->|Одобрить| F[Отзыв опубликован]
    E -->|Отклонить| G[Отзыв отклонен]
    B -->|Нет| F
    F --> H[Отзыв влияет на рейтинг тура]
    H --> I[Обновление рейтинга тура]
```

---

## 👥 Роли пользователей

В системе предусмотрены следующие роли пользователей с различными правами доступа:

```mermaid
pie title Распределение функциональности по ролям
    "USER" : 40
    "MANAGER" : 25
    "ADMIN" : 35
```

### 👤 USER (обычный пользователь)
- Поиск и просмотр туров и направлений
- Бронирование туров
- Добавление отзывов и рейтингов
- Управление личным профилем
- Работа с избранными турами
- Создание обращений в службу поддержки
- Просмотр истории заказов

### 👨‍💼 MANAGER (менеджер)
- Все функции обычного пользователя
- Управление заказами (изменение статусов)
- Модерация отзывов
- Работа с обращениями клиентов
- Просмотр статистики продаж и популярности туров

### 👑 ADMIN (администратор)
- Все функции менеджера
- Полное управление турами и направлениями (создание, редактирование, удаление)
- Управление пользователями (изменение ролей, блокировка)
- Полный доступ к статистике и аналитике
- Настройка параметров системы

---

## 📱 Основные страницы

### Главная страница (/)
- Поисковая форма с фильтрами
- Популярные направления
- Специальные предложения и акции
- Популярные туры с высоким рейтингом

### Страница направления (/destinations/[slug])
- Информация о направлении
- Список туров по данному направлению
- Фильтры и сортировка туров

### Страница тура (/tours/[slug])
- Детальная информация о туре
- Фотогалерея
- Информация о программе, включенных услугах
- Отзывы и рейтинги
- Форма бронирования

### Личный кабинет (/profile)
- Личная информация пользователя
- История заказов
- Избранные туры
- Мои отзывы
- Обращения в службу поддержки

### Панель управления (/admin)
- Управление турами и направлениями
- Управление пользователями
- Расширенная статистика и аналитика

### Панель менеджера (/manager)
- Управление заказами
- Модерация отзывов
- Работа с обращениями клиентов

---

## 🔌 API эндпоинты

### Туры и направления

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | /api/tours | Получение списка туров с возможностью фильтрации и пагинации |
| GET | /api/tours/[id] | Получение информации о конкретном туре |
| POST | /api/tours | Создание нового тура (только ADMIN) |
| PUT | /api/tours/[id] | Обновление информации о туре (только ADMIN) |
| DELETE | /api/tours/[id] | Удаление тура (только ADMIN) |
| GET | /api/destinations | Получение списка направлений |
| GET | /api/destinations/[id] | Получение информации о конкретном направлении |

### Пользователи и авторизация

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | /api/auth/register | Регистрация нового пользователя |
| POST | /api/auth/login | Вход в систему |
| GET | /api/auth/session | Получение информации о текущей сессии |
| PUT | /api/users/[id] | Обновление профиля пользователя |
| GET | /api/users | Получение списка пользователей (только ADMIN) |

### Заказы и избранное

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST | /api/orders | Создание нового заказа |
| GET | /api/orders | Получение списка заказов (с фильтрацией по пользователю) |
| PUT | /api/orders/[id] | Обновление статуса заказа |
| GET | /api/favorites | Получение списка избранных туров пользователя |
| POST | /api/favorites | Добавление тура в избранное |
| DELETE | /api/favorites/[id] | Удаление тура из избранного |

### Отзывы и обращения

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | /api/reviews | Получение списка отзывов (с фильтрацией по туру) |
| POST | /api/reviews | Создание нового отзыва |
| PUT | /api/reviews/[id] | Обновление статуса отзыва (модерация) |
| GET | /api/tickets | Получение списка обращений |
| POST | /api/tickets | Создание нового обращения |
| POST | /api/tickets/[id]/responses | Добавление ответа на обращение |

### Пример запроса и ответа

#### Запрос на получение туров с фильтрацией:

```http
GET /api/tours?search=пляж&destinationId=2&limit=6&offset=0
```

#### Пример ответа:

```json
{
  "tours": [
    {
      "id": 1,
      "title": "Пляжный отдых в Турции",
      "slug": "beach-vacation-turkey",
      "price": "50000",
      "currency": "RUB",
      "imageUrl": "/images/turkey.jpg",
      "shortDescription": "Лучшие пляжи и отели...",
      "destination": { 
        "id": 2,
        "name": "Турция",
        "slug": "turkey"
      },
      "_count": { "reviews": 12 },
      "averageRating": 4.7
    },
    ...
  ],
  "total": 24,
  "pagination": {
    "limit": 6,
    "offset": 0,
    "totalPages": 4
  }
}
```

---

## 🚀 Установка и запуск

### Предварительные требования

- Node.js 18+ и npm
- PostgreSQL

### Установка и настройка

1. **Клонируйте репозиторий**

```bash
git clone https://github.com/your-username/aviavase.git
cd aviavase
```

2. **Установите зависимости**

```bash
npm install
```

3. **Настройте переменные окружения**

Создайте файл `.env` в корне проекта со следующим содержимым:

```
# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/aviavase"

# NextAuth
NEXTAUTH_SECRET="ваш_секретный_ключ"
NEXTAUTH_URL="http://localhost:3000"

# Другие параметры
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

4. **Миграция базы данных**

```bash
npx prisma migrate dev
```

5. **Заполнение базы тестовыми данными (опционально)**

```bash
npx prisma db seed
```

### Запуск

#### Режим разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

#### Сборка и запуск для продакшена

```bash
npm run build
npm start
```

---

## 💻 Среда разработки

### Используемые инструменты и библиотеки

- **Next.js** - фреймворк для React с серверным рендерингом
- **Prisma** - ORM для работы с базой данных
- **NextAuth.js** - аутентификация и управление сессиями
- **Tailwind CSS** - утилитарный CSS-фреймворк
- **Headless UI** - доступные UI компоненты
- **Zod** - библиотека для валидации данных
- **React Hot Toast** - уведомления
- **Date-fns** - работа с датами

### Рекомендуемые расширения для VS Code

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

### Структура процесса разработки

```mermaid
graph LR
    A[Разработка локально] --> B{Тестирование}
    B --> |Успех| C[Pull Request]
    B --> |Ошибки| A
    C --> D[Код-ревью]
    D --> |Одобрено| E[Мерж в main]
    D --> |Требуются правки| A
    E --> F[Деплой на staging]
    F --> G{Тестирование}
    G --> |Успех| H[Деплой на production]
    G --> |Ошибки| A
```

---

## ❓ Часто задаваемые вопросы

### Для пользователей

**Q: Как зарегистрироваться на платформе?**  
A: Нажмите кнопку "Регистрация" в правом верхнем углу, заполните форму и подтвердите свой email.

**Q: Как оставить отзыв о туре?**  
A: На странице тура прокрутите вниз до раздела "Отзывы" и нажмите кнопку "Оставить отзыв".

**Q: Как отследить статус моего заказа?**  
A: В личном кабинете перейдите в раздел "Мои заказы", где будет отображаться актуальный статус всех ваших заказов.

**Q: Что делать, если возникли проблемы с заказом?**  
A: В личном кабинете перейдите в раздел "Обращения" и создайте новое обращение, описав проблему.

### Для администраторов и менеджеров

**Q: Как добавить новый тур?**  
A: В административной панели перейдите в раздел "Управление турами" и нажмите кнопку "Добавить тур".

**Q: Как изменить роль пользователя?**  
A: В административной панели перейдите в раздел "Пользователи", найдите нужного пользователя и измените его роль в выпадающем списке.

**Q: Как просмотреть статистику продаж?**  
A: В административной или менеджерской панели перейдите в раздел "Статистика и аналитика".

### Технические вопросы

**Q: Как обновить зависимости проекта?**  
A: Выполните команду `npm update` в корневой директории проекта.

**Q: Как внести изменения в схему базы данных?**  
A: Измените файл `prisma/schema.prisma`, затем выполните команду `npx prisma migrate dev --name название_миграции`.

**Q: Как добавить новый API эндпоинт?**  
A: Создайте новый файл в директории `src/app/api/`, следуя существующей структуре.

---

## 📞 Поддержка и контакты

Если у вас возникли вопросы или предложения по улучшению платформы, пожалуйста, свяжитесь с нами:

- **Email**: support@aviavase.ru
- **Телефон**: +7 (999) 123-45-67
- **Telegram**: @aviavase_support

---

© 2023-2024 АВИАВЭЙС. Все права защищены.
