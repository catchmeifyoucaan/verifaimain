import React, { useState, useEffect, useRef } from 'react';
import { 
    Loader, 
    CameraOff, 
    FileText, 
    Tag, 
    Shield, 
    Target,
    CheckCircle,
    XCircle,
    Play,
    Pause,
    RotateCcw,
    Maximize2,
    Minimize2
} from 'lucide-react';
import PropTypes from 'prop-types';
import VerificationPopup from './VerificationPopup';

const CameraScreen = React.forwardRef(({ 
    model, 
    modelLoading, 
    detectedObjects, 
    handleSelectObject, 
    setDetectedObjects, 
    triggerHapticFeedback, 
    selectedObject, 
    onVerify, 
    isVerifying, 
    cameraVerificationResult, 
    clearCameraVerification 
}, ref) => {
    const [message, setMessage] = useState("Initializing AI Vision system...");
    const [cameraStatus, setCameraStatus] = useState('initializing'); // 'initializing', 'ready', 'error', 'paused'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const renderedObjectsRef = useRef([]);
    const isDetecting = useRef(false);
    const controlsTimeoutRef = useRef(null);

    const lerp = (a, b, t) => a + (b - a) * t;

    // Camera initialization
    useEffect(() => {
        if (modelLoading) {
            setMessage("Loading AI Vision model...");
            setCameraStatus('initializing');
            return;
        }

        if (model) {
            initializeCamera();
        }

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [model, modelLoading]);

    const initializeCamera = async () => {
        try {
            setMessage("Requesting camera access...");
            setCameraStatus('initializing');
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setMessage("Camera ready. AI detection active...");
                    setCameraStatus('ready');
                    startDetection();
                };
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setMessage("Camera access denied. Please enable camera permissions.");
            setCameraStatus('error');
        }
    };

    const startDetection = () => {
        if (!model || !videoRef.current) return;
        
        const detectFrame = async () => {
            if (videoRef.current?.readyState === 4 && model && !isDetecting.current && cameraStatus === 'ready') {
                isDetecting.current = true;
                
                try {
                    const newPredictions = await model.detect(videoRef.current);
                    const smoothedObjects = [];
                    
                    newPredictions.forEach(pred => {
                        if (pred.score > 0.6) {
                            const existingObj = renderedObjectsRef.current.find(obj => obj.class === pred.class);
                            if (existingObj) {
                                const smoothedBbox = [
                                    lerp(existingObj.bbox[0], pred.bbox[0], 0.2),
                                    lerp(existingObj.bbox[1], pred.bbox[1], 0.2),
                                    lerp(existingObj.bbox[2], pred.bbox[2], 0.2),
                                    lerp(existingObj.bbox[3], pred.bbox[3], 0.2)
                                ];
                                smoothedObjects.push({ ...pred, bbox: smoothedBbox });
                            } else {
                                smoothedObjects.push(pred);
                            }
                        }
                    });
                    
                    renderedObjectsRef.current = smoothedObjects;
                    setDetectedObjects(smoothedObjects);
                    
                    if (smoothedObjects.length > 0) {
                        setMessage(`${smoothedObjects.length} object(s) detected. Tap to verify.`);
                        triggerHapticFeedback(50);
                    } else {
                        setMessage("No objects detected. Adjust position or lighting.");
                    }
                } catch (error) {
                    console.error("Error during object detection:", error);
                    setMessage("AI detection error. Please try again.");
                } finally {
                    isDetecting.current = false;
                }
            }
            
            if (cameraStatus === 'ready') {
                requestAnimationFrame(detectFrame);
            }
        };
        
        detectFrame();
    };

    const toggleCamera = () => {
        if (cameraStatus === 'ready') {
            setCameraStatus('paused');
            setMessage("Camera paused. Click play to resume.");
        } else if (cameraStatus === 'paused') {
            setCameraStatus('ready');
            setMessage("Camera resumed. AI detection active...");
            startDetection();
        }
    };

    const resetCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setDetectedObjects([]);
        handleSelectObject(null);
        setCameraStatus('initializing');
        initializeCamera();
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    const getStatusColor = () => {
        switch (cameraStatus) {
            case 'ready': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'paused': return 'text-yellow-400';
            default: return 'text-blue-400';
        }
    };

    const getStatusIcon = () => {
        switch (cameraStatus) {
            case 'ready': return <CheckCircle className="w-5 h-5" />;
            case 'error': return <XCircle className="w-5 h-5" />;
            case 'paused': return <Pause className="w-5 h-5" />;
            default: return <Loader className="w-5 h-5 animate-spin" />;
        }
    };

    return (
        <div 
            className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative"
            ref={ref}
            onMouseMove={handleMouseMove}
        >
            {/* Main Camera Container - WIDE AND PROFESSIONAL */}
            <div 
                ref={containerRef}
                className="relative w-full max-w-7xl aspect-video bg-gray-900/50 rounded-3xl shadow-2xl border border-gray-700/50 flex items-center justify-center overflow-hidden group"
            >
                {/* Video Element */}
                <video 
                    ref={videoRef} 
                    className="absolute w-full h-full object-cover rounded-3xl" 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ pointerEvents: 'none' }} 
                />

                {/* Camera Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                {/* Status Indicator */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 border border-gray-600/50">
                    <div className={`${getStatusColor()}`}>
                        {getStatusIcon()}
                    </div>
                    <span className="text-white text-sm font-medium capitalize">
                        {cameraStatus}
                    </span>
                </div>

                {/* AI Detection Status */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 border border-gray-600/50">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-sm font-medium">AI Active</span>
                    </div>
                </div>

                {/* Detected Objects */}
                {detectedObjects.map((obj, i) => {
                    if (!videoRef.current || !videoRef.current.videoWidth) return null;

                    const videoWidth = videoRef.current.offsetWidth;
                    const videoHeight = videoRef.current.offsetHeight;
                    const [x, y, width, height] = obj.bbox;
                    
                    const scaledX = (x / 640) * videoWidth;
                    const scaledY = (y / 640) * videoHeight;
                    const scaledWidth = (width / 640) * videoWidth;
                    const scaledHeight = (height / 640) * videoHeight;

                    const isSelected = selectedObject && selectedObject.class === obj.class;

                    return (
                        <div
                            key={i}
                            className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                isSelected 
                                    ? 'border-purple-400 bg-purple-400/20 shadow-lg shadow-purple-400/30' 
                                    : 'border-green-400 bg-green-400/10 hover:border-green-300 hover:bg-green-400/20'
                            }`}
                            style={{
                                left: scaledX,
                                top: scaledY,
                                width: scaledWidth,
                                height: scaledHeight,
                            }}
                            onClick={() => handleSelectObject(obj)}
                        >
                            {/* Object Label */}
                            <div className="absolute -top-8 left-0 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-gray-600/50">
                                <div className="flex items-center space-x-2">
                                    <Tag className="w-3 h-3 text-green-400" />
                                    <span className="text-white text-xs font-medium capitalize">
                                        {obj.class}
                                    </span>
                                    <span className="text-green-400 text-xs font-bold">
                                        {Math.round(obj.score * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-pulse">
                                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-400 rounded-full"></div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"></div>
                                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-purple-400 rounded-full"></div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"></div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Camera Controls */}
                <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 transition-all duration-300 ${
                    showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                    <button
                        onClick={toggleCamera}
                        className="p-3 bg-black/50 backdrop-blur-sm rounded-full border border-gray-600/50 hover:bg-black/70 transition-all duration-200 text-white"
                        title={cameraStatus === 'ready' ? 'Pause Camera' : 'Resume Camera'}
                    >
                        {cameraStatus === 'ready' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    
                    <button
                        onClick={resetCamera}
                        className="p-3 bg-black/50 backdrop-blur-sm rounded-full border border-gray-600/50 hover:bg-black/70 transition-all duration-200 text-white"
                        title="Reset Camera"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 bg-black/50 backdrop-blur-sm rounded-full border border-gray-600/50 hover:bg-black/70 transition-all duration-200 text-white"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>

                {/* Loading State */}
                {modelLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                        <div className="text-center">
                            <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
                            <p className="text-white text-lg font-medium">Loading AI Vision Model...</p>
                            <p className="text-gray-300 text-sm">This may take a few moments</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {cameraStatus === 'error' && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                        <div className="text-center">
                            <CameraOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <p className="text-white text-lg font-medium">Camera Error</p>
                            <p className="text-gray-300 text-sm mb-4">Please check permissions and try again</p>
                            <button
                                onClick={resetCamera}
                                className="btn-primary"
                            >
                                Retry Camera
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Message */}
            <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700/50">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <p className="text-gray-300 font-medium">{message}</p>
                </div>
            </div>

            {/* AI Agent Selection */}
            {selectedObject && (
                <div className="mt-6 w-full max-w-4xl">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                            <Target className="w-6 h-6 text-purple-400" />
                            <span>Select AI Agent for Verification</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { id: 'general_purpose', name: 'General Purpose', icon: Shield, description: 'Broad authenticity checks' },
                                { id: 'id_document_verifier', name: 'ID Document', icon: FileText, description: 'Document fraud detection' },
                                { id: 'product_authenticator', name: 'Product', icon: Tag, description: 'Product authenticity' },
                                { id: 'text_analyzer', name: 'Text Analysis', icon: FileText, description: 'Content verification' }
                            ].map((agent) => (
                                <button
                                    key={agent.id}
                                    onClick={() => onVerify(
                                        videoRef.current?.toDataURL('image/jpeg', 0.8),
                                        agent.id,
                                        selectedObject.class
                                    )}
                                    disabled={isVerifying}
                                    className="card-hover p-4 text-left transition-all duration-200 hover:scale-105"
                                >
                                    <div className="flex items-center space-x-3 mb-2">
                                        <agent.icon className="w-5 h-5 text-purple-400" />
                                        <span className="font-semibold text-white">{agent.name}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{agent.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Result */}
            {cameraVerificationResult && (
                <VerificationPopup
                    result={cameraVerificationResult}
                    onClose={clearCameraVerification}
                    isOpen={!!cameraVerificationResult}
                />
            )}

            {/* Canvas for Screenshots */}
            <canvas ref={canvasRef} className="hidden" />
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
    cameraVerificationResult: PropTypes.object,
    clearCameraVerification: PropTypes.func.isRequired,
};

export default CameraScreen;