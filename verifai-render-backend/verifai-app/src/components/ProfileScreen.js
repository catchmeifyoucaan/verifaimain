import React, { useState, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAuth } from '../App';

const ProfileScreen = React.forwardRef(({ onBack, onNavigate }, ref) => {
    const { user, signOutUser } = useAuth();
    const [defaultAgent, setDefaultAgent] = useState(() => localStorage.getItem('defaultAgent') || 'general_purpose');
    const [hapticFeedback, setHapticFeedback] = useState(() => JSON.parse(localStorage.getItem('hapticFeedback')) || false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    // State for section visibility
    const [openSection, setOpenSection] = useState(null); // Only one section can be open at a time

    // Reusable Section Component
    const SettingsSection = ({ title, children, sectionId }) => {
        const isOpen = openSection === sectionId;
        return (
            <div className="mb-6 bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <button
                    onClick={() => setOpenSection(isOpen ? null : sectionId)}
                    className="flex items-center justify-between w-full p-5 text-white text-xl font-bold transition-all duration-300 hover:bg-gray-700/70 focus:outline-none"
                >
                    <span>{title}</span>
                    <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-400' : 'text-gray-400'}`} />
                </button>
                {isOpen && (
                    <div className="p-5 border-t border-gray-700 animate-fade-in">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    SettingsSection.propTypes = {
        title: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        sectionId: PropTypes.string.isRequired,
    };

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('defaultAgent', defaultAgent);
    }, [defaultAgent]);

    useEffect(() => {
        localStorage.setItem('hapticFeedback', JSON.stringify(hapticFeedback));
    }, [hapticFeedback]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up" ref={ref}>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-700 flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User Avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-purple-500 shadow-lg object-cover" />
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500 shadow-lg">
                            <User className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{user?.displayName || "VerifAi User"}</h2>
                        <p className="text-sm sm:text-base text-gray-300 break-all mb-1">{user?.email || user?.uid}</p>
                        {user?.metadata?.creationTime && (
                            <p className="text-xs text-gray-400">Joined: {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
                <button onClick={signOutUser} className="mt-4 sm:mt-0 flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>

            <SettingsSection title="About VerifAi" sectionId="aboutVerifAi">
                <p className="mb-2">VerifAi is your personal AI-powered authenticity verification assistant. Leveraging cutting-edge machine learning models, it provides instant analysis of items through your camera or file uploads, helping you determine their legitimacy with confidence.</p>
                <p>Our mission is to bring clarity and security to your everyday life by making advanced AI verification accessible and easy to use.</p>
            </SettingsSection>

            <SettingsSection title="About SurpriseAI" sectionId="aboutSurpriseAi">
                <p className="mb-2">VerifAi is a product of <strong>SurpriseAI</strong>, a pioneering company at the forefront of AI innovation. We believe in harnessing the power of artificial intelligence to solve real-world problems and enhance human capabilities.</p>
                <p>Our mission is to develop intelligent, intuitive, and impactful AI solutions that bring clarity, security, and efficiency to everyday life. With a team of dedicated AI researchers, engineers, and designers, SurpriseAI is committed to pushing the boundaries of what's possible with AI, creating products that are not just technologically advanced but also genuinely surprising in their utility and elegance. We are driven by a passion for innovation and a commitment to building a more secure and intelligent future.</p>
            </SettingsSection>

            <SettingsSection title="User Preferences" sectionId="userPreferences">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="default-agent" className="block text-gray-300 text-sm font-medium mb-2">Default Verification Agent:</label>
                        <select
                            id="default-agent"
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                            value={defaultAgent}
                            onChange={(e) => setDefaultAgent(e.target.value)}
                        >
                            <option value="general_purpose">General Purpose</option>
                            <option value="id_document_verifier">ID Document Verifier</option>
                            <option value="product_authenticator">Product Authenticator</option>
                            <option value="text_analyzer">Text Analyzer</option>
                            <option value="pharmaceutical_authenticator">Pharmaceuticals</option>
                            <option value="drink_authenticator">Drinks & Alcohol</option>
                            <option value="food_authenticator">Food & Perishables</option>
                            <option value="water_authenticator">Water & Beverages</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg shadow-inner">
                        <label htmlFor="haptic-feedback" className="text-gray-300 text-sm font-medium">Enable Haptic Feedback:</label>
                        <input
                            type="checkbox"
                            id="haptic-feedback"
                            className="form-checkbox h-6 w-6 text-purple-600 bg-gray-900 border-gray-600 rounded-md focus:ring-purple-500 transition-all duration-200 cursor-pointer"
                            checked={hapticFeedback}
                            onChange={(e) => setHapticFeedback(e.target.checked)}
                        />
                    </div>
                    <div>
                        <label htmlFor="theme-select" className="block text-gray-300 text-sm font-medium mb-2">Theme:</label>
                        <select
                            id="theme-select"
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="notification-settings" className="block text-gray-300 text-sm font-medium mb-2">Notification Settings:</label>
                        <button className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white text-sm font-medium shadow-inner">
                            Manage Notifications
                        </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-4 text-center">Note: Preferences are saved locally in your browser.</p>
                </div>
            </SettingsSection>

            <SettingsSection title="Security & Privacy" sectionId="securityPrivacy">
                <p className="mb-2">Your privacy is paramount. VerifAi is designed with robust security measures to protect your data. We use industry-standard encryption for data in transit and at rest. We do not share your personal verification data with third parties without your explicit consent.</p>
                <p className="mb-2">For detailed information, please review our <span className="text-purple-400 font-medium cursor-pointer hover:underline">Privacy Policy</span> and <span className="text-purple-400 font-medium cursor-pointer hover:underline">Terms of Service</span>.</p>
                <p>You can manage your data and permissions, including opting out of certain data collection, through your account settings or by contacting our support team.</p>
            </SettingsSection>

            <SettingsSection title="Support" sectionId="support">
                <p className="mb-2">Need help? Our support team is here for you. Visit our comprehensive <span className="text-purple-400 font-medium cursor-pointer hover:underline">Help Center</span> for FAQs, troubleshooting guides, and tutorials.</p>
                <p className="mb-2">If you can't find what you're looking for, feel free to <span className="text-purple-400 font-medium cursor-pointer hover:underline">Contact Support</span> directly. We aim to respond to all inquiries within 24-48 hours.</p>
                <p>Encountered a bug or have a suggestion for improvement? Please <span className="text-purple-400 font-medium cursor-pointer hover:underline">Report a Bug</span> to help us make VerifAi even better.</p>
            </SettingsSection>

            <button onClick={() => onNavigate('camera')} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                Back to VerifAi
            </button>
        </div>
    );
});


ProfileScreen.propTypes = {
    onNavigate: PropTypes.func.isRequired,
    onBack: PropTypes.func // onBack is now optional as it's not directly used in the current UI
};

export default ProfileScreen;