import { Header } from '../components/Header';
import { BookOpen, ExternalLink, Phone, Globe, MapPin, Info, FileText, Users } from 'lucide-react';

const resources = [
  {
    category: 'Government Agencies',
    items: [
      {
        name: 'NDRRMC',
        description: 'National Disaster Risk Reduction and Management Council',
        link: 'https://ndrrmc.gov.ph',
        icon: Globe,
      },
      {
        name: 'PAGASA',
        description: 'Philippine weather forecasts and warnings',
        link: 'https://bagong.pagasa.dost.gov.ph',
        icon: Globe,
      },
      {
        name: 'PHIVOLCS',
        description: 'Volcanic and seismic monitoring',
        link: 'https://phivolcs.dost.gov.ph',
        icon: Globe,
      },
      {
        name: 'OCD Region V',
        description: 'Office of Civil Defense Bicol Region',
        link: 'https://ocd.gov.ph',
        icon: Globe,
      },
    ],
  },
  {
    category: 'Emergency Assistance',
    items: [
      {
        name: 'Philippine Red Cross',
        description: 'Disaster relief and blood services',
        phone: '143',
        icon: Phone,
      },
      {
        name: 'DSWD Hotline',
        description: 'Social welfare assistance',
        phone: '8931-8101',
        icon: Phone,
      },
      {
        name: 'DOH Health Emergency',
        description: '24/7 health assistance',
        phone: '1555',
        icon: Phone,
      },
    ],
  },
  {
    category: 'Local Resources',
    items: [
      {
        name: 'MDRRMO Pio Duran',
        description: 'Municipal Disaster Risk Reduction',
        address: 'Municipal Hall, Poblacion',
        icon: MapPin,
      },
      {
        name: 'Pio Duran Municipal Hall',
        description: 'Local government services',
        address: 'Poblacion, Pio Duran, Albay',
        icon: MapPin,
      },
    ],
  },
  {
    category: 'Information & Guides',
    items: [
      {
        name: 'Disaster Preparedness Guide',
        description: 'How to prepare for typhoons and disasters',
        type: 'guide',
        icon: FileText,
      },
      {
        name: 'Family Emergency Planning',
        description: 'Create your family emergency plan',
        type: 'guide',
        icon: Users,
      },
      {
        name: 'First Aid Basics',
        description: 'Essential first aid knowledge',
        type: 'guide',
        icon: Info,
      },
    ],
  },
];

export default function SupportResources() {
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneClick = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-slate-100" data-testid="support-resources-page">
      <Header title="SUPPORT RESOURCES" showBack icon={BookOpen} />
      
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Intro */}
        <div className="bg-blue-950 rounded-xl p-4" data-testid="intro-card">
          <h2 className="text-yellow-500 font-bold text-lg mb-2">Help & Information</h2>
          <p className="text-white/80 text-sm">
            Access important resources, emergency contacts, and guides to help you prepare for and respond to disasters.
          </p>
        </div>

        {/* Resources by Category */}
        {resources.map((section) => (
          <div key={section.category} className="bg-white rounded-xl overflow-hidden" data-testid={`section-${section.category.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-blue-950 font-bold">{section.category}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {section.items.map((item) => (
                <ResourceItem key={item.name} item={item} onLinkClick={handleLinkClick} onPhoneClick={handlePhoneClick} />
              ))}
            </div>
          </div>
        ))}

        {/* Emergency Tips */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4" data-testid="emergency-tips">
          <h3 className="text-yellow-700 font-bold mb-3">Quick Emergency Tips</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span className="text-slate-700 text-sm">Always keep your Go Bag ready and accessible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span className="text-slate-700 text-sm">Know your evacuation routes and meeting points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span className="text-slate-700 text-sm">Keep emergency numbers saved on your phone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span className="text-slate-700 text-sm">Stay updated with official weather advisories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">•</span>
              <span className="text-slate-700 text-sm">Have a family emergency communication plan</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function ResourceItem({ item, onLinkClick, onPhoneClick }) {
  const Icon = item.icon;

  const handleClick = () => {
    if (item.link) {
      onLinkClick(item.link);
    } else if (item.phone) {
      onPhoneClick(item.phone);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
        item.link || item.phone ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
      }`}
      data-testid={`resource-${item.name.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="w-10 h-10 rounded-full bg-blue-950/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-blue-950" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-blue-950 font-semibold text-sm">{item.name}</h4>
          {item.link && <ExternalLink className="w-3 h-3 text-slate-400" />}
        </div>
        <p className="text-slate-500 text-xs mt-0.5">{item.description}</p>
        {item.phone && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            {item.phone}
          </span>
        )}
        {item.address && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {item.address}
          </span>
        )}
      </div>
    </button>
  );
}
