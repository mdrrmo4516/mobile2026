import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Shield, Search, RefreshCw, Trash2, Eye, Save, Plus, PhoneCall, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const normalizeStatus = (status) => {
  if (!status) return 'new';
  if (status === 'pending') return 'new';
  return status;
};

const statusBadge = (status) => {
  const s = normalizeStatus(status);
  const map = {
    new: 'bg-sky-100 text-sky-800 border-sky-200',
    'in-progress': 'bg-amber-100 text-amber-800 border-amber-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  return map[s] || 'bg-slate-100 text-slate-700 border-slate-200';
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();

  const [tab, setTab] = useState('incidents');

  // Incidents
  const [incidents, setIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [incidentsError, setIncidentsError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentEdit, setIncidentEdit] = useState({ status: 'new', internal_notes: '' });
  const [incidentSaving, setIncidentSaving] = useState(false);

  // Hotlines
  const [hotlines, setHotlines] = useState([]);
  const [hotlinesLoading, setHotlinesLoading] = useState(false);
  const [hotlinesError, setHotlinesError] = useState('');
  const [hotlineForm, setHotlineForm] = useState({ id: null, label: '', number: '', category: '' });
  const [hotlineSaving, setHotlineSaving] = useState(false);

  // Locations
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationForm, setLocationForm] = useState({
    id: null,
    type: 'evacuation',
    name: '',
    address: '',
    lat: 13.0547,
    lng: 123.5214,
    capacity: '',
    services: '',
    hotline: ''
  });
  const [locationSaving, setLocationSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user?.is_admin) {
      // keep page render but show access denied
      return;
    }

    // initial data
    refreshIncidents();
    refreshHotlines();
    refreshLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, user?.is_admin]);

  const refreshIncidents = async () => {
    setIncidentsLoading(true);
    setIncidentsError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (query) params.q = query;
      const res = await api.get('/api/admin/incidents', { params });
      setIncidents(res.data.incidents || []);
    } catch (e) {
      setIncidentsError(e.response?.data?.detail || 'Failed to load incidents');
    } finally {
      setIncidentsLoading(false);
    }
  };

  const openIncident = async (incidentId) => {
    try {
      const res = await api.get(`/api/admin/incidents/${incidentId}`);
      setSelectedIncident(res.data.incident);
      const s = normalizeStatus(res.data.incident?.status);
      setIncidentEdit({
        status: s,
        internal_notes: res.data.incident?.internal_notes || '',
      });
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to load incident');
    }
  };

  const saveIncident = async () => {
    if (!selectedIncident?.id) return;
    setIncidentSaving(true);
    try {
      const payload = {
        status: incidentEdit.status,
        internal_notes: incidentEdit.internal_notes,
      };
      const res = await api.patch(`/api/admin/incidents/${selectedIncident.id}`, payload);
      setSelectedIncident(res.data.incident);
      await refreshIncidents();
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update incident');
    } finally {
      setIncidentSaving(false);
    }
  };

  const deleteIncident = async (incidentId) => {
    if (!window.confirm('Delete this incident report? This cannot be undone.')) return;
    try {
      await api.delete(`/api/admin/incidents/${incidentId}`);
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(null);
      }
      await refreshIncidents();
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete incident');
    }
  };

  const refreshHotlines = async () => {
    setHotlinesLoading(true);
    setHotlinesError('');
    try {
      const res = await api.get('/api/admin/hotlines');
      setHotlines(res.data.hotlines || []);
    } catch (e) {
      setHotlinesError(e.response?.data?.detail || 'Failed to load hotlines');
    } finally {
      setHotlinesLoading(false);
    }
  };

  const startEditHotline = (hotline) => {
    setHotlineForm({
      id: hotline.id,
      label: hotline.label || '',
      number: hotline.number || '',
      category: hotline.category || '',
    });
  };

  const resetHotlineForm = () => {
    setHotlineForm({ id: null, label: '', number: '', category: '' });
  };

  const saveHotline = async (e) => {
    e.preventDefault();
    setHotlineSaving(true);
    try {
      const payload = {
        label: hotlineForm.label,
        number: hotlineForm.number,
        category: hotlineForm.category,
      };

      if (hotlineForm.id) {
        await api.put(`/api/admin/hotlines/${hotlineForm.id}`, payload);
      } else {
        await api.post('/api/admin/hotlines', payload);
      }

      resetHotlineForm();
      await refreshHotlines();
    } catch (e2) {
      alert(e2.response?.data?.detail || 'Failed to save hotline');
    } finally {
      setHotlineSaving(false);
    }
  };

  const deleteHotline = async (hotlineId) => {
    if (!window.confirm('Delete this hotline number?')) return;
    try {
      await api.delete(`/api/admin/hotlines/${hotlineId}`);
      if (hotlineForm.id === hotlineId) resetHotlineForm();
      await refreshHotlines();
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete hotline');
    }
  };

  // Location functions
  const refreshLocations = async () => {
    setLocationsLoading(true);
    setLocationsError('');
    try {
      const params = {};
      if (locationTypeFilter) params.location_type = locationTypeFilter;
      const res = await api.get('/api/admin/locations', { params });
      setLocations(res.data.locations || []);
    } catch (e) {
      setLocationsError(e.response?.data?.detail || 'Failed to load locations');
    } finally {
      setLocationsLoading(false);
    }
  };

  const startEditLocation = (location) => {
    setLocationForm({
      id: location.id,
      type: location.type || 'evacuation',
      name: location.name || '',
      address: location.address || '',
      lat: location.lat || 13.0547,
      lng: location.lng || 123.5214,
      capacity: location.capacity || '',
      services: location.services || '',
      hotline: location.hotline || ''
    });
    setShowMapPicker(false);
  };

  const resetLocationForm = () => {
    setLocationForm({
      id: null,
      type: 'evacuation',
      name: '',
      address: '',
      lat: 13.0547,
      lng: 123.5214,
      capacity: '',
      services: '',
      hotline: ''
    });
    setShowMapPicker(false);
  };

  const saveLocation = async (e) => {
    e.preventDefault();
    setLocationSaving(true);
    try {
      const payload = {
        type: locationForm.type,
        name: locationForm.name,
        address: locationForm.address,
        lat: parseFloat(locationForm.lat),
        lng: parseFloat(locationForm.lng),
        capacity: locationForm.capacity || undefined,
        services: locationForm.services || undefined,
        hotline: locationForm.hotline || undefined
      };

      if (locationForm.id) {
        await api.put(`/api/admin/locations/${locationForm.id}`, payload);
      } else {
        await api.post('/api/admin/locations', payload);
      }

      resetLocationForm();
      await refreshLocations();
    } catch (e2) {
      alert(e2.response?.data?.detail || 'Failed to save location');
    } finally {
      setLocationSaving(false);
    }
  };

  const deleteLocation = async (locationId) => {
    if (!window.confirm('Delete this facility location?')) return;
    try {
      await api.delete(`/api/admin/locations/${locationId}`);
      if (locationForm.id === locationId) resetLocationForm();
      await refreshLocations();
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete location');
    }
  };

  // Map picker component
  const LocationMapPicker = () => {
    const MapClickHandler = () => {
      useMapEvents({
        click: (e) => {
          setLocationForm(prev => ({
            ...prev,
            lat: e.latlng.lat.toFixed(6),
            lng: e.latlng.lng.toFixed(6)
          }));
        }
      });
      return null;
    };

    return (
      <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden" style={{ height: '300px' }}>
        <MapContainer
          center={[parseFloat(locationForm.lat) || 13.0547, parseFloat(locationForm.lng) || 123.5214]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={[parseFloat(locationForm.lat) || 13.0547, parseFloat(locationForm.lng) || 123.5214]} />
          <MapClickHandler />
        </MapContainer>
      </div>
    );
  };

  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((loc) => {
      const hay = `${loc.name || ''} ${loc.address || ''} ${loc.type || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [locations, locationQuery]);

  const filteredIncidents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return incidents;
    return incidents.filter((it) => {
      const hay = `${it.incident_type || ''} ${it.description || ''} ${it.reporter_phone || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [incidents, query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100" data-testid="admin-dashboard-loading">
        <Header title="ADMIN" showBack icon={Shield} />
        <div className="p-6 text-slate-700">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-slate-100" data-testid="admin-dashboard-access-denied">
        <Header title="ADMIN" showBack icon={Shield} />
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="text-slate-900 font-bold text-lg" data-testid="admin-denied-title">Access denied</h2>
            <p className="text-slate-600 text-sm mt-1" data-testid="admin-denied-subtitle">
              Your account is not marked as an admin.
            </p>
            <div className="mt-4">
              <button
                className="bg-blue-950 text-white px-4 py-2 rounded-xl"
                onClick={() => navigate('/dashboard')}
                data-testid="admin-denied-back-dashboard"
                type="button"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100" data-testid="admin-dashboard-page">
      <Header title="ADMIN DASHBOARD" showBack icon={Shield} />

      <main className="px-4 py-6 max-w-5xl mx-auto space-y-4">
        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 flex gap-2" data-testid="admin-tabs">
          <button
            type="button"
            onClick={() => setTab('incidents')}
            className={`flex-1 py-2.5 rounded-xl font-semibold ${tab === 'incidents' ? 'bg-yellow-500 text-blue-950' : 'text-slate-700 hover:bg-slate-50'}`}
            data-testid="admin-tab-incidents"
          >
            Incident Reports
          </button>
          <button
            type="button"
            onClick={() => setTab('hotlines')}
            className={`flex-1 py-2.5 rounded-xl font-semibold ${tab === 'hotlines' ? 'bg-yellow-500 text-blue-950' : 'text-slate-700 hover:bg-slate-50'}`}
            data-testid="admin-tab-hotlines"
          >
            Hotline Numbers
          </button>
          <button
            type="button"
            onClick={() => setTab('locations')}
            className={`flex-1 py-2.5 rounded-xl font-semibold ${tab === 'locations' ? 'bg-yellow-500 text-blue-950' : 'text-slate-700 hover:bg-slate-50'}`}
            data-testid="admin-tab-locations"
          >
            Facility Locations
          </button>
        </div>

        {tab === 'incidents' ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="admin-incidents-section">
            {/* List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4" data-testid="admin-incidents-list-card">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-slate-900 font-bold" data-testid="admin-incidents-title">Incident Reports</h2>
                  <p className="text-slate-500 text-xs" data-testid="admin-incidents-hint">Search, open, update status/notes, or delete.</p>
                </div>
                <button
                  type="button"
                  onClick={refreshIncidents}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  data-testid="admin-incidents-refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${incidentsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="admin-incidents-filters">
                <div className="md:col-span-2 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by type, description, phone…"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    data-testid="admin-incidents-search"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                  data-testid="admin-incidents-status-filter"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3">
                {incidentsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3" data-testid="admin-incidents-error">
                    {incidentsError}
                  </div>
                ) : null}

                <div className="mt-3 space-y-2" data-testid="admin-incidents-list">
                  {filteredIncidents.map((it) => (
                    <div
                      key={it.id}
                      className={`border rounded-2xl p-3 flex items-center justify-between gap-3 ${selectedIncident?.id === it.id ? 'border-yellow-500 bg-yellow-50/30' : 'border-slate-200 bg-white'}`}
                      data-testid={`admin-incident-row-${it.id}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-900 font-semibold" data-testid={`admin-incident-type-${it.id}`}>{it.incident_type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(it.status)}`} data-testid={`admin-incident-status-${it.id}`}>
                            {normalizeStatus(it.status)}
                          </span>
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5" data-testid={`admin-incident-meta-${it.id}`}>
                          {it.date} {it.time} • {Number(it.latitude).toFixed(4)}, {Number(it.longitude).toFixed(4)}
                          {it.reporter_phone ? ` • ${it.reporter_phone}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                          onClick={() => openIncident(it.id)}
                          data-testid={`admin-incident-open-${it.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => deleteIncident(it.id)}
                          data-testid={`admin-incident-delete-${it.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {!incidentsLoading && filteredIncidents.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center py-10" data-testid="admin-incidents-empty">
                      No incident reports found.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4" data-testid="admin-incident-details-card">
              <h3 className="text-slate-900 font-bold" data-testid="admin-incident-details-title">Details</h3>

              {!selectedIncident ? (
                <div className="text-slate-500 text-sm mt-2" data-testid="admin-incident-details-empty">
                  Select an incident to view and update.
                </div>
              ) : (
                <div className="mt-3 space-y-3" data-testid="admin-incident-details-content">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3" data-testid="admin-incident-details-summary">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-900" data-testid="admin-incident-details-type">{selectedIncident.incident_type}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(selectedIncident.status)}`} data-testid="admin-incident-details-status-badge">
                        {normalizeStatus(selectedIncident.status)}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs mt-1" data-testid="admin-incident-details-meta">
                      {selectedIncident.date} {selectedIncident.time}
                    </div>
                    <div className="text-slate-600 text-xs mt-1" data-testid="admin-incident-details-location">
                      {Number(selectedIncident.latitude).toFixed(5)}, {Number(selectedIncident.longitude).toFixed(5)}
                    </div>
                    {selectedIncident.reporter_phone ? (
                      <a
                        href={`tel:${String(selectedIncident.reporter_phone).replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-2 text-xs mt-2 text-blue-950 font-semibold"
                        data-testid="admin-incident-details-call"
                      >
                        <PhoneCall className="w-4 h-4" />
                        Call reporter
                      </a>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs font-semibold">STATUS</label>
                    <select
                      value={incidentEdit.status}
                      onChange={(e) => setIncidentEdit((p) => ({ ...p, status: e.target.value }))}
                      className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                      data-testid="admin-incident-status-select"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs font-semibold">INTERNAL NOTES</label>
                    <textarea
                      value={incidentEdit.internal_notes}
                      onChange={(e) => setIncidentEdit((p) => ({ ...p, internal_notes: e.target.value }))}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[140px] focus:outline-none focus:border-yellow-500"
                      placeholder="Add internal notes for responders/admins…"
                      data-testid="admin-incident-notes-textarea"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 text-xs font-semibold">DESCRIPTION</label>
                    <div className="mt-1 text-slate-700 text-sm bg-slate-50 border border-slate-200 rounded-xl p-3" data-testid="admin-incident-description">
                      {selectedIncident.description || '—'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={saveIncident}
                    disabled={incidentSaving}
                    className="w-full bg-blue-950 text-white font-semibold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    data-testid="admin-incident-save-button"
                  >
                    <Save className="w-4 h-4" />
                    {incidentSaving ? 'Saving…' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIncident(null);
                      setIncidentEdit({ status: 'new', internal_notes: '' });
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50"
                    data-testid="admin-incident-close-button"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : tab === 'hotlines' ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="admin-hotlines-section">
            {/* List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4" data-testid="admin-hotlines-list-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-slate-900 font-bold" data-testid="admin-hotlines-title">Hotline Numbers</h2>
                  <p className="text-slate-500 text-xs" data-testid="admin-hotlines-hint">Add/edit/delete hotline entries. Changes reflect in the public Hotline Numbers module.</p>
                </div>
                <button
                  type="button"
                  onClick={refreshHotlines}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  data-testid="admin-hotlines-refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${hotlinesLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {hotlinesError ? (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3" data-testid="admin-hotlines-error">
                  {hotlinesError}
                </div>
              ) : null}

              <div className="mt-3 space-y-2" data-testid="admin-hotlines-list">
                {hotlines.map((h) => (
                  <div key={h.id} className="border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3" data-testid={`admin-hotline-row-${h.id}`}>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate" data-testid={`admin-hotline-label-${h.id}`}>{h.label}</div>
                      <div className="text-slate-600 text-xs mt-0.5" data-testid={`admin-hotline-number-${h.id}`}>{h.number} • <span className="font-medium">{h.category}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold"
                        onClick={() => startEditHotline(h)}
                        data-testid={`admin-hotline-edit-${h.id}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => deleteHotline(h.id)}
                        data-testid={`admin-hotline-delete-${h.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {!hotlinesLoading && hotlines.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center py-10" data-testid="admin-hotlines-empty">
                    No hotlines found.
                  </div>
                ) : null}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4" data-testid="admin-hotlines-form-card">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 font-bold" data-testid="admin-hotlines-form-title">
                  {hotlineForm.id ? 'Edit Hotline' : 'Add Hotline'}
                </h3>
                <button
                  type="button"
                  onClick={resetHotlineForm}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  data-testid="admin-hotlines-form-reset"
                  title="Reset"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <form onSubmit={saveHotline} className="mt-3 space-y-3" data-testid="admin-hotlines-form">
                <div>
                  <label className="text-slate-700 text-xs font-semibold">LABEL</label>
                  <input
                    value={hotlineForm.label}
                    onChange={(e) => setHotlineForm((p) => ({ ...p, label: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., MDRRMO Office"
                    required
                    data-testid="admin-hotlines-label-input"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-semibold">NUMBER</label>
                  <input
                    value={hotlineForm.number}
                    onChange={(e) => setHotlineForm((p) => ({ ...p, number: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., 0917-000-0000"
                    required
                    data-testid="admin-hotlines-number-input"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-semibold">CATEGORY</label>
                  <input
                    value={hotlineForm.category}
                    onChange={(e) => setHotlineForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., emergency / police / fire / medical / local / social"
                    required
                    data-testid="admin-hotlines-category-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={hotlineSaving}
                  className="w-full bg-blue-950 text-white font-semibold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="admin-hotlines-save-button"
                >
                  <Save className="w-4 h-4" />
                  {hotlineSaving ? 'Saving…' : 'Save'}
                </button>
              </form>
            </div>
          </section>
        ) : tab === 'locations' ? (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="admin-locations-section">
            {/* List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4" data-testid="admin-locations-list-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-slate-900 font-bold" data-testid="admin-locations-title">Facility Locations</h2>
                  <p className="text-slate-500 text-xs" data-testid="admin-locations-hint">Manage facility locations displayed on the public map.</p>
                </div>
                <button
                  type="button"
                  onClick={refreshLocations}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  data-testid="admin-locations-refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${locationsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="admin-locations-filters">
                <div className="md:col-span-2 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search by name or address…"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    data-testid="admin-locations-search"
                  />
                </div>
                <select
                  value={locationTypeFilter}
                  onChange={(e) => setLocationTypeFilter(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                  data-testid="admin-locations-type-filter"
                >
                  <option value="">All types</option>
                  <option value="evacuation">Evacuation</option>
                  <option value="hospital">Hospital</option>
                  <option value="police">Police</option>
                  <option value="fire">Fire</option>
                  <option value="government">Government</option>
                </select>
              </div>

              <div className="mt-3">
                {locationsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3" data-testid="admin-locations-error">
                    {locationsError}
                  </div>
                ) : null}

                <div className="mt-3 space-y-2" data-testid="admin-locations-list">
                  {filteredLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="border border-slate-200 rounded-2xl p-3 flex items-start justify-between gap-3"
                      data-testid={`admin-location-row-${loc.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-900 font-semibold" data-testid={`admin-location-name-${loc.id}`}>{loc.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200" data-testid={`admin-location-type-${loc.id}`}>
                            {loc.type}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs mt-0.5" data-testid={`admin-location-address-${loc.id}`}>
                          {loc.address}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5" data-testid={`admin-location-coords-${loc.id}`}>
                          📍 {Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)}
                          {loc.capacity ? ` • Capacity: ${loc.capacity}` : ''}
                          {loc.services ? ` • Services: ${loc.services}` : ''}
                          {loc.hotline ? ` • Hotline: ${loc.hotline}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-semibold"
                          onClick={() => startEditLocation(loc)}
                          data-testid={`admin-location-edit-${loc.id}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => deleteLocation(loc.id)}
                          data-testid={`admin-location-delete-${loc.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {!locationsLoading && filteredLocations.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center py-10" data-testid="admin-locations-empty">
                      No facility locations found.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4" data-testid="admin-locations-form-card">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 font-bold" data-testid="admin-locations-form-title">
                  {locationForm.id ? 'Edit Location' : 'Add Location'}
                </h3>
                <button
                  type="button"
                  onClick={resetLocationForm}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  data-testid="admin-locations-form-reset"
                  title="Reset"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <form onSubmit={saveLocation} className="mt-3 space-y-3" data-testid="admin-locations-form">
                <div>
                  <label className="text-slate-700 text-xs font-semibold">TYPE *</label>
                  <select
                    value={locationForm.type}
                    onChange={(e) => setLocationForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    required
                    data-testid="admin-locations-type-select"
                  >
                    <option value="evacuation">Evacuation Center</option>
                    <option value="hospital">Hospital/Medical</option>
                    <option value="police">Police Station</option>
                    <option value="fire">Fire Station</option>
                    <option value="government">Government Office</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 text-xs font-semibold">NAME *</label>
                  <input
                    value={locationForm.name}
                    onChange={(e) => setLocationForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., Pio Duran Central School"
                    required
                    data-testid="admin-locations-name-input"
                  />
                </div>

                <div>
                  <label className="text-slate-700 text-xs font-semibold">ADDRESS *</label>
                  <input
                    value={locationForm.address}
                    onChange={(e) => setLocationForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., Poblacion, Pio Duran"
                    required
                    data-testid="admin-locations-address-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 text-xs font-semibold">LATITUDE *</label>
                    <input
                      type="number"
                      step="any"
                      value={locationForm.lat}
                      onChange={(e) => setLocationForm((p) => ({ ...p, lat: e.target.value }))}
                      className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                      required
                      data-testid="admin-locations-lat-input"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 text-xs font-semibold">LONGITUDE *</label>
                    <input
                      type="number"
                      step="any"
                      value={locationForm.lng}
                      onChange={(e) => setLocationForm((p) => ({ ...p, lng: e.target.value }))}
                      className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                      required
                      data-testid="admin-locations-lng-input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="w-full py-2 px-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2"
                  data-testid="admin-locations-map-toggle"
                >
                  <MapPin className="w-4 h-4" />
                  {showMapPicker ? 'Hide Map Picker' : 'Pick on Map'}
                </button>

                {showMapPicker && <LocationMapPicker />}

                <div>
                  <label className="text-slate-700 text-xs font-semibold">CAPACITY (optional)</label>
                  <input
                    value={locationForm.capacity}
                    onChange={(e) => setLocationForm((p) => ({ ...p, capacity: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., 500 persons"
                    data-testid="admin-locations-capacity-input"
                  />
                </div>

                <div>
                  <label className="text-slate-700 text-xs font-semibold">SERVICES (optional)</label>
                  <input
                    value={locationForm.services}
                    onChange={(e) => setLocationForm((p) => ({ ...p, services: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., 24/7 Emergency, Surgery"
                    data-testid="admin-locations-services-input"
                  />
                </div>

                <div>
                  <label className="text-slate-700 text-xs font-semibold">HOTLINE (optional)</label>
                  <input
                    value={locationForm.hotline}
                    onChange={(e) => setLocationForm((p) => ({ ...p, hotline: e.target.value }))}
                    className="w-full mt-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-yellow-500"
                    placeholder="e.g., 166"
                    data-testid="admin-locations-hotline-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={locationSaving}
                  className="w-full bg-blue-950 text-white font-semibold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  data-testid="admin-locations-save-button"
                >
                  <Save className="w-4 h-4" />
                  {locationSaving ? 'Saving…' : 'Save'}
                </button>
              </form>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
