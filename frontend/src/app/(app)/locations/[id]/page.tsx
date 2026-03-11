import LocationDetail from '@/features/locations/organisms/LocationDetail';

interface LocationPageProps {
  params: Promise<{ id: string }>;
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { id } = await params;
  return <LocationDetail locationId={id} />;
}
