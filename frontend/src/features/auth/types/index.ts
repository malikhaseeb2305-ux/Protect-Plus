export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  email: string;
  preferences: {
    temperatureUnit: 'C' | 'F';
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserDto;
}

export interface UpdateSettingsRequest {
  temperatureUnit?: 'C' | 'F';
}
