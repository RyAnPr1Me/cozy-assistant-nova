
import { toast } from "sonner";

const API_KEY = "4e3fb5d26945bd09ee75cffc885ce73a";
const API_URL = "http://api.weatherstack.com/current";

export interface WeatherData {
  location: {
    name: string;
    country: string;
    region: string;
    lat: string;
    lon: string;
    localtime: string;
  };
  current: {
    temperature: number;
    weather_descriptions: string[];
    weather_icons: string[];
    wind_speed: number;
    wind_dir: string;
    humidity: number;
    feelslike: number;
    uv_index: number;
    visibility: number;
    pressure: number;
  };
}

export async function getWeather(location: string): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${API_URL}?access_key=${API_KEY}&query=${encodeURIComponent(location)}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API request failed: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Weather API error: ${data.error.info}`);
    }
    
    return data as WeatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    toast.error("Failed to get weather information");
    return null;
  }
}
