// Mock database for development when MySQL is not available

const mockUsers = [
  {
    id: 1,
    email: 'admin@alloverlogistics.com',
    password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeeDUGd/JQfYxdnOK', // admin123
    first_name: 'Admin',
    last_name: 'User',
    phone: '+1234567890',
    role: 'admin',
    is_active: true,
    is_online: false,
    has_training_access: true,
    mfa_enabled: false,
    theme_preference: 'dark',
    theme_color: 'blue'
  },
  {
    id: 2,
    email: 'dispatcher@alloverlogistics.com',
    password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeeDUGd/JQfYxdnOK', // dispatch123
    first_name: 'John',
    last_name: 'Dispatcher',
    phone: '+1234567891',
    role: 'dispatcher',
    is_active: true,
    is_online: false,
    has_training_access: true,
    mfa_enabled: false
  }
];

const mockData = {
  users: mockUsers,
  dashboard_stats: {
    totalLoads: 0,
    activeTrucks: 0,
    pendingInvoices: 0,
    revenue: 0
  },
  notifications: []
};

export const mockQuery = async (sql, params = []) => {
  console.log('🔄 Mock DB Query:', sql.substring(0, 100) + '...', 'Params:', params.slice(0, 2));
  const sqlLower = sql.toLowerCase().trim();

  // Handle login queries
  if (sqlLower.includes('select') && sqlLower.includes('users') && sqlLower.includes('email')) {
    const email = params[0];
    const user = mockUsers.find(u => u.email === email.toLowerCase());
    console.log('🔍 Mock DB: Looking for user with email:', email, 'Found:', user ? 'Yes' : 'No');
    return user ? [user] : [];
  }
  
  // Handle update queries
  if (sqlLower.includes('update users') && sqlLower.includes('last_login')) {
    return { affectedRows: 1 };
  }
  
  // Handle insert queries for logs
  if (sqlLower.includes('insert into security_events') || 
      sqlLower.includes('insert into user_sessions')) {
    return { insertId: Math.floor(Math.random() * 1000) };
  }
  
  // Handle other user queries
  if (sqlLower.includes('select') && sqlLower.includes('users')) {
    return mockUsers;
  }
  
  // Handle dashboard stats
  if (sqlLower.includes('dashboard') || sqlLower.includes('stats')) {
    return [mockData.dashboard_stats];
  }
  
  // Default empty result
  return [];
};

export const isMockMode = () => {
  return process.env.NODE_ENV === 'development';
};
