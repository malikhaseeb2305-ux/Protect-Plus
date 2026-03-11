'use client';

import { FormEvent, useState } from 'react';

import Button from '@/shared/ui/atoms/Button';
import FormField from '@/shared/ui/atoms/FormField';
import { useToast } from '@/providers/ToastProvider';
import { extractApiError } from '@/shared/lib/extractApiError';

import { useCreateLocation } from '../hooks/useCreateLocation';
import styles from './LocationForm.module.css';

export default function LocationForm() {
  const [cityName, setCityName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const create = useCreateLocation();
  const { showToast } = useToast();

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!cityName.trim()) errs.cityName = 'City name is required';
    if (!countryCode.trim() || countryCode.trim().length < 2)
      errs.countryCode = '2-3 character country code required';
    if (!lat.trim() || isNaN(Number(lat))) errs.lat = 'Valid latitude required';
    if (!lon.trim() || isNaN(Number(lon))) errs.lon = 'Valid longitude required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    create.mutate(
      {
        cityName: cityName.trim(),
        countryCode: countryCode.trim().toUpperCase(),
        lat: Number(lat),
        lon: Number(lon),
      },
      {
        onSuccess: () => {
          setCityName('');
          setCountryCode('');
          setLat('');
          setLon('');
          setErrors({});
          showToast('Location added successfully', 'success');
        },
        onError: (err) => showToast(extractApiError(err), 'error'),
      },
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h3 className={styles.heading}>Add Location</h3>
      <div className={styles.grid}>
        <FormField
          label="City Name"
          placeholder="London"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          error={errors.cityName}
        />
        <FormField
          label="Country Code"
          placeholder="GB"
          maxLength={3}
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          error={errors.countryCode}
        />
        <FormField
          label="Latitude"
          placeholder="51.5074"
          type="number"
          step="any"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          error={errors.lat}
        />
        <FormField
          label="Longitude"
          placeholder="-0.1278"
          type="number"
          step="any"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          error={errors.lon}
        />
      </div>

      <Button type="submit" loading={create.isPending}>
        Add location
      </Button>
    </form>
  );
}
