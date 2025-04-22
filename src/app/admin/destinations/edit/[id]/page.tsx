import EditDestinationClient from './EditDestinationClient';

// Это серверный компонент, который получает параметры из URL
export default function EditDestinationPage({ params }: { params: { id: string } }) {
  return <EditDestinationClient destinationId={params.id} />;
} 