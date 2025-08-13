import React, { useState, useEffect, useRef } from 'react';
import { Loader, CameraOff, Image, FileText, Tag, FlaskConical, Wine, Utensils, Droplet } from 'lucide-react';
import PropTypes from 'prop-types';

import VerificationPopup from './VerificationPopup';

const CameraScreen = React.forwardRef(({ model, modelLoading, detectedObjects, handleSelectObject, setDetectedObjects, triggerHapticFeedback, selectedObject, onVerify, isVerifying, handleNavigate, cameraVerificationResult, clearCameraVerification }, ref) => {
    const [message, setMessage] = useState("Loading AI Vision model...");
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const renderedObjectsRef = useRef([]);
    const isDetecting = useRef(false); // Use useRef to prevent re-renders

    const lerp = (a, b, t) => a + (b - a) * t;

    useEffect(() => {
        let animationFrameId;
        const videoElement = videoRef.current;

        const detectFrame = async () => {
            if (videoElement?.readyState === 4 && model && !isDetecting.current) {
                isDetecting.current = true; // Set detecting state to true
                setMessage("Detecting objects...");
                try {
                    const newPredictions = await model.detect(videoElement);
                    const smoothedObjects = [];
                    newPredictions.forEach(pred => {
                        if (pred.score > 0.6) {
                            const existingObj = renderedObjectsRef.current.find(obj => obj.class === pred.class);
                            if (existingObj) {
                                const smoothedBbox = [ lerp(existingObj.bbox[0], pred.bbox[0], 0.2), lerp(existingObj.bbox[1], pred.bbox[1], 0.2), lerp(existingObj.bbox[2], pred.bbox[2], 0.2), lerp(existingObj.bbox[3], pred.bbox[3], 0.2) ];
                                smoothedObjects.push({ ...pred, bbox: smoothedBbox });
                            } else {
                                smoothedObjects.push(pred);
                            }
                        }
                    });
                    renderedObjectsRef.current = smoothedObjects;
                    setDetectedObjects(smoothedObjects);
                    if (smoothedObjects.length > 0) {
                        setMessage("Tap a detected object to verify.");
                        triggerHapticFeedback(50); // Short haptic for detection
                    } else {
                        setMessage("No objects detected. Adjust position or lighting.");
                    }
                } catch (error) {
                    console.error("Error during object detection:", error);
                    setMessage("Error detecting objects.");
                } finally {
                    isDetecting.current = false; // Reset detecting state
                }
            } else if (videoElement?.readyState !== 4) {
                setMessage("Waiting for camera feed...");
            }
            animationFrameId = requestAnimationFrame(detectFrame);
        };

        if (modelLoading) {
            setMessage("Loading AI Vision model...");
            return;
        }

        if (model) {
            setMessage("Requesting camera access...");
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    if (videoElement) {
                        videoElement.srcObject = stream;
                        videoElement.onloadedmetadata = () => {
                            setMessage("Camera ready. Looking for objects...");
                            detectFrame();
                        };
                    }
                })
                .catch(err => {
                    console.error("Camera access error:", err);
                    setMessage("Camera access denied or error. Please enable camera permissions.");
                });
        }
        return () => { 
            cancelAnimationFrame(animationFrameId); 
            if (videoElement?.srcObject) { 
                videoElement.srcObject.getTracks().forEach(track => track.stop()); 
            }
        };
    }, [model, modelLoading, setDetectedObjects, triggerHapticFeedback, setMessage]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 lg:p-8 relative" ref={ref}>
            <div className="relative w-full max-w-3xl aspect-video bg-gray-900/50 rounded-2xl shadow-2xl border border-gray-700 flex items-center justify-center overflow-hidden mb-8">
                <video ref={videoRef} className="absolute w-full h-full object-cover rounded-xl" autoPlay playsInline muted style={{ pointerEvents: 'none' }} />
                {detectedObjects.map((obj, i) => {
                    // Guard clause to prevent crash on navigation
                    if (!videoRef.current || !videoRef.current.videoWidth) {
                        return null;
                    }

                    const videoWidth = videoRef.current.offsetWidth;
                    const videoHeight = videoRef.current.offsetHeight;
                    const [x, y, width, height] = obj.bbox;

                    // Scale bounding box coordinates to match the displayed video size
                    const scaledX = (x / videoRef.current.videoWidth) * videoWidth;
                    const scaledY = (y / videoRef.current.videoHeight) * videoHeight;
                    const scaledWidth = (width / videoRef.current.videoWidth) * videoWidth;
                    const scaledHeight = (height / videoRef.current.videoHeight) * videoHeight;

                    console.log(`Object ${obj.class} scaled bbox: x=${scaledX}, y=${scaledY}, width=${scaledWidth}, height=${scaledHeight}`);

                    return (
                        <div 
                        key={i} 
                        className={`absolute border-4 rounded-lg cursor-pointer transition-all group flex items-end justify-start ${selectedObject?.class === obj.class ? 'border-green-400 ring-4 ring-green-400/50' : 'border-purple-500 ring-4 ring-purple-500/30'}`}
                        style={{ 
                            left: `${scaledX}px`, 
                            top: `${scaledY}px`, 
                            width: `${scaledWidth}px`, 
                            height: `${scaledHeight}px`, 
                            transition: 'all 0.1s linear',
                            boxShadow: `0 0 20px ${selectedObject?.class === obj.class ? 'rgba(52, 211, 153, 0.8)' : 'rgba(168, 85, 247, 0.6)'}`, // Green or Purple glow
                            zIndex: 10, // Ensure bounding boxes are above the video
                            userSelect: 'none', // Prevent text selection on click
                            WebkitUserSelect: 'none', // For Safari
                            MozUserSelect: 'none', // For Firefox
                            msUserSelect: 'none' // For IE/Edge
                        }}
                        onClick={() => {
                            console.log("Detected object clicked:", obj);
                            triggerHapticFeedback(100); // Haptic feedback on selection
                            // Immediately verify the selected object
                            if (videoRef.current && canvasRef.current) {
                                const video = videoRef.current;
                                const canvas = canvasRef.current;
                                const context = canvas.getContext('2d');

                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;

                                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                                const imageDataUrl = canvas.toDataURL('image/jpeg');

                                onVerify(imageDataUrl, 'general_purpose', obj.class);
                            }
                        }}
                        >
                        <span className={`absolute -top-7 left-0 text-white px-2 py-0.5 text-sm font-bold rounded-t-md group-hover:scale-105 transition-transform origin-bottom-left ${selectedObject?.class === obj.class ? 'bg-green-500' : 'bg-purple-600'}`}>
                            {obj.class} ({Math.round(obj.score * 100)}%)
                        </span>
                        </div>
                    );
                })}
                
                
                {(!model || message.includes("Camera access denied") || modelLoading) && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl z-20">
                        {message.includes("Camera access denied") ? (
                            <CameraOff className="w-20 h-20 text-red-500 mb-4"/>
                        ) : (
                            <Loader className="w-20 h-20 text-purple-500 animate-spin-slow mb-4"/>
                        )}
                        <p className="mt-4 text-2xl font-semibold text-gray-200">{message}</p>
                        {message.includes("Camera access denied") && (
                            <p className="text-base text-gray-400 mt-2 max-w-xs text-center">Please check your browser/system camera permissions and refresh the page.</p>
                        )}
                    </div>
                )}
            </div>
            <p className="text-gray-300 text-xl font-medium mb-6 max-w-md text-center">
                <span className="text-purple-400 font-bold">{message}</span>
            </p>
            <canvas ref={canvasRef} className="hidden"></canvas>

            <div className="w-full max-w-3xl mb-8 p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 text-white text-center">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <button 
                        onClick={() => handleNavigate('upload', { agentId: 'general_purpose' })}
                        className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 group"
                    >
                        <Image className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors duration-300" />
                        <span className="text-sm sm:text-base font-medium text-white group-hover:text-gray-100 transition-colors duration-300">Verify Image</span>
                        <span className="text-xs text-gray-400 mt-1">General check</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('upload', { agentId: 'text_analyzer' })}
                        className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 group"
                    >
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-green-400 mb-2 sm:mb-3 group-hover:text-green-300 transition-colors duration-300" />
                        <span className="text-sm sm:text-base font-medium text-white group-hover:text-gray-100 transition-colors duration-300">Analyze Text</span>
                        <span className="text-xs text-gray-400 mt-1">Scan documents</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('upload', { agentId: 'product_authenticator' })}
                        className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 group"
                    >
                        <Tag className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 mb-2 sm:mb-3 group-hover:text-orange-300 transition-colors duration-300" />
                        <span className="text-sm sm:text-base font-medium text-white group-hover:text-gray-100 transition-colors duration-300">Product Check</span>
                        <span className="text-xs text-gray-400 mt-1">Verify products</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('upload', { agentId: 'pharmaceutical_authenticator' })}
                        className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 group"
                    >
                        <FlaskConical className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 mb-2 sm:mb-3 group-hover:text-red-300 transition-colors duration-300" />
                        <span className="text-sm sm:text-base font-medium text-white group-hover:text-gray-100 transition-colors duration-300">Pharma Check</span>
                        <span className="text-xs text-gray-400 mt-1">Verify medicine</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('upload', { agentId: 'drink_authenticator' })}
                        className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 group"
                    >
                        <Wine className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-2 sm:mb-3 group-hover:text-purple-300 transition-colors duration-300" />
                        <span className="text-sm sm:text-base font-medium text-white group-hover:text-gray-100 transition-colors duration-300">Drink Check</span>
                        <span className="text-xs text-gray-400 mt-1">Verify beverages</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('upload', { agentId: 'food_authenticator' })}
                        className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 group"
                    >
                        <Utensils className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mb-2 sm:mb-3 group-hover:text-yellow-300 transition-colors duration-300" />
                        <span className="text-sm sm:text-base font-medium text-white group-hover:text-gray-100 transition-colors duration-300">Food Check</span>
                        <span className="text-xs text-gray-400 mt-1">Verify food items</span>
                    </button>
                    <button 
                        onClick={() => handleNavigate('upload', { agentId: 'water_authenticator' })}
                        className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 group"
                    >
                        <Droplet className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors duration-300" />
                        <span className="text-sm sm:text-base font-medium text-white group-hover:text-gray-100 transition-colors duration-300">Water Check</span>
                        <span className="text-xs text-gray-400 mt-1">Verify water quality</span>
                    </button>
                </div>
            </div>
            <VerificationPopup 
                isVisible={!!cameraVerificationResult}
                result={cameraVerificationResult}
                onClose={clearCameraVerification}
            />
            {isVerifying && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-30 rounded-2xl">
                    <Loader className="w-20 h-20 text-purple-500 animate-spin-slow mb-4"/>
                    <p className="text-2xl font-semibold text-gray-200">Verifying...</p>
                </div>
            )}
        </div>
    );
});

CameraScreen.propTypes = {
    model: PropTypes.object,
    modelLoading: PropTypes.bool.isRequired,
    detectedObjects: PropTypes.array.isRequired,
    handleSelectObject: PropTypes.func.isRequired,
    setDetectedObjects: PropTypes.func.isRequired,
    triggerHapticFeedback: PropTypes.func.isRequired,
    selectedObject: PropTypes.object,
    onVerify: PropTypes.func.isRequired,
    isVerifying: PropTypes.bool.isRequired,
    handleNavigate: PropTypes.func.isRequired, // Added handleNavigate propType
    cameraVerificationResult: PropTypes.object,
    clearCameraVerification: PropTypes.func.isRequired,
    setMessage: PropTypes.func.isRequired, // Added setMessage propType
};

export default CameraScreen;