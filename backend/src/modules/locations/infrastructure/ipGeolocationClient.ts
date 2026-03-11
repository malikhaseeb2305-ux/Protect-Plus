import { logger } from '../../../shared/logger';

interface IpGeoResult {
  city: string;
  countryCode: string;
  lat: number;
  lon: number;
}

export async function geolocateByIp(clientIp: string): Promise<IpGeoResult> {
  const isLocalIp = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(clientIp);
  const url = isLocalIp
    ? 'http://ip-api.com/json/?fields=status,message,city,countryCode,lat,lon'
    : `http://ip-api.com/json/${clientIp}?fields=status,message,city,countryCode,lat,lon`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`IP geolocation service returned ${response.status}`);
  }

  const data = await response.json() as {
    status: string;
    message?: string;
    city?: string;
    countryCode?: string;
    lat?: number;
    lon?: number;
  };

  if (data.status !== 'success') {
    throw new Error(`IP geolocation failed: ${data.message || 'unknown error'}`);
  }

  if (!data.city || !data.countryCode || data.lat === undefined || data.lon === undefined) {
    throw new Error('IP geolocation returned incomplete data');
  }

  logger.info('IP geolocation resolved', {
    ip: isLocalIp ? 'localhost (public IP used)' : clientIp,
    city: data.city,
    country: data.countryCode,
  });

  return {
    city: data.city,
    countryCode: data.countryCode,
    lat: data.lat,
    lon: data.lon,
  };
}
