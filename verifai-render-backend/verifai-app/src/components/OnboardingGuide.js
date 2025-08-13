
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Camera, MousePointerClick, Upload } from 'lucide-react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const OnboardingGuide = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const nodeRef = React.useRef(null);

    const steps = [
        {
            icon: <Camera className="w-16 h-16 text-purple-300" />,
            title: "Welcome to VerifAi!",
            text: "Let's quickly walk you through how to verify an item in seconds.",
            highlight: 'none',
        },
        {
            icon: <Camera className="w-16 h-16 text-purple-300" />,
            title: "Live Object Detection",
            text: "Point your camera at an object. Our AI will automatically detect and draw a box around it.",
            highlight: 'camera-view',
        },
        {
            icon: <MousePointerClick className="w-16 h-16 text-green-300" />,
            title: "Tap to Verify",
            text: "Simply tap the highlighted box around an object to instantly begin the verification process.",
            highlight: 'camera-view',
        },
        {
            icon: <Upload className="w-16 h-16 text-blue-300" />,
            title: "Upload from Device",
            text: "You can also use the Quick Actions to verify an existing image or document from your device.",
            highlight: 'quick-actions',
        },
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${currentStep.highlight === 'camera-view' ? 'border-4 border-purple-500 rounded-3xl shadow-2xl' : ''}`} style={{ top: '10%', bottom: '50%', left: '5%', right: '5%' }}></div>
            <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${currentStep.highlight === 'quick-actions' ? 'border-4 border-blue-500 rounded-3xl shadow-2xl' : ''}`} style={{ top: '55%', bottom: '5%', left: '5%', right: '5%' }}></div>

            <TransitionGroup>
                <CSSTransition
                    key={step}
                    timeout={500}
                    classNames="onboard-step"
                    nodeRef={nodeRef}
                >
                    <div ref={nodeRef} className="relative w-full max-w-sm bg-gray-800/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-center p-8">
                        <div className="flex justify-center mb-6">
                            {currentStep.icon}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">{currentStep.title}</h2>
                        <p className="text-gray-300 text-lg mb-8">{currentStep.text}</p>

                        <div className="flex items-center justify-center space-x-3 mb-8">
                            {steps.map((_, index) => (
                                <div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${step === index ? 'bg-purple-500 scale-125' : 'bg-gray-600'}`}></div>
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105"
                        >
                            {step === steps.length - 1 ? "Get Started" : "Next"}
                        </button>

                        {step < steps.length - 1 && (
                            <button onClick={onComplete} className="mt-4 text-gray-400 hover:text-white text-sm">
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
