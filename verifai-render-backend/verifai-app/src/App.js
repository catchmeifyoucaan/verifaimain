import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import mylogo from './mylogo.png';
import { Camera, Globe, ServerCrash, LogIn, User, LogOut, Upload, History } from 'lucide-react';
import CameraScreen from './components/CameraScreen';
import UploadScreen from './components/UploadScreen';
import VerificationHistory from './components/VerificationHistory';
import OnboardingGuide from './components/OnboardingGuide';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import PropTypes from 'prop-types';
import ErrorBoundary from './components/ErrorBoundary';
import ProfileScreen from './components/ProfileScreen';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// --- Firebase Initialization ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";



// --- FINAL FIREBASE CONFIGURATION (Your keys are now integrated) ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// ==============================================================================
// 1. Firebase Context
// ==============================================================================
const FirebaseContext = createContext();

export const useFirebase = () => {
    return useContext(FirebaseContext);
};

export const FirebaseProvider = ({ children }) => {
    const [firebaseApp, setFirebaseApp] = useState(null);
    const [firestoreDb, setFirestoreDb] = useState(null);
    const [firebaseAuth, setFirebaseAuth] = useState(null);
    const [firebaseLoading, setFirebaseLoading] = useState(true);
    const [firebaseError, setFirebaseError] = useState(null);

    useEffect(() => {
        try {
            const appInstance = initializeApp(firebaseConfig);
            const dbInstance = getFirestore(appInstance);
            const authInstance = getAuth(appInstance);
            setFirebaseApp(appInstance);
            setFirestoreDb(dbInstance);
            setFirebaseAuth(authInstance);
            setFirebaseLoading(false);
        } catch (e) {
            console.error("Firebase initialization error:", e);
            setFirebaseError(e.message);
            setFirebaseLoading(false);
        }
    }, []);

    const value = {
        app: firebaseApp,
        db: firestoreDb,
        auth: firebaseAuth,
        firebaseLoading,
        firebaseError,
    };

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
};

FirebaseProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// ==============================================================================
// 2. Authentication Context
// ==============================================================================
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { auth, firebaseLoading, firebaseError } = useFirebase();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (firebaseLoading) {
            return;
        }
        if (firebaseError || !auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, [auth, firebaseLoading, firebaseError]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Sign-In error:", error);
            // Handle specific errors, e.g., popup closed by user
        }
    };

    const signOutUser = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    const value = { user, loading, signInWithGoogle, signOutUser };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => {
    return useContext(AuthContext);
};


// ==============================================================================
// 2. Login Screen
// ==============================================================================
const LoginScreen = () => {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden p-4">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20">
                <div className="absolute w-96 h-96 bg-purple-500 rounded-full -top-20 -left-20 mix-blend-screen filter blur-3xl animate-blob-1"></div>
                <div className="absolute w-96 h-96 bg-blue-500 rounded-full -bottom-20 -right-20 mix-blend-screen filter blur-3xl animate-blob-2"></div>
                <div className="absolute w-80 h-80 bg-green-500 rounded-full top-1/4 left-1/4 mix-blend-screen filter blur-3xl animate-blob-3"></div>
            </div>

            {/* Main Content Card */}
            <div className="relative z-10 bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-8 md:p-12 text-center max-w-md w-full transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-purple-500/30">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <Globe className="w-24 h-24 text-purple-400 animate-pulse-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LogIn className="w-12 h-12 text-purple-300" />
                    </div>
                </div>
                <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
                    Welcome to Verif<span className="text-purple-400">Ai</span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                    Your trusted partner for AI-powered authenticity verification.
                </p>
                <button
                    onClick={signInWithGoogle}
                    className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 w-full"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    Sign in with Google
                </button>
            </div>

            
        </div>
    );
};




    



// ==============================================================================
// 5. App Entrypoint with Authentication & Error Handling
// ==============================================================================

export default function App() {
    return (
        <ErrorBoundary>
            <FirebaseProvider>
                <AuthProvider>
                    <AppContainer />
                </AuthProvider>
            </FirebaseProvider>
        </ErrorBoundary>
    );
}

