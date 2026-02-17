import { Link } from "react-router";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-16 text-sm text-gray-500">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                <div className="col-span-2">
                    <div className="text-2xl font-bold text-gray-900 font-serif mb-4 flex items-center gap-2">
                        <span>🇳🇵</span> CivicSense
                    </div>
                    <p className="max-w-sm ml-8">A government initiative for transparent, efficient, and accountable local governance. Built for the people of Nepal.</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Platform</h4>
                    <ul className="space-y-3">
                        <li><Link to="/login" className="hover:text-blue-800">Login</Link></li>
                        <li><Link to="/signup" className="hover:text-blue-800">Register</Link></li>
                        <li><Link to="/track-report" className="hover:text-blue-800">Track Status</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Legal</h4>
                    <ul className="space-y-3">
                        <li><Link to="/privacy-policy" className="hover:text-blue-800">Privacy Policy</Link></li>
                        <li><Link to="/terms-of-service" className="hover:text-blue-800">Terms of Service</Link></li>
                        <li><Link to="/accessibility" className="hover:text-blue-800">Accessibility</Link></li>
                    </ul>

                </div>
            </div>
        </footer>
    );
}
