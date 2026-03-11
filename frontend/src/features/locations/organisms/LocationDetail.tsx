'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import WeatherDetailPanel from '@/features/weather/organisms/WeatherDetailPanel';
import AlertRuleList from '@/features/rules/organisms/AlertRuleList';
import Button from '@/shared/ui/atoms/Button';
import { useToast } from '@/providers/ToastProvider';

import { useLocations } from '../hooks/useLocations';
import { useDeleteLocation } from '../hooks/useDeleteLocation';
import LocationName from '../atoms/LocationName';
import styles from './LocationDetail.module.css';

interface LocationDetailProps {
  locationId: string;
}

export default function LocationDetail({ locationId }: LocationDetailProps) {
  const router = useRouter();
  const { data: locations, isLoading } = useLocations();
  const deleteMutation = useDeleteLocation();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const location = locations?.find((l) => l.id === locationId);

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteMutation.mutate(locationId, {
      onSuccess: () => {
        showToast('Location deleted', 'success');
        router.push('/dashboard');
      },
      onError: () => showToast('Failed to delete location', 'error'),
    });
  }

  if (isLoading) {
    return <p className={styles.loading}>Loading location...</p>;
  }

  if (!location) {
    return (
      <div className={styles.notFound}>
        <p>Location not found.</p>
        <Link href="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backLink}>
            &larr; Dashboard
          </Link>
          <h1 className={styles.title}>
            <LocationName
              cityName={location.cityName}
              countryCode={location.countryCode}
              isCurrentLocation={location.isCurrentLocation}
            />
          </h1>
        </div>
        <div className={styles.actions}>
          <Button
            variant={confirmDelete ? 'danger' : 'ghost'}
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            {confirmDelete ? 'Confirm delete' : 'Delete'}
          </Button>
          {confirmDelete && (
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <WeatherDetailPanel locationId={locationId} />

      <AlertRuleList locationId={locationId} />
    </div>
  );
}
