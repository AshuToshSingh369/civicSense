import { Form, Link } from "react-router";

export default function VerifyOtp() {
    return (
        <div className="flex min-h-screen bg-white font-inter text-gray-900">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-50 border-r border-gray-200 flex-col justify-center px-12">
                <h1 className="text-3xl font-bold text-blue-900 mb-4">Security Check</h1>
                <p className="text-lg text-gray-700">
                    We use Two-Factor Authentication (2FA) to protect your account and personal data.
                </p>
            </div>

            {/* Right Panel - OTP Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-24">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h1>
                        <p className="text-gray-600 text-lg">Enter the code sent to your email.</p>
                    </div>

                    <Form method="post" className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-lg font-bold text-gray-800 mb-3">
                                6-Digit Code <span className="text-red-700" aria-hidden="true">*</span>
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                pattern="[0-9]*"
                                maxLength={6}
                                required
                                aria-required="true"
                                className="input-gov text-center text-3xl tracking-[0.5em] font-mono h-16"
                                placeholder="------"
                            />
                            <p className="text-sm text-gray-500 mt-2">Example: 123456</p>
                        </div>

                        <button type="submit" className="btn-primary w-full shadow-lg">
                            Verify Account
                        </button>
                    </Form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-700 font-medium">
                            Didn't receive code?{" "}
                            <button type="button" className="text-blue-700 font-bold underline hover:text-blue-900">
                                Resend Code
                            </button>
                        </p>
                        <div className="mt-6">
                            <Link to="/login" className="text-gray-600 underline hover:text-gray-900">
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
