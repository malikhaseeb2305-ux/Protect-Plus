'use client';

import Card from '@/shared/ui/atoms/Card';
import Spinner from '@/shared/ui/atoms/Spinner';

import { useLocations } from '../hooks/useLocations';
import LocationCard from '../molecules/LocationCard';
import LocationForm from '../molecules/LocationForm';
import DetectLocationButton from '../molecules/DetectLocationButton';
import styles from './LocationsGrid.module.css';

export default function LocationsGrid() {
  const { data: locations, isLoading, error } = useLocations();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Locations</h2>
        <DetectLocationButton />
      </div>

      {isLoading && (
        <div className={styles.center}>
          <Spinner />
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          Failed to load locations. Please try again.
        </p>
      )}

      {locations && locations.length === 0 && (
        <p className={styles.empty}>
          No locations yet. Add one below or detect your current location.
        </p>
      )}

      {locations && locations.length > 0 && (
        <div className={styles.grid}>
          {locations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </div>
      )}

      <Card className={styles.addCard}>
        <LocationForm />
      </Card>
    </section>
  );
}
