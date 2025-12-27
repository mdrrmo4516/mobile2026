import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Briefcase, Check, Plus, Trash2, Save, RotateCcw, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../utils/api';

const defaultChecklist = [
  { id: 1, category: 'Documents', item: 'Valid IDs (Photocopy)', checked: false },
  { id: 2, category: 'Documents', item: 'Insurance documents', checked: false },
  { id: 3, category: 'Documents', item: 'Emergency contact list', checked: false },
  { id: 4, category: 'Documents', item: 'Medical records/prescriptions', checked: false },
  { id: 5, category: 'Water & Food', item: 'Drinking water (3 liters/person)', checked: false },
  { id: 6, category: 'Water & Food', item: 'Canned goods (3-day supply)', checked: false },
  { id: 7, category: 'Water & Food', item: 'Ready-to-eat food', checked: false },
  { id: 8, category: 'Water & Food', item: 'Can opener', checked: false },
  { id: 9, category: 'First Aid', item: 'First aid kit', checked: false },
  { id: 10, category: 'First Aid', item: 'Prescription medications', checked: false },
  { id: 11, category: 'First Aid', item: 'Pain relievers', checked: false },
  { id: 12, category: 'First Aid', item: 'Bandages and antiseptic', checked: false },
  { id: 13, category: 'Tools & Safety', item: 'Flashlight with extra batteries', checked: false },
  { id: 14, category: 'Tools & Safety', item: 'Battery-powered radio', checked: false },
  { id: 15, category: 'Tools & Safety', item: 'Whistle (for signaling)', checked: false },
  { id: 16, category: 'Tools & Safety', item: 'Multi-tool or knife', checked: false },
  { id: 17, category: 'Clothing', item: 'Change of clothes', checked: false },
  { id: 18, category: 'Clothing', item: 'Rain gear/poncho', checked: false },
  { id: 19, category: 'Clothing', item: 'Sturdy shoes', checked: false },
  { id: 20, category: 'Clothing', item: 'Blanket or sleeping bag', checked: false },
  { id: 21, category: 'Communication', item: 'Fully charged power bank', checked: false },
  { id: 22, category: 'Communication', item: 'Phone charger', checked: false },
  { id: 23, category: 'Communication', item: 'Emergency cash (small bills)', checked: false },
  { id: 24, category: 'Hygiene', item: 'Toothbrush and toothpaste', checked: false },
  { id: 25, category: 'Hygiene', item: 'Soap and hand sanitizer', checked: false },
  { id: 26, category: 'Hygiene', item: 'Toilet paper', checked: false },
  { id: 27, category: 'Hygiene', item: 'Face masks', checked: false },
];

const categories = ['Documents', 'Water & Food', 'First Aid', 'Tools & Safety', 'Clothing', 'Communication', 'Hygiene'];

const categoryColors = {
  'Documents': 'bg-blue-500',
  'Water & Food': 'bg-cyan-500',
  'First Aid': 'bg-red-500',
  'Tools & Safety': 'bg-orange-500',
  'Clothing': 'bg-purple-500',
  'Communication': 'bg-green-500',
  'Hygiene': 'bg-pink-500',
};

