import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, BookOpen, Bell, User, Wrench, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  
  const settingsItems = [
    { name: 'Général', href: '/settings', icon: SettingsIcon },
    { name: 'Présentoirs', href: '/settings/stands', icon: Building2 },
    { name: 'Affiches', href: '/settings/posters', icon: FileText },
    { name: 'Publications', href: '/settings/publications', icon: BookOpen },
    { name: 'Maintenance', href: '/settings/maintenance', icon: Wrench },
    { name: 'Notifications', href: '/settings/notifications', icon: Bell },
    { name: 'Profil', href: '/settings/profile', icon: User }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Paramètres
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="card p-6 hover:scale-[1.02] transition-all duration-200 cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-lg shadow-lg">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;