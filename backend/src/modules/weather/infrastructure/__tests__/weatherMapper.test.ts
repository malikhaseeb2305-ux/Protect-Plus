import { mapCurrentWeather, mapForecastDays } from '../weatherMapper';

describe('weatherMapper', () => {
  describe('mapCurrentWeather', () => {
    it('should correctly map OWM current response', () => {
      const raw = {
        main: { temp: 20.5, humidity: 65 },
        wind: { speed: 3.2 },
        weather: [{ description: 'clear sky', icon: '01d' }],
      };

      const result = mapCurrentWeather(raw);

      expect(result.temperature).toBe(20.5);
      expect(result.humidity).toBe(65);
      expect(result.windSpeed).toBe(3.2);
      expect(result.description).toBe('clear sky');
      expect(result.iconCode).toBe('01d');
      expect(result.iconUrl).toBe('https://openweathermap.org/img/wn/01d@2x.png');
    });
  });

  describe('mapForecastDays', () => {
    it('should aggregate 3-hour intervals into daily highs/lows', () => {
      // Use UTC timestamps that match dt_txt hours
      const nov14_06 = Date.UTC(2024, 10, 14, 6, 0, 0) / 1000;
      const nov14_12 = Date.UTC(2024, 10, 14, 12, 0, 0) / 1000;
      const nov14_18 = Date.UTC(2024, 10, 14, 18, 0, 0) / 1000;
      const nov15_12 = Date.UTC(2024, 10, 15, 12, 0, 0) / 1000;

      const raw = {
        list: [
          {
            dt: nov14_06,
            dt_txt: '2024-11-14 06:00:00',
            main: { temp: 8, temp_min: 6, temp_max: 10 },
            weather: [{ description: 'fog', icon: '50d' }],
          },
          {
            dt: nov14_12,
            dt_txt: '2024-11-14 12:00:00',
            main: { temp: 14, temp_min: 12, temp_max: 16 },
            weather: [{ description: 'clear sky', icon: '01d' }],
          },
          {
            dt: nov14_18,
            dt_txt: '2024-11-14 18:00:00',
            main: { temp: 11, temp_min: 9, temp_max: 13 },
            weather: [{ description: 'clouds', icon: '04d' }],
          },
          {
            dt: nov15_12,
            dt_txt: '2024-11-15 12:00:00',
            main: { temp: 5, temp_min: 3, temp_max: 7 },
            weather: [{ description: 'snow', icon: '13d' }],
          },
        ],
      };

      const result = mapForecastDays(raw);

      expect(result).toHaveLength(2);

      // Day 1: 2024-11-14
      expect(result[0].date).toBe('2024-11-14');
      expect(result[0].high).toBe(16);
      expect(result[0].low).toBe(6);
      // Should pick the 12:00 entry as representative
      expect(result[0].description).toBe('clear sky');
      expect(result[0].iconCode).toBe('01d');

      // Day 2: 2024-11-15
      expect(result[1].date).toBe('2024-11-15');
      expect(result[1].high).toBe(7);
      expect(result[1].low).toBe(3);
    });

    it('should limit to 5 days', () => {
      const items = [];
      for (let i = 0; i < 8; i++) {
        const date = `2024-11-${String(14 + i).padStart(2, '0')}`;
        items.push({
          dt: 1700000000 + i * 86400,
          dt_txt: `${date} 12:00:00`,
          main: { temp: 10 + i, temp_min: 8 + i, temp_max: 12 + i },
          weather: [{ description: 'clouds', icon: '04d' }],
        });
      }

      const result = mapForecastDays({ list: items });
      expect(result).toHaveLength(5);
    });
  });
});
