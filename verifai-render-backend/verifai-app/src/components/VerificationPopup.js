
import React from 'react';
import PropTypes from 'prop-types';
import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { CSSTransition } from 'react-transition-group';

const VerificationPopup = ({ result, onClose, isVisible }) => {
    const nodeRef = React.useRef(null);

    const sendFeedback = async (isHelpful, verificationId) => {
        const userId = "user_placeholder_id"; // Replace with actual user ID if available
        try {
            const response = await fetch("/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    verification_id: verificationId,
                    is_helpful: isHelpful,
                    user_id: userId,
                }),
            });
            if (response.ok) {
                console.log("Feedback sent successfully!");
            } else {
                console.error("Failed to send feedback:", response.statusText);
            }
        } catch (error) {
            console.error("Error sending feedback:", error);
        }
    };

    const statusConfig = {
        verified: {
            icon: <CheckCircle className="w-12 h-12 text-green-300" />,
            gradient: 'from-green-500/20 to-gray-800/20',
            borderColor: 'border-green-400/50',
            titleColor: 'text-green-300',
        },
        warning: {
            icon: <AlertTriangle className="w-12 h-12 text-amber-300" />,
            gradient: 'from-amber-500/20 to-gray-800/20',
            borderColor: 'border-amber-400/50',
            titleColor: 'text-amber-300',
        },
        danger: {
            icon: <XCircle className="w-12 h-12 text-red-300" />,
            gradient: 'from-red-500/20 to-gray-800/20',
            borderColor: 'border-red-400/50',
            titleColor: 'text-red-300',
        },
    };

    const currentStatus = statusConfig[result?.status] || statusConfig.danger;

    return (
        <CSSTransition
            in={isVisible}
            timeout={300}
            classNames="popup"
            unmountOnExit
            nodeRef={nodeRef}
        >
            <div ref={nodeRef} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className={`relative w-full max-w-lg mx-auto bg-gray-800/60 backdrop-blur-2xl border ${currentStatus.borderColor} rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                    <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${currentStatus.gradient} opacity-50 -z-10`}></div>
                    
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10">
                        <X className="w-7 h-7" />
                    </button>

                    <div className="p-8 text-center pb-0"> {/* Header content with padding, but no bottom padding */} 
                        <div className="flex justify-center mb-5">
                            {currentStatus.icon}
                        </div>

                        <h2 className={`text-3xl font-bold mb-3 ${currentStatus.titleColor}`}>{result?.title || 'Verification Result'}</h2>
                        <p className="text-gray-300 mb-6">{result?.summary || 'No summary available.'}</p>
                    </div>

                    <div className="overflow-y-auto flex-grow min-h-0 px-8"> {/* Scrollable content area with horizontal padding */} 
                        <div className="text-left bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-gray-400 font-medium">Status</span>
                                <span className={`font-bold text-lg ${currentStatus.titleColor}`}>{result?.status?.toUpperCase()}</span>
                            </div>
                            {result?.confidence && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-400 font-medium">Confidence</span>
                                    <span className="font-bold text-lg text-white">{result.confidence.toFixed(2)}%</span>
                                </div>
                            )}
                        </div>

                        {result?.explanation && (
                            <div className="text-left bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
                                <h3 className="font-semibold text-white mb-2">Explanation</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
                            </div>
                        )}

                        {result?.remediation && (
                            <div className="text-left bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
                                <h3 className="font-semibold text-white mb-2">Recommended Action</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">{result.remediation}</p>
                            </div>
                        )}

                        <div className="mt-6 mb-4">
                            <p className="text-gray-300 text-sm mb-2">Was this result helpful?</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => sendFeedback(true, result?.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors shadow-md"
                                >
                                    <CheckCircle className="w-5 h-5" /> Helpful
                                </button>
                                <button
                                    onClick={() => sendFeedback(false, result?.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-md"
                                >
                                    <XCircle className="w-5 h-5" /> Not Helpful
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 pt-0"> {/* Footer content with padding, but no top padding */} 
                        <div className="flex space-x-4 mt-6">
                            <button 
                                onClick={onClose} 
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
                            >
                                Dismiss
                            </button>
                            <button 
                                onClick={onClose} 
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
                            >
                                Scan Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
};

VerificationPopup.propTypes = {
    result: PropTypes.shape({
        status: PropTypes.oneOf(['verified', 'warning', 'danger']).isRequired,
        title: PropTypes.string.isRequired,
        summary: PropTypes.string,
        confidence: PropTypes.number,
        explanation: PropTypes.string,
        remediation: PropTypes.string,
    }),
    onClose: PropTypes.func.isRequired,
    isVisible: PropTypes.bool.isRequired,
};

export default VerificationPopup;
