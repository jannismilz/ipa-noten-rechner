import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, UserCircle, Home } from 'lucide-react';
import { APP_VERSION } from '../utils/version';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="header-logo">
            <Home size={20} />
            <h1>
              IPA Noten Rechner
              <span className="version-badge">{APP_VERSION}</span>
            </h1>
          </button>
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <UserCircle size={18} />
                <span>
                  {user?.first_name || 'Benutzer'} {user?.last_name || ''}
                </span>
              </div>
              <button onClick={() => navigate('/profile')} className="btn-secondary-small">
                Profil
              </button>
              <button onClick={handleLogout} className="btn-secondary-small">
                <LogOut size={16} />
                Abmelden
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-primary-small">
              <LogIn size={16} />
              Anmelden
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
