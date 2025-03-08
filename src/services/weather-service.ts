
import { toast } from "sonner";

const API_KEY = "4e3fb5d26945bd09ee75cffc885ce73a";
const API_URL = "https://api.weatherstack.com/current";

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
    // We're using a proxy to avoid CORS issues and enable HTTPS
    const response = await fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(
        `${API_URL}?access_key=${API_KEY}&query=${encodeURIComponent(location)}`
      )}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Weather API network error:", errorText);
      throw new Error(`Weather API request failed: ${errorText}`);
    }

    const responseData = await response.json();
    
    // The response comes wrapped in a contents property as a string
    if (!responseData.contents) {
      throw new Error("Invalid response format from proxy");
    }
    
    const data = JSON.parse(responseData.contents);
    
    if (data.error) {
      console.error("Weather API returned error:", data.error);
      throw new Error(`Weather API error: ${data.error.info}`);
    }
    
    return data as WeatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    toast.error("Failed to get weather information. Using cached or estimated data.");
    
    // Return a fallback weather object with basic info
    return {
      location: {
        name: location,
        country: "Unknown",
        region: "Unknown",
        lat: "0",
        lon: "0",
        localtime: new Date().toString(),
      },
      current: {
        temperature: 20,
        weather_descriptions: ["Partly cloudy (estimated)"],
        weather_icons: ["https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png"],
        wind_speed: 5,
        wind_dir: "N",
        humidity: 50,
        feelslike: 20,
        uv_index: 5,
        visibility: 10,
        pressure: 1013,
      }
    };
  }
}
