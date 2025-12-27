import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Cloud, AlertTriangle, Wind, Navigation, Gauge, RefreshCw } from 'lucide-react';

const mockTyphoonData = {
  name: 'Typhoon CARINA',
  localName: 'Gaemi',
  position: '15.2°N, 120.5°E',
  maxWindSpeed: '185 km/h',
  movement: 'West at 15 km/h',
  intensity: 'Severe Tropical Storm',
  pressure: '960 hPa',
  lastUpdate: new Date().toLocaleString('en-PH', { 
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short'
  }),
  forecast: [
    { time: '24h', position: '16.0°N, 119.0°E', intensity: 'Typhoon' },
    { time: '48h', position: '17.5°N, 117.5°E', intensity: 'Typhoon' },
    { time: '72h', position: '19.0°N, 116.0°E', intensity: 'Severe Tropical Storm' },
  ],
};

export default function TyphoonDashboard() {
  const [typhoonData, setTyphoonData] = useState(mockTyphoonData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTyphoonData({
        ...mockTyphoonData,
        lastUpdate: new Date().toLocaleString('en-PH', {
          timeZone: 'Asia/Manila',
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
      });
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100" data-testid="typhoon-dashboard-page">
      <Header title="TYPHOON DASHBOARD" showBack icon={Cloud} />
      
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Monitoring Alert */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3" data-testid="typhoon-alert">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h2 className="text-blue-950 font-bold text-lg">TYPHOON MONITORING</h2>
            <p className="text-slate-600 text-sm">Active weather disturbance detected</p>
          </div>
        </div>

        {/* Satellite Image */}
        <div className="satellite-container bg-white rounded-xl overflow-hidden" data-testid="satellite-container">
          <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
            <span className="text-blue-950 font-semibold text-sm">Live Update Himawari-8 Satellite Image</span>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-full hover:bg-slate-200 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
              data-testid="refresh-btn"
            >
              <RefreshCw className="w-4 h-4 text-blue-950" />
            </button>
          </div>
          <div className="relative">
            <img
              src="https://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif"
              alt="Himawari-8 Satellite Image"
              className="w-full h-auto"
              data-testid="satellite-image"
            />
            {/* Philippines boundary overlay indicator */}
            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Philippine Area of Responsibility
            </div>
          </div>
        </div>

        {/* Typhoon Tracking */}
        <div className="bg-white rounded-xl overflow-hidden" data-testid="typhoon-tracking">
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <h3 className="text-red-700 font-bold text-lg">Typhoon Tracking</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            <InfoRow 
              label="Typhoon Name" 
              value={`${typhoonData.name} (${typhoonData.localName})`}
              highlight
            />
            <InfoRow label="Current Position" value={typhoonData.position} />
            <InfoRow label="Max Wind Speed" value={typhoonData.maxWindSpeed} icon={Wind} />
            <InfoRow label="Movement" value={typhoonData.movement} icon={Navigation} />
            <InfoRow label="Intensity" value={typhoonData.intensity} icon={Gauge} highlight />
            <InfoRow label="Central Pressure" value={typhoonData.pressure} />
          </div>
        </div>

        {/* Forecast Track */}
        <div className="bg-white rounded-xl overflow-hidden" data-testid="forecast-track">
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h3 className="text-blue-950 font-bold text-lg">Forecast Track</h3>
          </div>
          
          <div className="p-4 space-y-3">
            {typhoonData.forecast.map((point, index) => (
              <div 
                key={point.time}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                data-testid={`forecast-${point.time}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {point.time}
                  </div>
                  <span className="text-slate-600 text-sm">{point.position}</span>
                </div>
                <span className="text-blue-950 font-medium text-sm">{point.intensity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Update */}
        <p className="text-center text-slate-500 text-xs" data-testid="last-update">
          Last updated: {typhoonData.lastUpdate}
        </p>
      </main>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, highlight }) {
  return (
    <div className="flex items-center justify-between p-4 typhoon-info-card">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-950" />}
        <span className="text-slate-600 text-sm">{label}</span>
      </div>
      <span className={`font-semibold text-sm ${highlight ? 'text-red-600' : 'text-blue-950'}`}>
        {value}
      </span>
    </div>
  );
}
