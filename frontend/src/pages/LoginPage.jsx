import { useAuth } from '../context/AuthContext';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    const { login, user } = useAuth();

    // If already logged in, redirect
    if (user) {
        window.location.href = '/dashboard';
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="card p-8 text-center">
                    {/* Logo */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <h1 className="font-display text-2xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-dark-400 mb-8">
                        Sign in to access the admin dashboard and manage events
                    </p>

                    {/* Google Sign In */}
                    <button
                        onClick={login}
                        className="btn w-full py-3 bg-white text-dark-900 hover:bg-dark-100 font-medium"
                    >
                        <Chrome className="w-5 h-5" />
                        <span>Continue with Google</span>
                    </button>

                    <p className="mt-6 text-sm text-dark-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <a href="/" className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                        ← Back to Events
                    </a>
                </div>
            </div>
        </div>
    );
}
