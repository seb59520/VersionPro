import React from 'react';
import { useStands } from '../context/StandsContext';
import { Calendar, AlertTriangle, Clock, Wrench, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { getStandAge, getAgeStatus, formatDate } from '../utils/standUtils';
import { fr } from 'date-fns/locale';
import { differenceInDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

const Statistics = () => {
  const { stands } = useStands();

  // Statistiques d'âge
  const ageStats = stands.reduce((acc, stand) => {
    const status = getAgeStatus(stand.createdAt);
    acc[status.status] = (acc[status.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageData = [
    { name: 'Neuf (<2 ans)', value: ageStats.new || 0, color: '#10b981' },
    { name: 'Bon état (2-4 ans)', value: ageStats.good || 0, color: '#3b82f6' },
    { name: 'Vieillissant (4-6 ans)', value: ageStats.aging || 0, color: '#f59e0b' },
    { name: 'À remplacer (>6 ans)', value: ageStats.old || 0, color: '#ef4444' },
    { name: 'Inconnu', value: ageStats.unknown || 0, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Données d'utilisation mensuelle
  const currentMonth = new Date();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const usageData = daysInMonth.map(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const reservedStands = stands.filter(stand => 
      stand.isReserved && 
      new Date(stand.reservedUntil!) >= date
    ).length;

    return {
      date: format(date, 'd MMM', { locale: fr }),
      reservations: reservedStands
    };
  });

  // Données de maintenance
  const maintenanceData = stands.map(stand => {
    const maintenanceCount = stand.maintenanceHistory?.length || 0;
    const preventiveCount = stand.maintenanceHistory?.filter(m => m.type === 'preventive').length || 0;
    const curativeCount = stand.maintenanceHistory?.filter(m => m.type === 'curative').length || 0;

    return {
      name: stand.name,
      preventive: preventiveCount,
      curative: curativeCount,
      total: maintenanceCount
    };
  });

  // Trier les présentoirs par âge
  const sortedStands = [...stands]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Statistiques et Prédictions
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition par âge */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Répartition par Âge
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utilisation mensuelle */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Utilisation Mensuelle
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="reservations" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorReservations)" 
                  name="Réservations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historique des maintenances */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Historique des Maintenances
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="preventive" name="Préventive" fill="#10b981" />
                <Bar dataKey="curative" name="Curative" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Liste des présentoirs */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Détails des Présentoirs
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {sortedStands.map(stand => {
              const age = getStandAge(stand.createdAt);
              const status = getAgeStatus(stand.createdAt);
              
              return (
                <div key={stand.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{stand.name}</h4>
                      <p className="text-sm text-gray-600">
                        Installé le: {formatDate(stand.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        status.status === 'old'
                          ? 'bg-red-100 text-red-700'
                          : status.status === 'aging'
                          ? 'bg-yellow-100 text-yellow-700'
                          : status.status === 'good'
                          ? 'bg-blue-100 text-blue-700'
                          : status.status === 'new'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <Calendar className="h-4 w-4" />
                        {age}
                      </span>
                      {status.status === 'old' && (
                        <span className="text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;