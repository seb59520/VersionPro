import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart2, 
  Settings, 
  Wrench, 
  Building2,
  LogOut,
  Menu,
  X,
  FileText,
  BookOpen,
  Bell,
  User,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrganization } from '../context/OrganizationContext';
import { toast } from 'react-hot-toast';
import NotificationBell from './NotificationBell';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { currentOrganization } = useOrganization();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Statistiques', href: '/statistics', icon: BarChart2 },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { 
      name: 'Paramètres', 
      icon: Settings,
      subItems: [
        { name: 'Général', href: '/settings', icon: Settings },
        { name: 'Présentoirs', href: '/settings/stands', icon: Building2 },
        { name: 'Affiches', href: '/settings/posters', icon: FileText },
        { name: 'Publications', href: '/settings/publications', icon: BookOpen },
        { name: 'Maintenance', href: '/settings/maintenance', icon: Wrench },
        { name: 'Notifications', href: '/settings/notifications', icon: Bell },
        { name: 'Profil', href: '/settings/profile', icon: User }
      ]
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation mobile */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40">
          <div className="fixed top-0 left-0 right-0 bg-white shadow-md px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
            <div className="text-lg font-semibold text-gray-900">
              {currentOrganization?.name || 'Gestion des Présentoirs'}
            </div>
          </div>

          {isMenuOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMenuOpen(false)} />
          )}

          <div className={`fixed top-14 left-0 bottom-0 w-64 bg-white transform transition-transform duration-200 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <nav className="h-full overflow-y-auto py-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div className="px-4 py-2">
                      <div className="flex items-center text-gray-600 mb-2">
                        <item.icon className="h-5 w-5 mr-2" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`block px-3 py-2 rounded-lg text-sm ${
                              location.pathname === subItem.href
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <subItem.icon className="h-4 w-4 mr-2" />
                              {subItem.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm ${
                        location.pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Navigation desktop */}
      <nav className="hidden lg:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {currentOrganization?.name || 'Gestion des Présentoirs'}
                </h1>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                {navigation.map((item) => (
                  <div key={item.name} className="relative group">
                    {item.subItems ? (
                      <>
                        <button className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </button>
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          <div className="py-1">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <subItem.icon className="h-4 w-4 mr-2" />
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.href}
                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                          location.pathname === item.href
                            ? 'text-blue-600 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/help"
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Aide"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>
              <NotificationBell />
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-14 lg:mt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;