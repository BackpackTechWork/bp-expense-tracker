"use client";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDEBD0] to-[#F7CAC9] flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-[#DC143C] rounded-full flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        You&apos;re Offline
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Don&apos;t worry! You can still add expenses and
                        they&apos;ll sync when you&apos;re back online.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            What you can do offline:
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                            <li>• Add new expenses</li>
                            <li>• View cached data</li>
                            <li>• Browse previous expenses</li>
                            <li>• Use the calculator</li>
                        </ul>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            When you&apos;re back online:
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                            <li>
                                • Your offline expenses will sync automatically
                            </li>
                            <li>• All features will be available</li>
                            <li>• Data will be up to date</li>
                        </ul>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-3 bg-[#DC143C] text-white rounded-lg hover:bg-[#F75270] transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
