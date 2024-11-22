import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, link }) => {
  return (
    <Link 
      to={link} 
      className="card p-6 hover:scale-[1.02] transition-transform cursor-pointer group"
    >
      <div className="flex items-center">
        <div className={`bg-gradient-to-br ${color} rounded-xl p-3 text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
      </div>
    </Link>
  );
};

export default StatCard;