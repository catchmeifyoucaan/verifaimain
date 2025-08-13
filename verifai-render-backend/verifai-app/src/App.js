import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import mylogo from './mylogo.png';
import { Camera, Globe, ServerCrash, LogIn, User, LogOut, Upload, History, Shield, Zap, Target, CheckCircle } from 'lucide-react';
import CameraScreen from './components/CameraScreen';
import UploadScreen from './components/UploadScreen';
import VerificationHistory from './components/VerificationHistory';
import OnboardingGuide from './components/OnboardingGuide';
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

        return () => unsubscribe();
    }, [auth, firebaseLoading, firebaseError]);

    const signInWithGoogle = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    const signOutUser = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        signOutUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ==============================================================================
// 3. Main App Component
// ==============================================================================
const App = () => {
    return (
        <ErrorBoundary>
            <FirebaseProvider>
                <AuthProvider>
                    <Router>
                        <AppContainer />
                    </Router>
                </AuthProvider>
            </FirebaseProvider>
        </ErrorBoundary>
    );
};

const AppContainer = () => {
    const { user } = useAuth();
    const { firebaseError, firebaseLoading } = useFirebase();

    if (firebaseLoading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
                <div className="relative">
                    <Globe className="w-20 h-20 text-purple-400 animate-spin mb-6" />
                    <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
                </div>
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Initializing VerifAi
                </h1>
                <p className="max-w-md text-gray-300 text-lg">Connecting to our secure AI verification services...</p>
                <div className="mt-6 flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        );
    }

    if (firebaseError) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white flex flex-col items-center justify-center p-4 text-center">
                <ServerCrash className="w-20 h-20 text-red-400 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Initialization Error</h1>
                <p className="max-w-md text-red-300 text-lg mb-6">{firebaseError}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }
    
    return user ? <VerifAiApp /> : <LoginScreen />;
};

// ==============================================================================
// 4. Login Screen
// ==============================================================================
const LoginScreen = () => {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Brand */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-6">
                        <img src={mylogo} alt="VerifAi Logo" className="w-20 h-20 mx-auto" />
                        <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        VerifAi
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">AI-Powered Authenticity Verification</p>
                    <p className="text-gray-400">Powered by SurpriseAI</p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="flex items-center space-x-3 text-gray-300">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span>Instant AI Verification</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span>Real-time Camera Detection</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                        <Target className="w-5 h-5 text-blue-400" />
                        <span>Multi-format Support</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                        <span>Professional Grade Security</span>
                    </div>
                </div>

                {/* Login Button */}
                <button
                    onClick={signInWithGoogle}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 hover:shadow-2xl"
                >
                    <div className="flex items-center justify-center space-x-3">
                        <LogIn className="w-6 h-6" />
                        <span>Continue with Google</span>
                    </div>
                </button>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-400 text-sm">
                    <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </div>
    );
};

// ==============================================================================
// 5. Main App with Routing
// ==============================================================================
const VerifAiApp = () => {
    const { signOutUser, user } = useAuth();
    const { db } = useFirebase();
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [model, setModel] = useState(null);
    const [modelLoading, setModelLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [cameraVerificationResult, setCameraVerificationResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [selectedObject, setSelectedObject] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const triggerHapticFeedback = useCallback((duration) => {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        } else {
            console.log("Haptic feedback not supported.");
        }
    }, []);

    const handleSelectObject = (obj) => {
        console.log("handleSelectObject called with object:", obj);
        setSelectedObject(obj);
    };

    const handleVerify = async (fileOrDataUrl, agentId, objectClass) => {
        setVerificationResult(null);
        
        const payload = {
            object_class: objectClass,
            agent_id: agentId,
        };

        const sendError = (title, summary) => {
            console.error(title, summary);
            setVerificationResult({ status: "danger", title, summary });
        };

        if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
            console.log("Handling verification for captured image data URL.");
            payload.image_data_url = fileOrDataUrl;
            payload.file_type = fileOrDataUrl.substring(5, fileOrDataUrl.indexOf(';')) || 'image/jpeg';
            await sendVerificationRequest(payload, 'camera');
            return;
        }

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
                sendVerificationRequest(payload, 'upload');
            };

            if (fileType.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else if (fileType.startsWith('text/')) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        }
    };

    const sendVerificationRequest = async (payload, source) => {
        setIsVerifying(true);
        try {
            const response = await fetch('https://verifai-backend.onrender.com/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (source === 'camera') {
                setCameraVerificationResult(result);
            } else {
                setVerificationResult(result);
            }

            if (db && result.verification_id) {
                try {
                    await addDoc(collection(db, 'verification_history'), {
                        verification_id: result.verification_id,
                        user_id: user.uid,
                        timestamp: serverTimestamp(),
                        object_class: payload.object_class,
                        agent_id: payload.agent_id,
                        status: result.status,
                        title: result.title,
                        summary: result.summary,
                        confidence: result.confidence,
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
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
            
            {/* Professional Header */}
            <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo and Brand */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img src={mylogo} alt="VerifAi Logo" className="h-10 w-10" />
                                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-sm"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    VerifAi
                                </h1>
                                <p className="text-xs text-gray-400">AI Verification Platform</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            <Link to="/" className="nav-link">
                                <Camera className="w-5 h-5" />
                                <span>Camera</span>
                            </Link>
                            <Link to="/upload" className="nav-link">
                                <Upload className="w-5 h-5" />
                                <span>Upload</span>
                            </Link>
                            <Link to="/history" className="nav-link">
                                <History className="w-5 h-5" />
                                <span>History</span>
                            </Link>
                            <Link to="/profile" className="nav-link">
                                <User className="w-5 h-5" />
                                <span>Profile</span>
                            </Link>
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-300">
                                <span>Welcome,</span>
                                <span className="font-semibold text-purple-400">{user?.displayName || 'User'}</span>
                            </div>
                            
                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                                title="Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            <button 
                                onClick={signOutUser} 
                                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}>
                    <div className="px-4 pb-4 space-y-2">
                        <Link 
                            to="/" 
                            className="nav-link w-full justify-start"
                            onClick={closeMobileMenu}
                        >
                            <Camera className="w-5 h-5" />
                            <span>Camera Verification</span>
                        </Link>
                        <Link 
                            to="/upload" 
                            className="nav-link w-full justify-start"
                            onClick={closeMobileMenu}
                        >
                            <Upload className="w-5 h-5" />
                            <span>File Upload</span>
                        </Link>
                        <Link 
                            to="/history" 
                            className="nav-link w-full justify-start"
                            onClick={closeMobileMenu}
                        >
                            <History className="w-5 h-5" />
                            <span>Verification History</span>
                        </Link>
                        <Link 
                            to="/profile" 
                            className="nav-link w-full justify-start"
                            onClick={closeMobileMenu}
                        >
                            <User className="w-5 h-5" />
                            <span>User Profile</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={
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
                    } />
                    <Route path="/upload" element={
                        <UploadScreen
                            db={db}
                            initialFile={null}
                            initialObjectClass=""
                            onVerify={(fileOrDataUrl, agentId, objectClass) => handleVerify(fileOrDataUrl, agentId, objectClass)}
                            verificationResult={verificationResult}
                            initialAgentId={null}
                            isVerifying={isVerifying}
                            onNavigate={() => {}}
                        />
                    } />
                    <Route path="/profile" element={<ProfileScreen />} />
                    <Route path="/history" element={<VerificationHistory />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;



