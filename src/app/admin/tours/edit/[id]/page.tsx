import { EditTourClient } from './EditTourClient';

export default async function EditTourPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <EditTourClient tourId={id} />;
}

