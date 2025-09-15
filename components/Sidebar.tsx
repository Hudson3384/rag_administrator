
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BotIcon, DashboardIcon } from './icons';

const Sidebar: React.FC = () => {
  const commonLinkClass = 'flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200';
  const activeLinkClass = 'bg-gray-800 text-white';

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4">
      <div className="flex items-center mb-8">
        <BotIcon className="w-8 h-8 text-blue-500 mr-3" />
        <h1 className="text-xl font-bold text-white">Bot Platform</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : ''}`}
        >
          <DashboardIcon className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink
          to="/bots"
          className={({ isActive }) => `${commonLinkClass} ${isActive ? activeLinkClass : ''}`}
        >
          <BotIcon className="w-5 h-5 mr-3" />
          My Bots
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
