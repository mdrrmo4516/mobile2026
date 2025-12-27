import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FileText, Plus, Save, Trash2, Users, MapPin, Phone, Home, AlertCircle, Cloud, CloudOff, Waves, Mountain, CloudLightning, Wind, Flame, Sun, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';

const defaultPlan = {
  familyMembers: [],
  meetingPoints: [
    { id: 1, name: 'Near Home', location: '' },
    { id: 2, name: 'Neighborhood', location: '' },
    { id: 3, name: 'Out of Town', location: '' },
  ],
  emergencyContacts: [
    { id: 1, name: '', phone: '', relationship: '' },
  ],
  evacuation: {
    primaryRoute: '',
    alternateRoute: '',
    nearestEvacCenter: '',
  },
  specialNeeds: '',
  pets: '',
  importantInfo: '',
};

const disasters = [
  {
    id: "storm-surge",
    title: "Storm Surge & Tsunami",
    icon: Waves,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    before: [
      "Know your zone: Is your home, work, or school in a designated evacuation zone?",
      "Plan multiple evacuation routes inland and to higher ground.",
      "Learn the natural warning signs: for a tsunami, a strong, long earthquake, a sudden rise or fall in the ocean, a loud 'roaring' sound.",
      "Heed official warnings immediately. Do not wait.",
      "Prepare your Go-Bag and have it ready.",
    ],
    during: [
      "IMMEDIATELY move inland and to high ground. Do not stay to watch.",
      "Go as far inland and as high up as possible. Even a few stories in a sturdy concrete building can make a difference.",
      "If you are in a boat and time allows, move out to deep water (tsunami waves are less destructive in deep ocean).",
      "Do not return to the evacuation zone until authorities declare it safe.",
    ],
    after: [
      "Stay away from the coast. Dangerous waves can continue for hours.",
      "Stay away from damaged buildings, bridges, and infrastructure.",
      "Be cautious of floodwaters, which may be contaminated or hide debris.",
      "Listen to official sources for information about safe return and water safety.",
    ],
  },
  {
    id: "landslide",
    title: "Landslide",
    icon: Mountain,
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    before: [
      "Learn if your area is prone to landslides.",
      "Watch for signs like new cracks in foundations, soil moving away from foundations, tilting trees or fences.",
      "Consult a professional for land-use guidance (e.g., building retaining walls).",
      "Plan an evacuation route to a safer area, not in the path of potential flow.",
    ],
    during: [
      "If you are in a building, get to the highest level.",
      "If you are outside and near the path of a landslide, run to the nearest high ground or shelter. Do not try to outrun it.",
      "If escape is not possible, curl into a tight ball and protect your head.",
    ],
    after: [
      "Stay away from the slide area. There may be a risk of additional slides.",
      "Check for injured or trapped people near the slide, but do not enter the direct area. Call for professional help.",
      "Be aware of potential flooding, as landslides can block waterways.",
      "Report broken utility lines to the authorities.",
    ],
  },
  {
    id: "thunderstorm",
    title: "Thunderstorm",
    icon: CloudLightning,
    color: "gray",
    gradient: "from-gray-500 to-slate-600",
    before: [
      "Secure or bring inside outdoor objects that could be blown away.",
      "Unplug sensitive electronic appliances to protect from power surges.",
      "Listen to weather forecasts for Severe Thunderstorm Warnings.",
    ],
    during: [
      "When Thunder Roars, Go Indoors! There is no safe place outside.",
      "Avoid corded phones, plumbing, and electrical appliances as lightning can travel through wiring and pipes.",
      "Stay away from windows and doors.",
      "If you are in a vehicle, it is a safe alternative. Avoid touching the metal frame.",
      "If you are caught outside with no shelter, avoid isolated trees, hilltops, and open fields. Crouch low in a ravine or valley.",
    ],
    after: [
      "Stay indoors for at least 30 minutes after the last clap of thunder.",
      "Watch for downed power lines and report them immediately.",
      "Check for property damage.",
    ],
  },
  {
    id: "typhoon",
    title: "Typhoon / Hurricane",
    icon: Wind,
    color: "blue",
    gradient: "from-blue-600 to-indigo-700",
    before: [
      "Know your home's vulnerability to wind and flooding.",
      "Install storm shutters or pre-cut plywood for windows.",
      "Secure or bring indoors all outdoor furniture, decorations, trash cans, etc.",
      "Trim trees and shrubs to make them more wind-resistant.",
      "Fill your vehicle's gas tank and withdraw some cash.",
    ],
    during: [
      "Stay indoors, away from windows and skylights.",
      "Take refuge in a small interior room, closet, or hallway on the lowest level that is not prone to flooding.",
      "Lie on the floor under a sturdy table or other object.",
      "Do not go outside during the 'eye' of the storm; the worst winds will resume shortly from the opposite direction.",
    ],
    after: [
      "Listen to official reports to ensure the storm has passed.",
      "Watch for fallen objects, downed power lines, and damaged structures.",
      "Do not walk or drive through floodwaters.",
      "Use flashlights, not candles, due to the risk of gas leaks.",
      "Check on your neighbors, especially the elderly or those with disabilities.",
    ],
  },
  {
    id: "flood",
    title: "Flood",
    icon: Waves,
    color: "cyan",
    gradient: "from-cyan-500 to-teal-500",
    before: [
      "Know if you are in a floodplain.",
      "Consider purchasing flood insurance.",
      "Elevate critical utilities (furnace, water heater, electrical panel).",
      "Have a plan to move to higher floors if needed.",
    ],
    during: [
      "Turn Around, Don't Drown! Do not walk, swim, or drive through floodwaters. Six inches of moving water can knock you down; one foot can sweep a vehicle away.",
      "Evacuate if told to do so.",
      "If trapped in a building, go to its highest level. Do not enter a closed attic.",
      "If trapped in a vehicle, stay inside. If water is rising inside the vehicle, seek refuge on the roof.",
    ],
    after: [
      "Return home only when authorities say it is safe.",
      "Avoid standing water, which may be electrically charged or contaminated.",
      "Wear heavy gloves and boots during cleanup.",
      "Photograph damage for insurance claims.",
      "Be aware that floodwater can weaken roads and structures.",
    ],
  },
  {
    id: "earthquake",
    title: "Earthquake",
    icon: Mountain,
    color: "stone",
    gradient: "from-stone-500 to-gray-600",
    before: [
      "'Drop, Cover, and Hold On' is the single most important preparedness action.",
      "Secure heavy furniture, appliances, and water heaters to walls.",
      "Know how to turn off your gas (if you smell a leak) and water.",
      "Store heavy and breakable objects on low shelves.",
    ],
    during: [
      "DROP onto your hands and knees.",
      "COVER your head and neck under a sturdy table or desk. If no shelter is nearby, get down near an interior wall and cover your head and neck with your arms.",
      "HOLD ON to your shelter until the shaking stops.",
      "If in bed, stay there and cover your head with a pillow.",
      "Do not run outside. The danger is from falling debris and glass.",
    ],
    after: [
      "Expect aftershocks. Drop, Cover, and Hold On when they occur.",
      "Check yourself and others for injuries.",
      "If you are in a damaged building, get out and move to an open space.",
      "If you smell gas, evacuate immediately and report it.",
      "Avoid using phones except for life-threatening emergencies.",
    ],
  },
  {
    id: "fire",
    title: "Fire (Wildfire / Structure)",
    icon: Flame,
    color: "red",
    gradient: "from-red-500 to-orange-500",
    before: [
      "Create a 'defensible space' by clearing flammable vegetation around your home.",
      "Have an evacuation plan for your family and pets.",
      "Keep gutters clean and remove debris from your roof.",
      "Install and test smoke alarms.",
      "Have fire extinguishers and know how to use them.",
      "Plan and practice a family escape route with two ways out of every room.",
    ],
    during: [
      "Evacuate immediately if told to do so.",
      "If trapped, call 911. Stay in a building or vehicle with windows closed. It is safer than being outside.",
      "If outside, seek shelter in a low-lying area or body of water. Cover yourself with wet clothing or a blanket.",
      "GET OUT, STAY OUT. Do not stop for belongings.",
      "Feel closed doors with the back of your hand before opening. If it's warm, use your second way out.",
      "Stay low to the floor where the air is less toxic.",
      "Call the fire department from outside.",
    ],
    after: [
      "Do not re-enter until firefighters say it is safe.",
      "Be aware of hot embers, smoldering debris, and structural damage.",
      "Wear a mask to avoid breathing ash.",
      "Watch for flare-ups.",
    ],
  },
  {
    id: "heat",
    title: "Extreme Heat",
    icon: Sun,
    color: "orange",
    gradient: "from-orange-400 to-amber-500",
    before: [
      "Ensure you have a way to stay cool (air conditioning, public cooling centers).",
      "Cover windows with drapes or shades to block direct sun.",
      "Have a plan for those at high risk (infants, elderly, people with chronic illnesses).",
    ],
    during: [
      "Stay indoors in air conditioning as much as possible.",
      "Drink plenty of water, even if you don't feel thirsty. Avoid alcohol and caffeine.",
      "Wear lightweight, light-colored, loose-fitting clothing.",
      "Take cool showers or baths.",
      "Never leave children or pets in a closed vehicle.",
      "Limit strenuous outdoor activity to the coolest parts of the day (early morning/evening).",
    ],
    after: [
      "Continue to hydrate.",
      "Check on neighbors, family, and friends who may be vulnerable.",
      "Be aware of signs of heat illness (dizziness, nausea, headache, confusion) and seek medical help if necessary.",
    ],
  },
];

