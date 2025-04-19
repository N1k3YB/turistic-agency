import { PrismaClient } from '../src/generated/prisma';
import { Decimal } from '../src/generated/prisma/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('Начало заполнения тестовыми данными...');

  // Удаление старых данных (опционально, но полезно для чистоты)
  await prisma.tour.deleteMany({});
  await prisma.destination.deleteMany({});
  console.log('Старые данные удалены.');

  // Создание направлений
  const destinationAltai = await prisma.destination.create({
    data: {
      name: 'Алтай',
      slug: 'altai',
      description: 'Горный регион на юге Сибири, известный своими живописными пейзажами, озерами и культурным наследием.',
      imageUrl: 'https://images.unsplash.com/photo-1586346528569-7b1d31a9f74e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8Mnx8YWx0YWklMjBtb3VudGFpbnN8ZW58MHx8fHwxNjE2NjY5MzYy&ixlib=rb-1.2.1&q=80&w=1080',
    },
  });

  const destinationSochi = await prisma.destination.create({
    data: {
      name: 'Сочи',
      slug: 'sochi',
      description: 'Популярный курортный город на побережье Черного моря, предлагающий пляжный отдых и развлечения.',
      imageUrl: 'https://images.unsplash.com/photo-1599662901893-94f5c9e5e1a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8MXx8c29jaGklMjBiZWFjaHxlbnwwfHx8fDE2MTY2NjkzNjI&ixlib=rb-1.2.1&q=80&w=1080',
    },
  });

  const destinationGoldenRing = await prisma.destination.create({
    data: {
      name: 'Золотое Кольцо',
      slug: 'golden-ring',
      description: 'Маршрут по древним городам Северо-Восточной Руси, хранящим уникальные памятники истории и культуры.',
      imageUrl: 'https://images.unsplash.com/photo-1517169188433-6a4f3d1f3f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8MXx8Z29sZGVuJTIwcmluZ3xlbnwwfHx8fDE2MTY2NjkzNjI&ixlib=rb-1.2.1&q=80&w=1080',
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
        imageUrl: 'https://images.unsplash.com/photo-1598898831947-a8938c4f0c1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8M3x8YWx0YWklMjBtb3VudGFpbnN8ZW58MHx8fHwxNjE2NjY5MzYy&ixlib=rb-1.2.1&q=80&w=1080',
        shortDescription: 'Незабываемое приключение по живописным местам Алтая.',
        fullDescription: 'Полное описание путешествия в горы Алтая. Включает посещение Телецкого озера, долины Чулышман и других знаковых мест. Идеально для любителей активного отдыха и природы.',
        itinerary: 'День 1: Прибытие в Горно-Алтайск, трансфер на Телецкое озеро. День 2-3: Экскурсии по озеру. День 4: Переезд в долину Чулышман. День 5-6: Треккинг. День 7: Возвращение.',
        inclusions: 'Проживание, питание (завтраки), трансферы по программе, экскурсии с гидом.',
        exclusions: 'Авиаперелет, личные расходы, страховка.',
        imageUrls: [
          'https://images.unsplash.com/photo-1586346528569-7b1d31a9f74e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8Mnx8YWx0YWklMjBtb3VudGFpbnN8ZW58MHx8fHwxNjE2NjY5MzYy&ixlib=rb-1.2.1&q=80&w=1080',
          'https://images.unsplash.com/photo-1598898831947-a8938c4f0c1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8M3x8YWx0YWklMjBtb3VudGFpbnN8ZW58MHx8fHwxNjE2NjY5MzYy&ixlib=rb-1.2.1&q=80&w=1080'
          ],
        destinationId: destinationAltai.id,
      },
      {
        title: 'Пляжный отдых в Сочи',
        slug: 'sochi-beach-vacation',
        price: new Decimal(30000),
        currency: 'RUB',
        imageUrl: 'https://images.unsplash.com/photo-1599662901893-94f5c9e5e1a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8MXx8c29jaGklMjBiZWFjaHxlbnwwfHx8fDE2MTY2NjkzNjI&ixlib=rb-1.2.1&q=80&w=1080',
        shortDescription: 'Идеальный выбор для любителей солнца и моря.',
        fullDescription: 'Проведите незабываемый отпуск на лучших пляжах Сочи. Комфортабельные отели, теплое море и множество развлечений ждут вас.',
        itinerary: '7 дней/6 ночей. Свободная программа. Возможность заказать дополнительные экскурсии.',
        inclusions: 'Проживание в выбранном отеле, завтраки.',
        exclusions: 'Перелет/проезд до Сочи, трансфер, обеды и ужины, экскурсии.',
        imageUrls: [
          'https://images.unsplash.com/photo-1599662901893-94f5c9e5e1a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8MXx8c29jaGklMjBiZWFjaHxlbnwwfHx8fDE2MTY2NjkzNjI&ixlib=rb-1.2.1&q=80&w=1080',
          'https://images.unsplash.com/photo-1560880894-6f4e4ab6961a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8Mnx8c29jaGklMjBzZWF8ZW58MHx8fHwxNjE2NjY5MzYy&ixlib=rb-1.2.1&q=80&w=1080'
          ],
        destinationId: destinationSochi.id,
      },
      {
        title: 'Экскурсия по Золотому Кольцу',
        slug: 'golden-ring-tour',
        price: new Decimal(25000),
        currency: 'RUB',
        imageUrl: 'https://images.unsplash.com/photo-1517169188433-6a4f3d1f3f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8MXx8Z29sZGVuJTIwcmluZ3xlbnwwfHx8fDE2MTY2NjkzNjI&ixlib=rb-1.2.1&q=80&w=1080',
        shortDescription: 'Познакомьтесь с историей и культурой древних русских городов.',
        fullDescription: 'Увлекательное путешествие по знаменитым городам Золотого Кольца: Сергиев Посад, Переславль-Залесский, Ростов Великий, Ярославль, Кострома, Суздаль, Владимир.',
        itinerary: 'День 1: Москва - Сергиев Посад - Переславль-Залесский. День 2: Ростов Великий - Ярославль. День 3: Кострома - Суздаль. День 4: Владимир - Москва.',
        inclusions: 'Проживание в гостиницах, завтраки, транспортное обслуживание, экскурсии по программе, входные билеты в музеи.',
        exclusions: 'Проезд до Москвы, обеды и ужины, личные расходы.',
        imageUrls: [
          'https://images.unsplash.com/photo-1517169188433-6a4f3d1f3f1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8MXx8Z29sZGVuJTIwcmluZ3xlbnwwfHx8fDE2MTY2NjkzNjI&ixlib=rb-1.2.1&q=80&w=1080',
          'https://images.unsplash.com/photo-1593991463630-547e956b0ee1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyfDB8MXxzZWFyY2h8Mnx8c3V6ZGFsJTIwY3JlbWxpbnxlbnwwfHx8fDE2MTY2NjkzNjI&ixlib=rb-1.2.1&q=80&w=1080'
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