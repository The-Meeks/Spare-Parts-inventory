import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Palette,
  Building,
  Moon,
  Sun,
  Save,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Input 
} from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { getBusinessSettings, updateBusinessSettings } from '../services/firestoreService';

export const Settings: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === UserRole.ADMIN;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    businessName: '',
    currency: 'Ksh',
    taxRate: 0,
    lowStockThreshold: 10
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getBusinessSettings();
      if (data) {
        setSettings({
          businessName: data.businessName || 'Pasbest Ventures',
          currency: data.currency || 'Ksh',
          taxRate: data.taxRate || 0,
          lowStockThreshold: data.lowStockThreshold || 10
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await updateBusinessSettings(settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="font-medium">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-slate-500 mt-1">Configure your business preferences and account details.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader className="flex items-center gap-2 pt-6 px-8">
            <User className="text-indigo-600" size={20} />
            <h3 className="font-bold text-lg">Account Profile</h3>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" value={profile?.name || ''} readOnly />
              <Input label="Email Address" value={profile?.email || ''} readOnly />
              <div className="md:col-span-2">
                <span className="text-sm font-bold text-slate-700 block mb-2">Assigned Role</span>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                    isAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {profile?.role}
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    {isAdmin ? 'Full administrative access' : 'Restricted staff permissions'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button variant="outline">Update Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card>
          <CardHeader className="flex items-center gap-2 pt-6 px-8">
            <Building className="text-indigo-600" size={20} />
            <h3 className="font-bold text-lg">Business Configuration</h3>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Business Name" 
                value={settings.businessName} 
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                readOnly={!isAdmin} 
              />
              <Input 
                label="Default Currency" 
                value={settings.currency} 
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                readOnly={!isAdmin} 
              />
              <Input 
                label="Tax Rate (%)" 
                type="number" 
                value={settings.taxRate} 
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                readOnly={!isAdmin} 
              />
              <Input 
                label="Low Stock Threshold" 
                type="number" 
                value={settings.lowStockThreshold} 
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                readOnly={!isAdmin} 
              />
            </div>
            {isAdmin && (
              <div className="mt-8 flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Save Business Info
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance & Prefs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex items-center gap-2 pt-4 px-6 border-none">
              <Bell className="text-indigo-600" size={18} />
              <h3 className="font-bold text-md">Notifications</h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Email Alerts</p>
                  <p className="text-xs text-slate-400">Receive daily summary reports</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-not-allowed">
                   <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Push Notifications</p>
                  <p className="text-xs text-slate-400">Low stock and sales alerts</p>
                </div>
                 <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                   <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2 pt-4 px-6 border-none">
              <Palette className="text-indigo-600" size={18} />
              <h3 className="font-bold text-md">Appearance</h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Theme Mode</p>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                    <Sun size={14} />
                  </button>
                  <button className="p-2 text-slate-400">
                    <Moon size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                 <p className="text-sm font-bold text-slate-900">Compact View</p>
                 <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                   <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
