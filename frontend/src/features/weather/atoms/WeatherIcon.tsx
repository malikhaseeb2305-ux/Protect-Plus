import styles from './WeatherIcon.module.css';

interface WeatherIconProps {
  iconUrl: string;
  description: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WeatherIcon({ iconUrl, description, size = 'md' }: WeatherIconProps) {
  return (
    <img
      src={iconUrl}
      alt={description}
      className={`${styles.icon} ${styles[size]}`}
      loading="lazy"
    />
  );
}
