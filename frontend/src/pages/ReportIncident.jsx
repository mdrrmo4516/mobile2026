import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { AlertTriangle, Calendar, Clock, MapPin, Send, X, Camera, WifiOff, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import offlineQueue from '../utils/offlineQueue';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const incidentTypes = [
  'Flooding',
  'Landslide',
  'Fire',
  'Road Accident',
  'Building Collapse',
  'Power Outage',
  'Medical Emergency',
  'Typhoon Damage',
  'Other',
];

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function ReportIncident() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    incidentType: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    description: '',
    reporterPhone: '',
  });
  const [position, setPosition] = useState([13.0547, 123.5214]); // Pio Duran coordinates
  const [submitted, setSubmitted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach((file) => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              data: event.target.result,
              name: file.name,
              size: file.size,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input
    e.target.value = '';
  };

  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If logged in and user has a phone, prefill it (editable)
  useEffect(() => {
    if (user?.phone && !formData.reporterPhone) {
      setFormData((p) => ({ ...p, reporterPhone: user.phone }));
    }
  }, [user?.phone, formData.reporterPhone]);

  const removeImage = (imageId) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const reportData = {
      incidentType: formData.incidentType,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      reporter_phone: formData.reporterPhone || undefined,
      location: {
        latitude: position[0],
        longitude: position[1],
      },
      images: uploadedImages,
      timestamp: new Date().toISOString(),
    };

    try {
      if (navigator.onLine) {
        // Try to submit directly if online
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/incidents`,
          {
            incidentType: formData.incidentType,
            date: formData.date,
            time: formData.time,
            description: formData.description,
            reporter_phone: formData.reporterPhone || undefined,
            location: {
              latitude: position[0],
              longitude: position[1],
            },
            images: uploadedImages,
            timestamp: new Date().toISOString(),
          }
        );
        
        if (response.status === 200 || response.status === 201) {
          console.log('Incident report submitted successfully:', response.data);
          setSubmitted(true);
          
          setTimeout(() => {
            setSubmitted(false);
            resetForm();
          }, 3000);
        }
      } else {
        // Add to offline queue if offline
        await offlineQueue.addIncident(reportData);
        console.log('Incident report added to offline queue');
        setSubmitted(true);
        
        setTimeout(() => {
          setSubmitted(false);
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit incident report:', error);
      
      // If online submission fails, add to queue
      try {
        await offlineQueue.addIncident(reportData);
        console.log('Incident report queued for later sync');
        setSubmitted(true);
        
        setTimeout(() => {
          setSubmitted(false);
          resetForm();
        }, 3000);
      } catch (queueError) {
        console.error('Failed to queue incident report:', queueError);
        alert('Failed to save incident report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      incidentType: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      description: '',
      reporterPhone: user?.phone || '',
    });
    setUploadedImages([]);
    setPosition([13.0547, 123.5214]);
  };

  return (
    <div className="min-h-screen bg-slate-100" data-testid="report-incident-page">
      <Header title="REPORT AN INCIDENT" showBack icon={AlertTriangle} />
      
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {submitted && (
          <div className={`mb-4 ${isOffline ? 'bg-yellow-500' : 'bg-green-500'} text-white p-4 rounded-xl flex items-center gap-3 animate-fadeIn`} data-testid="success-message">
            {isOffline ? <WifiOff className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            <div>
              <p className="font-semibold">
                {isOffline ? 'Report queued for sync' : 'Report submitted successfully!'}
              </p>
              {isOffline && (
                <p className="text-xs mt-1 opacity-90">
                  Will be synced when connection is restored
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="incident-form">
          {/* Incident Type */}
          <div>
            <label className="block text-blue-950 font-semibold text-sm mb-2">
              INCIDENT TYPE
            </label>
            <select
              value={formData.incidentType}
              onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
              className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 text-slate-700 focus:border-yellow-500 transition-colors"
              required
              data-testid="incident-type-select"
            >
              <option value="">Select incident type</option>
              {incidentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Reporter Phone */}
          <div>
            <label className="block text-blue-950 font-semibold text-sm mb-2">
              PHONE (Optional)
            </label>
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-950" />
              <input
                type="tel"
                value={formData.reporterPhone}
                onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                placeholder="e.g., 0917-000-0000"
                className="flex-1 text-slate-700 bg-transparent focus:outline-none"
                data-testid="reporter-phone-input"
              />
            </div>
          </div>

          {/* Time of Incident */}
          <div>
            <label className="block text-blue-950 font-semibold text-sm mb-2">
              TIME OF INCIDENT
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-950" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="flex-1 text-slate-700 bg-transparent focus:outline-none"
                  data-testid="incident-date-input"
                />
              </div>
              <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-950" />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="flex-1 text-slate-700 bg-transparent focus:outline-none"
                  data-testid="incident-time-input"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-blue-950 font-semibold text-sm mb-2">
              LOCATION
            </label>
            <div className="map-container h-[200px] mb-2" data-testid="location-map">
              <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-950" />
                <span className="text-slate-700 text-sm">
                  {position[0].toFixed(4)}, {position[1].toFixed(4)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPosition([13.0547, 123.5214])}
                className="text-yellow-600 text-sm font-medium hover:text-yellow-700"
                data-testid="reset-location-btn"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-blue-950 font-semibold text-sm mb-2">
              UPLOAD IMAGES (Optional)
            </label>
            
            {/* Upload Button */}
            <label className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-all">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                data-testid="image-upload-input"
              />
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-slate-600 text-sm font-medium">
                Tap to upload photos
              </span>
              <span className="text-slate-400 text-xs mt-1">
                Multiple images supported
              </span>
            </label>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    className="bg-white border-2 border-slate-200 rounded-xl p-2 flex items-center gap-3"
                    data-testid="uploaded-image-preview"
                  >
                    {/* Thumbnail */}
                    <img
                      src={image.data}
                      alt={image.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm font-medium truncate">
                        {image.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      data-testid="remove-image-btn"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <div className="text-slate-500 text-xs text-center pt-1">
                  {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-blue-950 font-semibold text-sm mb-2">
              DESCRIPTION
            </label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
                placeholder="Please provide a detailed description of what happened..."
                className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 text-slate-700 min-h-[120px] resize-none focus:border-yellow-500 transition-colors"
                maxLength={500}
                data-testid="description-textarea"
              />
              <span className="absolute bottom-3 right-3 text-slate-400 text-xs">
                {formData.description.length}/500
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-white border-2 border-slate-300 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 transition-colors"
              data-testid="cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600/80 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="submit-report-btn"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  {isOffline && <WifiOff className="w-5 h-5" />}
                  <span>{isOffline ? 'Queue Report' : 'Submit Report'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
