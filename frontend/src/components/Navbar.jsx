import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Navbar() {
    const { user, loading, login, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 glass border-b border-dark-800/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl">
                            <span className="text-white">Sydney</span>
                            <span className="gradient-text">Events</span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="btn btn-ghost text-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Discover</span>
                        </Link>

                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
                        ) : user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="btn btn-ghost text-sm"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        {user.picture && (
                                            <img
                                                src={user.picture}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full border-2 border-dark-700"
                                            />
                                        )}
                                        <span className="text-sm text-dark-300 hidden sm:block">
                                            {user.name}
                                        </span>
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="btn btn-ghost text-sm text-dark-400 hover:text-red-400"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={login}
                                className="btn btn-primary text-sm"
                            >
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
