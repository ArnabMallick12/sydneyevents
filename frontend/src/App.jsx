import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                    <footer className="py-6 border-t border-dark-800">
                        <div className="container mx-auto px-4 text-center text-dark-500 text-sm">
                            <p>© 2024 Sydney Events. Discover what's happening in your city.</p>
                        </div>
                    </footer>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
