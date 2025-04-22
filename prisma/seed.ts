import { PrismaClient, UserRole } from '../src/generated/prisma';
import { Decimal } from '../src/generated/prisma/runtime/library';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Используем стабильные URL для изображений или локальные заглушки
const placeholderImages = {
  altai: '/images/image-placeholder.svg?destination=altai',
  sochi: '/images/image-placeholder.svg?destination=sochi',
  goldenRing: '/images/image-placeholder.svg?destination=goldenring',
};

async function main() {
  console.log('Начало заполнения тестовыми данными...');

  // Удаление старых данных (опционально, но полезно для чистоты)
  await prisma.tour.deleteMany({});
  await prisma.destination.deleteMany({});
  
  // Удаляем пользователей и связанные с ними данные
  await prisma.user.deleteMany({});
  
  console.log('Старые данные удалены.');

  // Создаем тестовых пользователей
  const adminPassword = await hash('admin123', 10);
  const managerPassword = await hash('manager123', 10);
  const userPassword = await hash('user123', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Администратор',
      email: 'admin@example.com',
      hashedPassword: adminPassword,
      role: 'ADMIN',
    },
  });
  
  const manager = await prisma.user.create({
    data: {
      name: 'Менеджер',
      email: 'manager@example.com',
      hashedPassword: managerPassword,
      role: 'MANAGER',
    },
  });
  
  const user = await prisma.user.create({
    data: {
      name: 'Пользователь',
      email: 'user@example.com',
      hashedPassword: userPassword,
      role: 'USER',
    },
  });
  
  console.log('Созданы тестовые пользователи с ролями:', admin.role, manager.role, user.role);

  // Создание направлений
  const destinationAltai = await prisma.destination.create({
    data: {
      name: 'Алтай',
      slug: 'altai',
      description: 'Горный регион на юге Сибири, известный своими живописными пейзажами, озерами и культурным наследием.',
      imageUrl: placeholderImages.altai,
    },
  });

  const destinationSochi = await prisma.destination.create({
    data: {
      name: 'Сочи',
      slug: 'sochi',
      description: 'Популярный курортный город на побережье Черного моря, предлагающий пляжный отдых и развлечения.',
      imageUrl: placeholderImages.sochi,
    },
  });

  const destinationGoldenRing = await prisma.destination.create({
    data: {
      name: 'Золотое Кольцо',
      slug: 'golden-ring',
      description: 'Маршрут по древним городам Северо-Восточной Руси, хранящим уникальные памятники истории и культуры.',
      imageUrl: placeholderImages.goldenRing,
    },
  });
  console.log('Направления созданы:', destinationAltai.name, destinationSochi.name, destinationGoldenRing.name);

  // Создание туров с привязкой к направлениям и новыми полями
  await prisma.tour.createMany({
    data: [
      {
        title: 'Путешествие в горы Алтая',
        slug: 'altai-mountains-trip',
        price: new Decimal(45000),
        currency: 'RUB',
        imageUrl: placeholderImages.altai,
        shortDescription: 'Незабываемое приключение по живописным местам Алтая.',
        fullDescription: 'Полное описание путешествия в горы Алтая. Включает посещение Телецкого озера, долины Чулышман и других знаковых мест. Идеально для любителей активного отдыха и природы.',
        itinerary: 'День 1: Прибытие в Горно-Алтайск, трансфер на Телецкое озеро. День 2-3: Экскурсии по озеру. День 4: Переезд в долину Чулышман. День 5-6: Треккинг. День 7: Возвращение.',
        inclusions: 'Проживание, питание (завтраки), трансферы по программе, экскурсии с гидом.',
        exclusions: 'Авиаперелет, личные расходы, страховка.',
        imageUrls: [
          placeholderImages.altai + '&index=1',
          placeholderImages.altai + '&index=2'
          ],
        destinationId: destinationAltai.id,
      },
      {
        title: 'Пляжный отдых в Сочи',
        slug: 'sochi-beach-vacation',
        price: new Decimal(30000),
        currency: 'RUB',
        imageUrl: placeholderImages.sochi,
        shortDescription: 'Идеальный выбор для любителей солнца и моря.',
        fullDescription: 'Проведите незабываемый отпуск на лучших пляжах Сочи. Комфортабельные отели, теплое море и множество развлечений ждут вас.',
        itinerary: '7 дней/6 ночей. Свободная программа. Возможность заказать дополнительные экскурсии.',
        inclusions: 'Проживание в выбранном отеле, завтраки.',
        exclusions: 'Перелет/проезд до Сочи, трансфер, обеды и ужины, экскурсии.',
        imageUrls: [
          placeholderImages.sochi + '&index=1',
          placeholderImages.sochi + '&index=2'
          ],
        destinationId: destinationSochi.id,
      },
      {
        title: 'Экскурсия по Золотому Кольцу',
        slug: 'golden-ring-tour',
        price: new Decimal(25000),
        currency: 'RUB',
        imageUrl: placeholderImages.goldenRing,
        shortDescription: 'Познакомьтесь с историей и культурой древних русских городов.',
        fullDescription: 'Увлекательное путешествие по знаменитым городам Золотого Кольца: Сергиев Посад, Переславль-Залесский, Ростов Великий, Ярославль, Кострома, Суздаль, Владимир.',
        itinerary: 'День 1: Москва - Сергиев Посад - Переславль-Залесский. День 2: Ростов Великий - Ярославль. День 3: Кострома - Суздаль. День 4: Владимир - Москва.',
        inclusions: 'Проживание в гостиницах, завтраки, транспортное обслуживание, экскурсии по программе, входные билеты в музеи.',
        exclusions: 'Проезд до Москвы, обеды и ужины, личные расходы.',
        imageUrls: [
          placeholderImages.goldenRing + '&index=1',
          placeholderImages.goldenRing + '&index=2'
          ],
        destinationId: destinationGoldenRing.id,
      },
    ],
    skipDuplicates: true, // Оставляем на случай повторного запуска без очистки
  });
  console.log('Тестовые данные туров успешно добавлены и связаны с направлениями.');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Соединение с базой данных закрыто.');
  }); 