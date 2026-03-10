"use client";

import { motion } from "framer-motion";
import FileUpload from "@/components/FileUpload";

export default function UploadPage() {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-16">
            <div className="max-w-2xl w-full mx-auto">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-100 mb-4">
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        Step 1 of 3
                    </span>
                    <h1 className="text-4xl font-black text-slate-900 mb-4">
                        Upload Your Resume
                    </h1>
                    <p className="text-slate-500 text-base max-w-md mx-auto">
                        Upload your resume in PDF format. Our AI will analyze it and provide
                        an instant ATS compatibility report.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8"
                >
                    <FileUpload />
                </motion.div>

                {/* Tips */}
                <motion.div
                    className="mt-8 grid sm:grid-cols-3 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    {[
                        {
                            icon: "📄",
                            title: "PDF Only",
                            desc: "Text-based PDFs only (not scanned images)",
                        },
                        {
                            icon: "⚡",
                            title: "Max 5MB",
                            desc: "Keep your resume concise for best results",
                        },
                        {
                            icon: "🔒",
                            title: "100% Private",
                            desc: "Not stored, not shared, deleted after analysis",
                        },
                    ].map((tip) => (
                        <div
                            key={tip.title}
                            className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center"
                        >
                            <div className="text-2xl mb-2">{tip.icon}</div>
                            <p className="font-semibold text-slate-700 text-sm">{tip.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{tip.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