export default function GoBagChecklist() {
  const { isAuthenticated, user } = useAuth();
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('gobag-checklist');
    return saved ? JSON.parse(saved) : defaultChecklist;
  });
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Documents');
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local', 'synced', 'error'

  // Load checklist from backend if user is authenticated
  useEffect(() => {
    const loadChecklistFromBackend = async () => {
      if (isAuthenticated) {
        try {
          const response = await userAPI.getChecklist();
          if (response.data.checklist && response.data.checklist.checklist_data) {
            setChecklist(response.data.checklist.checklist_data);
            localStorage.setItem('gobag-checklist', JSON.stringify(response.data.checklist.checklist_data));
            setSyncStatus('synced');
          }
        } catch (error) {
          console.error('Failed to load checklist from backend:', error);
          setSyncStatus('error');
        }
      }
    };

    loadChecklistFromBackend();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('gobag-checklist', JSON.stringify(checklist));
    
    // Auto-sync to backend if user is authenticated (debounced)
    if (isAuthenticated) {
      setSyncStatus('local');
      const syncTimer = setTimeout(async () => {
        try {
          setSyncing(true);
          await userAPI.saveChecklist(checklist);
          setSyncStatus('synced');
        } catch (error) {
          console.error('Failed to sync checklist:', error);
          setSyncStatus('error');
        } finally {
          setSyncing(false);
        }
      }, 1000); // Debounce 1 second

      return () => clearTimeout(syncTimer);
    }
  }, [checklist, isAuthenticated]);

  const toggleItem = (id) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const newId = Math.max(...checklist.map(i => i.id), 0) + 1;
    setChecklist(prev => [
      ...prev,
      { id: newId, category: selectedCategory, item: newItem.trim(), checked: false }
    ]);
    setNewItem('');
    setShowAddForm(false);
  };

  const deleteItem = (id) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const resetChecklist = () => {
    if (window.confirm('Reset all items to unchecked?')) {
      setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
    }
  };

  const resetToDefault = () => {
    if (window.confirm('Reset to default checklist? This will remove any custom items.')) {
      setChecklist(defaultChecklist);
    }
  };

  const checkedCount = checklist.filter(i => i.checked).length;
  const progress = Math.round((checkedCount / checklist.length) * 100);

  const groupedItems = categories.map(cat => ({
    category: cat,
    items: checklist.filter(item => item.category === cat)
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-100" data-testid="gobag-checklist-page">
      <Header title="GO BAG CHECKLIST" showBack icon={Briefcase} />
      
      <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Progress Card */}
        <div className="bg-white rounded-xl p-4" data-testid="progress-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-blue-950 font-bold">Preparation Progress</h3>
            <div className="flex items-center gap-2">
              <span className="text-blue-950 font-bold text-lg">{progress}%</span>
              {isAuthenticated && (
                <div className="flex items-center gap-1">
                  {syncing && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Syncing..."></div>
                  )}
                  {!syncing && syncStatus === 'synced' && (
                    <Cloud className="w-4 h-4 text-green-500" title="Synced" />
                  )}
                  {!syncing && syncStatus === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" title="Sync error" />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
          <p className="text-slate-500 text-sm mt-2">
            {checkedCount} of {checklist.length} items ready
            {isAuthenticated && syncStatus === 'synced' && (
              <span className="text-green-600 ml-2">• Synced</span>
            )}
            {isAuthenticated && !syncing && syncStatus === 'error' && (
              <span className="text-red-600 ml-2">• Sync failed</span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-blue-950 font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-colors"
            data-testid="add-item-btn"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
          <button
            onClick={resetChecklist}
            className="px-4 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
            data-testid="reset-checks-btn"
            title="Uncheck all items"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-4 space-y-3 animate-fadeIn" data-testid="add-item-form">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-slate-700"
              data-testid="category-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter item name..."
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-slate-700 focus:border-yellow-500"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                data-testid="new-item-input"
              />
              <button
                onClick={addItem}
                className="px-4 bg-blue-950 text-white rounded-xl hover:bg-blue-900 transition-colors"
                data-testid="save-item-btn"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Checklist by Category */}
        <div className="space-y-4" data-testid="checklist-categories">
          {groupedItems.map(({ category, items }) => (
            <div key={category} className="bg-white rounded-xl overflow-hidden">
              <div className={`p-3 ${categoryColors[category]} flex items-center justify-between`}>
                <h3 className="text-white font-bold text-sm">{category}</h3>
                <span className="text-white/80 text-xs">
                  {items.filter(i => i.checked).length}/{items.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="checklist-item flex items-center justify-between p-4"
                    data-testid={`checklist-item-${item.id}`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="flex items-center gap-3 flex-1"
                      data-testid={`toggle-item-${item.id}`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        item.checked 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-slate-300'
                      }`}>
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-sm transition-all ${
                        item.checked 
                          ? 'text-slate-400 line-through' 
                          : 'text-slate-700'
                      }`}>
                        {item.item}
                      </span>
                    </button>
                    {!defaultChecklist.find(d => d.id === item.id) && (
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`delete-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetToDefault}
          className="w-full text-slate-500 text-sm py-2 hover:text-slate-700"
          data-testid="reset-default-btn"
        >
          Reset to default checklist
        </button>
      </main>
    </div>
  );
}
