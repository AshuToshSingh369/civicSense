import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-gray-900 leading-relaxed">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 text-sm font-bold text-blue-700 hover:underline flex items-center gap-2"
                >
                    ← Back to Previous Page
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 lg:p-16">
                    <h1 className="text-4xl font-bold font-serif text-gray-900 mb-8 border-b border-gray-100 pb-6">Terms of Service</h1>

                    <p className="text-gray-600 mb-8 italic">Last Updated: February 2026</p>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 mb-4">
                            By accessing or using the CivicSense platform, you agree to be bound by these Terms of Service and all applicable laws and regulations of the Government of Nepal.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accountability</h2>
                        <p className="text-gray-600 mb-4">
                            Users are responsible for the accuracy of the information provided in their reports. CivicSense is a platform for genuine civic reporting. Any attempt to provide false information, file malicious reports, or impersonate government officials will result in immediate account termination and potential legal action.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Content</h2>
                        <p className="text-gray-600 mb-4">
                            Images and descriptions uploaded to the platform become part of the official municipal record. By submitting a report, you grant the municipal authorities the right to use this information to resolve the issue and document infrastructure maintenance.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Authority Role and Service Limits</h2>
                        <p className="text-gray-600 mb-4">
                            CivicSense acts as a bridge between citizens and authorities. While we strive for rapid resolution, response times depend on municipal resources, budget allocations, and priority levels assigned by the government authorities.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Activities</h2>
                        <p className="text-gray-600 mb-4">
                            Users are strictly prohibited from:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 text-gray-600">
                            <li>Uploading inappropriate or offensive imagery.</li>
                            <li>Using the platform for political propaganda or private advertising.</li>
                            <li>Attempting to bypass platform security or access the Authority Dashboard without authorization.</li>
                            <li>Harassing municipal workers or other users through the platform.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Modification of Services</h2>
                        <p className="text-gray-600 mb-4">
                            We reserve the right to modify or discontinue any part of the service at any time to comply with government directives or improve platform infrastructure.
                        </p>
                    </section>

                    <p className="text-sm text-gray-400 mt-12 pt-8 border-t border-gray-100">
                        For any inquiries regarding these terms, please contact the Ministry of Urban Development or your local municipal office.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