const AppContainer = () => {
    const { user } = useAuth();
    const { firebaseError, firebaseLoading } = useFirebase();

    if (firebaseLoading) {
        return (
            <div className="w-full min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
                <Globe className="w-16 h-16 text-purple-400 animate-spin mb-4" />
                <h1 className="text-2xl font-bold mb-2">Loading Firebase...</h1>
                <p className="max-w-md text-gray-300">Please wait while we connect to our services.</p>
            </div>
        );
    }

    if (firebaseError) {
        return (
            <div className="w-full min-h-screen bg-red-900/80 text-white flex flex-col items-center justify-center p-4 text-center">
                <ServerCrash className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Initialization Error</h1>
                <p className="max-w-md text-red-300">{firebaseError}</p>
            </div>
        );
    }
    
    return user ? <VerifAiApp /> : <LoginScreen />;
}

    const VerifAiApp = () => {
    const { signOutUser, user } = useAuth();
    const { db } = useFirebase();
    const [activeScreen, setActiveScreen] = useState('camera'); // 'camera', 'upload', 'profile'
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [model, setModel] = useState(null); // Model will be loaded here
    const [modelLoading, setModelLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
        if (!hasCompletedOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setModelLoading(false);
                console.log("AI Vision Model loaded successfully.");
            } catch (error) {
                console.error("Error loading AI Vision Model:", error);
                setModelLoading(false);
            }
        };
        loadModel();
    }, []);
    const [selectedImageForUpload, setSelectedImageForUpload] = useState(null);
    const [selectedObjectClassForUpload, setSelectedObjectClassForUpload] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [cameraVerificationResult, setCameraVerificationResult] = useState(null);
    const [selectedAgentForUpload, setSelectedAgentForUpload] = useState(null);

    const [isVerifying, setIsVerifying] = useState(false);
    const screenRef = useRef(null);

    const handleNavigate = (screen, params = {}) => {
        setActiveScreen(screen);
        // Reset state when navigating to a new screen for a clean slate
        setVerificationResult(null);
        setSelectedObject(null);
        setDetectedObjects([]);

        if (screen === 'upload' && params.agentId) {
            setSelectedAgentForUpload(params.agentId);
            setSelectedImageForUpload(null);
            setSelectedObjectClassForUpload('');
        }
    };

    const triggerHapticFeedback = useCallback((duration) => {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        } else {
            console.log("Haptic feedback not supported.");
        }
    }, []);

    const [selectedObject, setSelectedObject] = useState(null);

    const handleSelectObject = (obj) => {
        console.log("handleSelectObject called with object:", obj);
        setSelectedObject(obj);
    };

    const handleVerify = async (fileOrDataUrl, agentId, objectClass) => {
        setVerificationResult(null); // Clear previous results
        
        const payload = {
            object_class: objectClass,
            agent_id: agentId,
        };

        const sendError = (title, summary) => {
            console.error(title, summary);
            setVerificationResult({ status: "danger", title, summary });
            setActiveScreen('upload'); // Navigate to show the error
        };

        // Case 1: Input is a base64 data URL string (from camera)
        if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
            console.log("Handling verification for captured image data URL.");
            payload.image_data_url = fileOrDataUrl;
            payload.file_type = fileOrDataUrl.substring(5, fileOrDataUrl.indexOf(';')) || 'image/jpeg';
            await sendVerificationRequest(payload, 'camera'); // Pass 'camera' as source
            return;
        }

        // Case 2: Input is a File object (from upload)
        if (fileOrDataUrl instanceof File) {
            console.log("Handling verification for uploaded file.");
            const file = fileOrDataUrl;
            const fileType = file.type;
            payload.file_type = fileType;

            const reader = new FileReader();
            reader.onerror = () => sendError("File Read Error", "Could not read the selected file.");

            const onReaderLoad = (result) => {
                if (fileType.startsWith('image/')) {
                    payload.image_data_url = result;
                } else if (fileType.startsWith('text/')) {
                    payload.text_content = result;
                } else {
                    payload.media_data_url = result;
                }
                sendVerificationRequest(payload, 'upload'); // Pass 'upload' as source
            };

            if (fileType.startsWith('text/')) {
                reader.readAsText(file);
            } else if (fileType.startsWith('image/') || fileType.startsWith('video/') || fileType.startsWith('audio/') || fileType === 'application/pdf' || fileType.includes('spreadsheet') || fileType.includes('excel') || fileType === 'text/csv') {
                reader.readAsDataURL(file);
            } else {
                sendError("Unsupported File Type", `The file type '${fileType}' is not supported.`);
                return;
            }
            reader.onload = () => onReaderLoad(reader.result);
            return;
        }
        
        // Fallback for unexpected input
        sendError("Invalid Input", "An unexpected error occurred with the input data.");
    };

    const sendVerificationRequest = async (payload, source) => {
        console.log(`Sending verification request from ${source} with payload:`, payload);
        setIsVerifying(true);
        try {
            const response = await fetch('https://verifai-azuc.onrender.com/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Verification failed');
            }

            const result = await response.json();
            
            if (source === 'camera') {
                setCameraVerificationResult(result);
            } else {
                setVerificationResult(result);
                setActiveScreen('upload');
            }

            // Save to history
            if (db && user) {
                try {
                    await addDoc(collection(db, "users", user.uid, "personal_verifications"), {
                        ...result,
                        timestamp: serverTimestamp(),
                    });
                    console.log("Verification result saved to history.");
                } catch (historyError) {
                    console.error("Error saving verification to history:", historyError);
                }
            }
            
            console.log("Verification Result:", result);
        } catch (error) {
            console.error("Error during verification API call:", error);
            const errorResult = { status: "danger", title: "Verification Failed", summary: error.message };
            if (source === 'camera') {
                setCameraVerificationResult(errorResult);
            } else {
                setVerificationResult(errorResult);
                setActiveScreen('upload');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const renderScreen = () => {
        switch (activeScreen) {
            case 'camera':
                return (
                    <CameraScreen
                        db={db}
                        model={model}
                        modelLoading={modelLoading}
                        detectedObjects={detectedObjects}
                        setDetectedObjects={setDetectedObjects}
                        handleSelectObject={handleSelectObject}
                        triggerHapticFeedback={triggerHapticFeedback}
                        selectedObject={selectedObject}
                        onVerify={(fileOrDataUrl, agentId, objectClass) => handleVerify(fileOrDataUrl, agentId, objectClass)}
                        isVerifying={isVerifying}
                        cameraVerificationResult={cameraVerificationResult}
                        clearCameraVerification={() => {
                            setCameraVerificationResult(null);
                            setDetectedObjects([]);
                            handleSelectObject(null);
                        }}
                    />
                );
            case 'upload':
                return (
                    <UploadScreen
                        db={db}
                        initialFile={selectedImageForUpload}
                        initialObjectClass={selectedObjectClassForUpload}
                        onVerify={(fileOrDataUrl, agentId, objectClass) => handleVerify(fileOrDataUrl, agentId, objectClass)}
                        verificationResult={verificationResult}
                        initialAgentId={selectedAgentForUpload}
                        isVerifying={isVerifying}
                        onNavigate={handleNavigate}
                    />
                );
            case 'profile':
                return <ProfileScreen />;
            case 'history':
                return <VerificationHistory />;
            default:
                return (
                    <CameraScreen
                        db={db}
                        model={model}
                        modelLoading={modelLoading}
                        detectedObjects={detectedObjects}
                        setDetectedObjects={setDetectedObjects}
                        handleSelectObject={handleSelectObject}
                        triggerHapticFeedback={triggerHapticFeedback}
                        selectedObject={selectedObject}
                        onVerify={(fileOrDataUrl, agentId, objectClass) => handleVerify(fileOrDataUrl, agentId, objectClass)}
                        isVerifying={isVerifying}
                        cameraVerificationResult={cameraVerificationResult}
                        clearCameraVerification={() => {
                            setCameraVerificationResult(null);
                            setDetectedObjects([]);
                            handleSelectObject(null);
                        }}
                    />
                );
        }
    };

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-gray-900 text-white">
            {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
            <header className="flex justify-between items-center p-4 bg-gray-800 shadow-lg border-b border-gray-700">
                <div className="flex items-center">
                    <img src={mylogo} alt="VerifAI Logo" className="h-8 w-8 mr-2" />
                    <h1 className="text-2xl font-bold text-purple-400">VerifAi</h1>
                </div>
                <nav className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={() => setActiveScreen('camera')} className={`p-2 sm:p-3 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${activeScreen === 'camera' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}><Camera className="w-6 h-6" /></button>
                    <button onClick={() => setActiveScreen('upload')} className={`p-2 sm:p-3 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${activeScreen === 'upload' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}><Upload className="w-6 h-6" /></button>
                    <button onClick={() => setActiveScreen('profile')} className={`p-2 sm:p-3 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${activeScreen === 'profile' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}><User className="w-6 h-6" /></button>
                    <button onClick={() => setActiveScreen('history')} className={`p-2 sm:p-3 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${activeScreen === 'history' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}><History className="w-6 h-6" /></button>
                    <button onClick={signOutUser} className="p-2 sm:p-3 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center text-red-400 hover:bg-red-700 hover:text-white"><LogOut className="w-6 h-6" /></button>
                </nav>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={activeScreen}
                        timeout={300}
                        classNames="fade"
                        nodeRef={screenRef}
                    >
                        {renderScreen()}
                    </CSSTransition>
                </TransitionGroup>
            </main>
        </div>
    );
};



