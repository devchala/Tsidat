import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <Link to="/" className="font-bold text-primaryDark text-lg">
        ጽዳት Tsidat
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <span>{user.name}</span>
            <button onClick={logout} className="text-danger">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