export default function EmergencyPlan() {
  const { isAuthenticated, user } = useAuth();
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('emergency-plan');
    return saved ? JSON.parse(saved) : defaultPlan;
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('guidelines');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local', 'synced', 'error'
  const [expandedDisasters, setExpandedDisasters] = useState({});

  // Load plan from backend if user is authenticated
  useEffect(() => {
    const loadPlanFromBackend = async () => {
      if (isAuthenticated) {
        try {
          const response = await userAPI.getEmergencyPlan();
          if (response.data.plan && response.data.plan.plan_data) {
            setPlan(response.data.plan.plan_data);
            localStorage.setItem('emergency-plan', JSON.stringify(response.data.plan.plan_data));
            setSyncStatus('synced');
          }
        } catch (error) {
          console.error('Failed to load plan from backend:', error);
          setSyncStatus('error');
        }
      }
    };

    loadPlanFromBackend();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('emergency-plan', JSON.stringify(plan));
    if (isAuthenticated && syncStatus === 'synced') {
      setSyncStatus('local'); // Mark as having local changes
    }
  }, [plan, isAuthenticated, syncStatus]);

  const handleSave = async () => {
    localStorage.setItem('emergency-plan', JSON.stringify(plan));
    
    // Sync to backend if user is authenticated
    if (isAuthenticated) {
      setSyncing(true);
      try {
        await userAPI.saveEmergencyPlan(plan);
        setSyncStatus('synced');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error('Failed to sync plan to backend:', error);
        setSyncStatus('error');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } finally {
        setSyncing(false);
      }
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const addFamilyMember = () => {
    setPlan(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { id: Date.now(), name: '', age: '', medical: '' }]
    }));
  };

  const updateFamilyMember = (id, field, value) => {
    setPlan(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const removeFamilyMember = (id) => {
    setPlan(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(m => m.id !== id)
    }));
  };

  const addEmergencyContact = () => {
    setPlan(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { id: Date.now(), name: '', phone: '', relationship: '' }]
    }));
  };

  const updateEmergencyContact = (id, field, value) => {
    setPlan(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const removeEmergencyContact = (id) => {
    if (plan.emergencyContacts.length <= 1) return;
    setPlan(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id)
    }));
  };

  const updateMeetingPoint = (id, value) => {
    setPlan(prev => ({
      ...prev,
      meetingPoints: prev.meetingPoints.map(p => 
        p.id === id ? { ...p, location: value } : p
      )
    }));
  };

  const toggleDisaster = (id) => {
    setExpandedDisasters(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const sections = [
    { id: 'guidelines', label: 'Guidelines', icon: BookOpen },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'contacts', label: 'Contacts', icon: Phone },
    { id: 'meeting', label: 'Meeting Points', icon: MapPin },
    { id: 'evacuation', label: 'Evacuation', icon: Home },
    { id: 'special', label: 'Special Needs', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-100" data-testid="emergency-plan-page">
      <Header title="EMERGENCY PLAN" showBack icon={FileText} />
      
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Save Success Message */}
        {saved && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${
            syncStatus === 'error' ? 'bg-orange-500' : 'bg-green-500'
          } text-white`} data-testid="save-success">
            <Save className="w-5 h-5" />
            <span>{syncStatus === 'error' ? 'Saved locally (sync failed)' : 'Emergency plan saved!'}</span>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-950 rounded-xl p-4" data-testid="info-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-yellow-500 font-bold text-lg">
              {activeSection === 'guidelines' ? 'Disaster Preparedness' : 'Family Emergency Plan'}
            </h2>
            {isAuthenticated && activeSection !== 'guidelines' && (
              <div className="flex items-center gap-1.5 text-xs">
                {syncStatus === 'synced' && (
                  <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                    <Cloud className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Synced</span>
                  </div>
                )}
                {syncStatus === 'local' && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                    <CloudOff className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400">Local changes</span>
                  </div>
                )}
                {syncStatus === 'error' && (
                  <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-red-400">Sync error</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-white/80 text-sm">
            {activeSection === 'guidelines' 
              ? 'Learn what to do before, during, and after different types of emergencies and disasters.'
              : `Create your family's emergency plan. ${isAuthenticated ? 'Your plan is automatically synced across all devices.' : 'Login to sync across devices.'}`
            }
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2" data-testid="section-tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-yellow-500 text-blue-950'
                  : 'bg-white text-slate-600 border-2 border-slate-200'
              }`}
              data-testid={`tab-${section.id}`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Disaster Guidelines Section */}
        {activeSection === 'guidelines' && (
          <div className="space-y-3" data-testid="guidelines-section">
            {disasters.map((disaster) => {
              const Icon = disaster.icon;
              const isExpanded = expandedDisasters[disaster.id];
              
              return (
                <div 
                  key={disaster.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  data-testid={`disaster-${disaster.id}`}
                >
                  {/* Disaster Header */}
                  <button
                    onClick={() => toggleDisaster(disaster.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    data-testid={`disaster-toggle-${disaster.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${disaster.gradient}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-slate-900 font-semibold text-left">
                        {disaster.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 animate-fadeIn" data-testid={`disaster-content-${disaster.id}`}>
                      {/* Before */}
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">BEFORE</span>
                        </h4>
                        <ul className="space-y-2">
                          {disaster.before.map((item, index) => (
                            <li key={index} className="text-slate-700 text-sm flex gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* During */}
                      <div className="bg-red-50 rounded-xl p-4">
                        <h4 className="text-red-900 font-bold mb-3 flex items-center gap-2">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">DURING</span>
                        </h4>
                        <ul className="space-y-2">
                          {disaster.during.map((item, index) => (
                            <li key={index} className="text-slate-700 text-sm flex gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* After */}
                      <div className="bg-green-50 rounded-xl p-4">
                        <h4 className="text-green-900 font-bold mb-3 flex items-center gap-2">
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">AFTER</span>
                        </h4>
                        <ul className="space-y-2">
                          {disaster.after.map((item, index) => (
                            <li key={index} className="text-slate-700 text-sm flex gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Family Members Section */}
        {activeSection === 'family' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="family-section">
            <div className="flex items-center justify-between">
              <h3 className="text-blue-950 font-bold">Family Members</h3>
              <button
                onClick={addFamilyMember}
                className="flex items-center gap-1 text-yellow-600 text-sm font-medium"
                data-testid="add-family-btn"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            {plan.familyMembers.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No family members added yet</p>
            ) : (
              <div className="space-y-3">
                {plan.familyMembers.map((member) => (
                  <div key={member.id} className="bg-slate-50 rounded-xl p-3 space-y-2" data-testid={`family-member-${member.id}`}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Age"
                        value={member.age}
                        onChange={(e) => updateFamilyMember(member.id, 'age', e.target.value)}
                        className="w-16 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                      />
                      <button
                        onClick={() => removeFamilyMember(member.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Medical conditions/medications"
                      value={member.medical}
                      onChange={(e) => updateFamilyMember(member.id, 'medical', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Emergency Contacts Section */}
        {activeSection === 'contacts' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="contacts-section">
            <div className="flex items-center justify-between">
              <h3 className="text-blue-950 font-bold">Emergency Contacts</h3>
              <button
                onClick={addEmergencyContact}
                className="flex items-center gap-1 text-yellow-600 text-sm font-medium"
                data-testid="add-contact-btn"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            <div className="space-y-3">
              {plan.emergencyContacts.map((contact) => (
                <div key={contact.id} className="bg-slate-50 rounded-xl p-3 space-y-2" data-testid={`contact-${contact.id}`}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(contact.id, 'name', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                    {plan.emergencyContacts.length > 1 && (
                      <button
                        onClick={() => removeEmergencyContact(contact.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={contact.phone}
                      onChange={(e) => updateEmergencyContact(contact.id, 'phone', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(contact.id, 'relationship', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Points Section */}
        {activeSection === 'meeting' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="meeting-section">
            <h3 className="text-blue-950 font-bold">Meeting Points</h3>
            <p className="text-slate-500 text-sm">Designate meeting locations for different scenarios</p>
            
            <div className="space-y-3">
              {plan.meetingPoints.map((point) => (
                <div key={point.id} className="bg-slate-50 rounded-xl p-3" data-testid={`meeting-point-${point.id}`}>
                  <label className="text-blue-950 font-medium text-sm block mb-2">
                    {point.name}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${point.name.toLowerCase()} meeting point...`}
                    value={point.location}
                    onChange={(e) => updateMeetingPoint(point.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evacuation Section */}
        {activeSection === 'evacuation' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="evacuation-section">
            <h3 className="text-blue-950 font-bold">Evacuation Routes</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 text-sm block mb-1">Primary Route</label>
                <input
                  type="text"
                  placeholder="Describe your primary evacuation route..."
                  value={plan.evacuation.primaryRoute}
                  onChange={(e) => setPlan(prev => ({
                    ...prev,
                    evacuation: { ...prev.evacuation, primaryRoute: e.target.value }
                  }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Alternate Route</label>
                <input
                  type="text"
                  placeholder="Describe your alternate evacuation route..."
                  value={plan.evacuation.alternateRoute}
                  onChange={(e) => setPlan(prev => ({
                    ...prev,
                    evacuation: { ...prev.evacuation, alternateRoute: e.target.value }
                  }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Nearest Evacuation Center</label>
                <input
                  type="text"
                  placeholder="Name and address of nearest evacuation center..."
                  value={plan.evacuation.nearestEvacCenter}
                  onChange={(e) => setPlan(prev => ({
                    ...prev,
                    evacuation: { ...prev.evacuation, nearestEvacCenter: e.target.value }
                  }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Special Needs Section */}
        {activeSection === 'special' && (
          <div className="bg-white rounded-xl p-4 space-y-4" data-testid="special-section">
            <h3 className="text-blue-950 font-bold">Special Considerations</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-slate-600 text-sm block mb-1">Special Needs</label>
                <textarea
                  placeholder="List any special medical needs, disabilities, or requirements..."
                  value={plan.specialNeeds}
                  onChange={(e) => setPlan(prev => ({ ...prev, specialNeeds: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] resize-none"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Pets</label>
                <textarea
                  placeholder="List pets and any special care requirements..."
                  value={plan.pets}
                  onChange={(e) => setPlan(prev => ({ ...prev, pets: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] resize-none"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm block mb-1">Important Information</label>
                <textarea
                  placeholder="Any other important information for emergencies..."
                  value={plan.importantInfo}
                  onChange={(e) => setPlan(prev => ({ ...prev, importantInfo: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {activeSection !== 'guidelines' && (
          <button
            onClick={handleSave}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-blue-950 font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="save-plan-btn"
          >
            <Save className="w-5 h-5" />
            {syncing ? 'Saving & Syncing...' : 'Save Emergency Plan'}
          </button>
        )}
      </main>
    </div>
  );
}
