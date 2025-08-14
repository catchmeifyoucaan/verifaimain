import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
    Camera, 
    Upload, 
    Shield, 
    Zap, 
    Target, 
    CheckCircle, 
    ArrowRight, 
    ArrowLeft, 
    X,
    Star,
    Globe,
    Sparkles
} from 'lucide-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const OnboardingGuide = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const nodeRef = React.useRef(null);

    const steps = [
        {
            icon: <Sparkles className="w-20 h-20 text-purple-400" />,
            title: "Welcome to VerifAi! 🚀",
            subtitle: "Your AI-Powered Authenticity Verification Platform",
            text: "Get ready to experience the future of verification. VerifAi combines cutting-edge AI with intuitive design to help you verify anything, anywhere, anytime.",
            features: [
                "Instant AI-powered verification",
                "Real-time camera detection",
                "Multi-format file support",
                "Professional-grade security"
            ],
            highlight: 'none',
            action: "Let's Begin",
            showSkip: false
        },
        {
            icon: <Camera className="w-20 h-20 text-blue-400" />,
            title: "Live AI Object Detection",
            subtitle: "See the magic happen in real-time",
            text: "Point your camera at any object and watch as our advanced AI instantly detects and identifies it. The system uses state-of-the-art computer vision to recognize objects with remarkable accuracy.",
            features: [
                "Real-time object recognition",
                "High-accuracy detection",
                "Smooth performance",
                "Professional camera interface"
            ],
            highlight: 'camera-view',
            action: "Next: Object Selection",
            showSkip: true
        },
        {
            icon: <Target className="w-20 h-20 text-green-400" />,
            title: "Smart Object Selection",
            subtitle: "Tap to verify with precision",
            text: "Once objects are detected, simply tap on any highlighted box to select it for verification. Our AI will analyze the selected object and provide detailed authenticity insights.",
            features: [
                "One-tap object selection",
                "Visual feedback system",
                "Haptic responses",
                "Instant verification trigger"
            ],
            highlight: 'camera-view',
            action: "Next: AI Agents",
            showSkip: true
        },
        {
            icon: <Shield className="w-20 h-20 text-purple-400" />,
            title: "Specialized AI Agents",
            subtitle: "Choose the right tool for the job",
            text: "Select from our specialized AI agents designed for different verification tasks. Each agent is trained on specific domains to provide the most accurate results.",
            features: [
                "General Purpose Agent - Broad verification",
                "ID Document Verifier - Fraud detection",
                "Product Authenticator - Brand verification",
                "Text Analyzer - Content analysis"
            ],
            highlight: 'camera-view',
            action: "Next: File Upload",
            showSkip: true
        },
        {
            icon: <Upload className="w-20 h-20 text-orange-400" />,
            title: "Multi-Format File Support",
            subtitle: "Upload anything for verification",
            text: "Beyond camera verification, you can upload images, documents, videos, and more. Our system supports a wide range of file types for comprehensive analysis.",
            features: [
                "Images (JPG, PNG, WebP)",
                "Documents (PDF, DOC, TXT)",
                "Videos (MP4, MOV, AVI)",
                "Audio files (MP3, WAV, M4A)"
            ],
            highlight: 'quick-actions',
            action: "Next: Results & Reports",
            showSkip: true
        },
        {
            icon: <CheckCircle className="w-20 h-20 text-green-400" />,
            title: "Detailed Verification Reports",
            subtitle: "Get comprehensive insights",
            text: "Receive detailed, professional reports with confidence scores, risk assessments, and actionable recommendations. Every verification includes thorough analysis and clear explanations.",
            features: [
                "Confidence scoring system",
                "Risk level indicators",
                "Detailed findings",
                "Remediation suggestions"
            ],
            highlight: 'quick-actions',
            action: "Next: Security & Privacy",
            showSkip: true
        },
        {
            icon: <Globe className="w-20 h-20 text-cyan-400" />,
            title: "Enterprise-Grade Security",
            subtitle: "Your data is protected",
            text: "Built with security-first principles, VerifAi ensures your data remains private and secure. We use industry-standard encryption and follow strict privacy protocols.",
            features: [
                "End-to-end encryption",
                "Secure cloud processing",
                "Privacy compliance",
                "Regular security audits"
            ],
            highlight: 'none',
            action: "Next: Getting Started",
            showSkip: true
        },
        {
            icon: <Star className="w-20 h-20 text-yellow-400" />,
            title: "You're All Set! ✨",
            subtitle: "Ready to start verifying",
            text: "Congratulations! You now have a complete understanding of VerifAi's capabilities. Start exploring and discover how AI can transform your verification workflow.",
            features: [
                "Camera verification ready",
                "File upload available",
                "AI agents configured",
                "History tracking enabled"
            ],
            highlight: 'none',
            action: "Start Using VerifAi",
            showSkip: false
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const currentStep = steps[step];
    const progress = ((step + 1) / steps.length) * 100;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            {/* Highlight Overlays */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                currentStep.highlight === 'camera-view' 
                    ? 'border-4 border-blue-500 rounded-3xl shadow-2xl shadow-blue-500/50' 
                    : ''
            }`} style={{ top: '10%', bottom: '50%', left: '5%', right: '5%' }}></div>
            
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                currentStep.highlight === 'quick-actions' 
                    ? 'border-4 border-orange-500 rounded-3xl shadow-2xl shadow-orange-500/50' 
                    : ''
            }`} style={{ top: '55%', bottom: '5%', left: '5%', right: '5%' }}></div>

            {/* Close Button */}
            <button 
                onClick={onComplete}
                className="absolute top-6 right-6 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full border border-gray-600/50 text-gray-400 hover:text-white transition-all duration-200 z-10"
                title="Skip Tour"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Progress Bar */}
            <div className="absolute top-6 left-6 right-20 z-10">
                <div className="w-full bg-gray-800/50 rounded-full h-2 border border-gray-600/50">
                    <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Step {step + 1} of {steps.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
            </div>

            <TransitionGroup>
                <CSSTransition
                    key={step}
                    timeout={500}
                    classNames="onboard-step"
                    nodeRef={nodeRef}
                >
                    <div ref={nodeRef} className="relative w-full max-w-2xl bg-gray-800/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-center p-8 lg:p-12">
                        {/* Step Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="relative">
                                {currentStep.icon}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="mb-8">
                            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                                {currentStep.title}
                            </h2>
                            <p className="text-xl text-purple-300 mb-4 font-medium">
                                {currentStep.subtitle}
                            </p>
                            <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                {currentStep.text}
                            </p>

                            {/* Features List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {currentStep.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-left">
                                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step Indicators */}
                        <div className="flex items-center justify-center space-x-2 mb-8">
                            {steps.map((_, index) => (
                                <div 
                                    key={index} 
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        step === index 
                                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-125' 
                                            : 'bg-gray-600'
                                    }`}
                                ></div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center space-x-4">
                            {step > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    className="flex items-center space-x-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Previous</span>
                                </button>
                            )}
                            
                            <button
                                onClick={handleNext}
                                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 hover:shadow-2xl"
                            >
                                <span>{currentStep.action}</span>
                                {step < steps.length - 1 ? <ArrowRight className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Skip Option */}
                        {currentStep.showSkip && (
                            <button 
                                onClick={onComplete} 
                                className="mt-6 text-gray-400 hover:text-white text-sm transition-colors duration-200"
                            >
                                Skip Tour
                            </button>
                        )}
                    </div>
                </CSSTransition>
            </TransitionGroup>
        </div>
    );
};

OnboardingGuide.propTypes = {
    onComplete: PropTypes.func.isRequired,
};

export default OnboardingGuide;