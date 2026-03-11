'use client';

import Link from 'next/link';

import Card from '@/shared/ui/atoms/Card';
import MiniWeather from '@/features/weather/molecules/MiniWeather';

import LocationName from '../atoms/LocationName';
import type { LocationDto } from '../types';
import styles from './LocationCard.module.css';

interface LocationCardProps {
  location: LocationDto;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Link href={`/locations/${location.id}`} className={styles.link}>
      <Card className={styles.card}>
        <LocationName
          cityName={location.cityName}
          countryCode={location.countryCode}
          isCurrentLocation={location.isCurrentLocation}
        />
        <MiniWeather locationId={location.id} />
      </Card>
    </Link>
  );
}
