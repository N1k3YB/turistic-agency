import EditDestinationClient from './EditDestinationClient';

// Это серверный компонент, который получает параметры из URL
export default async function EditDestinationPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <EditDestinationClient destinationId={id} />;
} 