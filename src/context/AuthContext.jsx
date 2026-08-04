import { createContext, useContext, useState, useEffect } from 'react';

// Mock Supabase Auth - Simulación local para desarrollo
const mockUsers = {
  'profesor@target.com': { 
    id: 'user-1', 
    email: 'profesor@target.com', 
    name: 'Juan Profesor',
    roles: ['profesor'] 
  },
  'alumno@target.com': { 
    id: 'user-2', 
    email: 'alumno@target.com', 
    name: 'María Alumna',
    roles: ['alumno'] 
  },
  'admin@target.com': { 
    id: 'user-3', 
    email: 'admin@target.com', 
    name: 'Carlos Admin',
    roles: ['admin', 'profesor'] 
  },
  'marketing@target.com': { 
    id: 'user-4', 
    email: 'marketing@target.com', 
    name: 'Laura Marketing',
    roles: ['marketing', 'alumno'] 
  },
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular verificación de sesión al cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedSession = localStorage.getItem('targetSession');
      if (savedSession) {
        const userData = JSON.parse(savedSession);
        setUser(userData);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock login - En producción será real con Supabase Auth
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulación: cualquier contraseña vale
      if (mockUsers[email]) {
        const userData = mockUsers[email];
        setUser(userData);
        localStorage.setItem('targetSession', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mock logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('targetSession');
  };

  // Verificar si tiene un rol específico
  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  // Verificar si tiene alguno de varios roles
  const hasAnyRole = (roles) => {
    return user?.roles?.some(role => roles.includes(role));
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
