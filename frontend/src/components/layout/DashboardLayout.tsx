import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar - Simple for now */}
        <aside className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground">AOL TMS</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome, {user?.firstName}!
            </p>
          </div>
          
          <nav className="px-4">
            <ul className="space-y-2">
              <li>
                <a 
                  href="/dashboard/admin"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded-md"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard/loads"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded-md"
                >
                  Loads
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard/trucks"
                  className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded-md"
                >
                  Trucks
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
