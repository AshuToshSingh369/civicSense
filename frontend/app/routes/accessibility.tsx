import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Accessibility() {
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
                    <h1 className="text-4xl font-bold font-serif text-gray-900 mb-8 border-b border-gray-100 pb-6">Accessibility Statement</h1>

                    <p className="text-gray-600 mb-8 italic">Last Updated: February 2026</p>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
                        <p className="text-gray-600 mb-4">
                            CivicSense believes that digital government services should be accessible to all citizens, regardless of their physical or cognitive abilities. We are dedicated to ensuring our platform is usable for the widest possible audience.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance Standard</h2>
                        <p className="text-gray-600 mb-4">
                            We aim to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our design system prioritizes high-contrast color palettes, clear typography, and logical navigation patterns.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features for Accessibility</h2>
                        <p className="text-gray-600 mb-4">
                            To facilitate an inclusive experience, we have implemented the following:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 text-gray-600">
                            <li>Semantic HTML: Using proper document structure for screen reader compatibility.</li>
                            <li>Responsive Design: Full functionality across smartphones, tablets, and desktop computers.</li>
                            <li>Keyboard Navigation: Ensuring interactive elements are accessible via standard keyboard inputs.</li>
                            <li>Text Clarity: Focus on legible fonts and appropriate line heights for easier reading.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Challenges</h2>
                        <p className="text-gray-600 mb-4">
                            While we strive for full accessibility, some portions of our platform, such as complex map visualizations or legacy documents, may present challenges for certain users. We are actively working to provide alternative textual descriptions for these elements.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback and Contact</h2>
                        <p className="text-gray-600 mb-4">
                            We welcome feedback on the accessibility of CivicSense. If you encounter barriers while using our platform, please contact us. We aim to respond within 48 business hours to address any concerns.
                        </p>
                    </section>

                    <p className="text-sm text-gray-400 mt-12 pt-8 border-t border-gray-100">
                        This statement is part of our ongoing effort to implement a "Digital Nepal" that leaves no citizen behind.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
