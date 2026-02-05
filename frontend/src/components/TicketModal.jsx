import { useState } from 'react';
import { X, Mail, Check, Loader2, ExternalLink } from 'lucide-react';
import { ticketsApi } from '../api';

export default function TicketModal({ isOpen, onClose, event }) {
    const [email, setEmail] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!consent) {
            setError('Please agree to receive event updates');
            return;
        }

        setLoading(true);

        try {
            const response = await ticketsApi.create({
                email,
                consent,
                eventId: event._id
            });

            // Redirect to original event URL
            window.open(response.data.redirectUrl || event.originalEventUrl, '_blank');
            onClose();
            setEmail('');
            setConsent(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md card p-6 animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="font-display text-xl font-semibold text-white mb-2">
                        Get Tickets
                    </h2>
                    <p className="text-dark-400 text-sm">
                        Enter your email to continue to <span className="text-primary-400">{event.title}</span>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input pl-10"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Consent checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                            <input
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="sr-only"
                                disabled={loading}
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${consent
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-dark-600 group-hover:border-dark-500'
                                }`}>
                                {consent && <Check className="w-3 h-3 text-white" />}
                            </div>
                        </div>
                        <span className="text-sm text-dark-400">
                            I agree to receive event updates and promotional emails. You can unsubscribe at any time.
                        </span>
                    </label>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-accent w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue to Tickets</span>
                                <ExternalLink className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-4 text-center text-xs text-dark-500">
                    You'll be redirected to {event.sourceWebsiteName} to complete your purchase
                </p>
            </div>
        </div>
    );
}
