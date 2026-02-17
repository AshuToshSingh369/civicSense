import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
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
                    <h1 className="text-4xl font-bold font-serif text-gray-900 mb-8 border-b border-gray-100 pb-6">Privacy Policy</h1>

                    <p className="text-gray-600 mb-8 italic">Last Updated: February 2026</p>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-600 mb-4">
                            CivicSense is committed to protecting the privacy and security of our users' personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our platform for civic reporting.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data Collection</h2>
                        <p className="text-gray-600 mb-4">
                            We collect information necessary to provide and improve our services, including:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 text-gray-600">
                            <li>Account Information: Name, email address, and verified mobile number.</li>
                            <li>Report Data: Descriptions of civic issues, photos, and precise GPS location coordinates.</li>
                            <li>Authentication Data: Encrypted password strings and session identifiers.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Information</h2>
                        <p className="text-gray-600 mb-4">
                            The information collected is used for the following official purposes:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 text-gray-600">
                            <li>To process and route your reports to the appropriate municipal authorities.</li>
                            <li>To provide real-time updates regarding the status of your reported issues.</li>
                            <li>To verify the authenticity of reports and prevent misuse of the platform.</li>
                            <li>To analyze civic trends for improved municipal planning and service delivery.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Transparency</h2>
                        <p className="text-gray-600 mb-4">
                            CivicSense does not sell or lease your personal data to third parties. Your report details (excluding sensitive personal identity markers) are shared exclusively with authorized government officials and field technicians responsible for resolving the reported issue.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                        <p className="text-gray-600 mb-4">
                            We implement industry-standard security measures, including HTTPS encryption and secure server environments, to protect your data from unauthorized access, alteration, or disclosure.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
                        <p className="text-gray-600 mb-4">
                            Verified citizens have the right to access, rectify, or request the deletion of their personal information archived on our servers. You may exercise these rights through your User Dashboard.
                        </p>
                    </section>

                    <p className="text-sm text-gray-400 mt-12 pt-8 border-t border-gray-100">
                        This policy is governed by the laws of the Government of Nepal regarding digital data protection and privacy.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
