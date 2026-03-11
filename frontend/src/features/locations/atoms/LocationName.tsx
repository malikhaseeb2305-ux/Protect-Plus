import styles from './LocationName.module.css';

interface LocationNameProps {
  cityName: string;
  countryCode: string;
  isCurrentLocation?: boolean;
}

export default function LocationName({ cityName, countryCode, isCurrentLocation }: LocationNameProps) {
  return (
    <span className={styles.name}>
      {cityName}, {countryCode}
      {isCurrentLocation && <span className={styles.badge} title="Current location">&#x1F4CD;</span>}
    </span>
  );
}
