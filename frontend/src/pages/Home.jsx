import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, FileText, Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { Header } from '../components/Header';

export default function Home() {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('p3.jpeg');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-based background image logic
  useEffect(() => {
    const updateBackground = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 5 && hour < 8) {
        setBackgroundImage('p1.jpeg');
      } else if (hour >= 8 && hour < 11) {
        setBackgroundImage('p2.jpeg');
      } else if (hour >= 11 && hour < 16) {
        setBackgroundImage('p3.jpeg');
      } else if (hour >= 16 && hour < 19) {
        setBackgroundImage('p4.jpeg');
      } else {
        setBackgroundImage('p5.jpeg');
      }
    };

    updateBackground();
    // Update every minute to check for time changes
    const interval = setInterval(updateBackground, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = 'bb0b8b639634c8a7a6c9faee7dca96e5';
        const LAT = 13.0293;
        const LON = 123.445;

        // Current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();

        // 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        // Get one forecast per day (at 12:00)
        const dailyForecasts = forecastData.list
          .filter((item) => item.dt_txt.includes('12:00:00'))
          .slice(0, 5);

        setWeather(currentData);
        setForecast(dailyForecasts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode >= 200 && weatherCode < 300) return CloudRain;
    if (weatherCode >= 300 && weatherCode < 600) return CloudRain;
    if (weatherCode >= 600 && weatherCode < 700) return CloudSnow;
    if (weatherCode >= 700 && weatherCode < 800) return Wind;
    if (weatherCode === 800) return Sun;
    return Cloud;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-16"
      style={{ backgroundImage: `url(/${backgroundImage})` }}
      data-testid="home-page"
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="MDRRMO PIO DURAN"
          subtitle="Public Preparedness for Disaster"
        />

        {/* Weather Widget - Minimized and positioned closer to header */}
        {!loading && weather && (
          <div className="px-4 pt-2 flex justify-end" data-testid="weather-widget-container">
            <div
              className="w-64 rounded-2xl border border-white/20 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] p-3"
              data-testid="weather-widget"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const WeatherIcon = getWeatherIcon(weather.weather[0].id);
                    return <WeatherIcon className="w-8 h-8 text-yellow-300 drop-shadow" />;
                  })()}
                  <div className="leading-tight">
                    <div className="text-white text-xl font-bold">
                      {Math.round(weather.main.temp)}°C
                    </div>
                    <div className="text-white/80 text-[10px]">
                      {Math.round((weather.main.temp * 9/5) + 32)}°F
                    </div>
                  </div>
                </div>
                <div className="text-white/90 text-[10px]">
                  {weather.weather[0].description}
                </div>
              </div>

              {/* 5-Day Forecast */}
              <div className="grid grid-cols-5 gap-1 mt-1 pt-1 border-t border-white/20">
                {forecast.map((day, index) => {
                  const WeatherIcon = getWeatherIcon(day.weather[0].id);
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="text-white text-[8px] font-bold">
                        {formatDate(day.dt)}
                      </div>
                      <WeatherIcon className="w-4 h-4 text-white/90 my-1" />
                      <div className="text-white text-[8px]">
                        {Math.round(day.main.temp)}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Reduced spacing and moved up */}
        <main className="flex-1 flex flex-col justify-center items-center px-4 text-center pt-4">
          {/* Main Slogan */}
          <h2 
            className="text-xl md:text-2xl font-bold leading-tight mb-2"
            style={{ 
              textShadow: '2px 2px 0px black, 3px 3px 4px rgba(0,0,0,0.8)',
            }}
            data-testid="main-slogan"
          >
            <span style={{ color: 'yellow', WebkitTextStroke: '1px black' }}>Resilient Pio Duran:</span><br />
            <span style={{ color: 'white', WebkitTextStroke: '1px black' }}>Prepared for Tomorrow</span>
          </h2>

          {/* Subtitle */}
          <p className="text-white text-xs md:text-sm mb-4 max-w-xs font-medium" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Enhancing disaster preparedness, strengthening community resilience and ensuring safety for all
          </p>

          {/* CTA Buttons */}
          <div className="space-y-2 w-full max-w-xs">
            <button
              onClick={() => navigate('/hotlines')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl transform hover:scale-105 text-sm"
              data-testid="emergency-hotline-btn"
            >
              <Phone className="w-4 h-4" />
              Emergency Hotline!
            </button>

            <button
              onClick={() => navigate('/report-incident')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl transform hover:scale-105 text-sm"
              data-testid="report-incident-btn"
            >
              <FileText className="w-4 h-4" />
              Report an Incident
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
