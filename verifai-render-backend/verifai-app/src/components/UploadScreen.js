import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, XCircle, AlertTriangle, Loader, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const AGENTS = [
    { id: "general_purpose", name: "General Purpose", defaultObjectClass: "item" },
    { id: "id_document_verifier", name: "ID Document Verifier", defaultObjectClass: "ID Document" },
    { id: "product_authenticator", name: "Product Authenticator", defaultObjectClass: "product" },
    { id: "text_analyzer", name: "Text Analyzer", defaultObjectClass: "text document" },
    { id: "pharmaceutical_authenticator", name: "Pharmaceuticals", defaultObjectClass: "pharmaceutical product" },
    { id: "drink_authenticator", name: "Drinks & Alcohol", defaultObjectClass: "beverage" },
    { id: "food_authenticator", name: "Food & Perishables", defaultObjectClass: "food item" },
    { id: "water_authenticator", name: "Water & Beverages", defaultObjectClass: "bottled water" },
];

const SUPPORTED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'text/plain', 'application/pdf'
];

const UploadScreen = React.forwardRef(({ onVerify, initialFile, initialObjectClass, verificationResult, initialAgentId, isVerifying, onNavigate }, ref) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    useEffect(() => {
        console.log("UploadScreen - initialFile:", initialFile);
        console.log("UploadScreen - initialObjectClass:", initialObjectClass);

        if (initialFile) {
            // Convert data URL to File object
            fetch(initialFile)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "captured_image.jpeg", { type: "image/jpeg" });
                    setSelectedFile(file);
                    setFilePreview(initialFile);
                    console.log("UploadScreen - File converted and set:", file);
                })
                .catch(error => {
                    console.error("Error converting initialFile to Blob/File:", error);
                    setFileError("Could not process the captured image.");
                });
        }
        if (initialObjectClass) {
            setObjectClass(initialObjectClass);
        }
    }, [initialFile, initialObjectClass]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(initialAgentId || AGENTS[0].id);
    const [fileError, setFileError] = useState(null);
    const [objectClass, setObjectClass] = useState('');
    const fileInputRef = useRef(null);

    // Effect to update objectClass based on selectedAgent
    useEffect(() => {
        const agent = AGENTS.find(a => a.id === selectedAgent);
        if (agent && agent.defaultObjectClass) {
            setObjectClass(agent.defaultObjectClass);
        } else {
            setObjectClass(''); // Clear if no default
        }
    }, [selectedAgent]);

    const handleFileChange = (files) => {
        setFileError(null);
        if (files && files.length > 0) {
            const file = files[0];

            if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
                setFileError(`Unsupported file type: ${file.type}. Please upload an image, video, audio, text, or PDF file.`);
                setSelectedFile(null);
                setFilePreview(null);
                return;
            }

            setSelectedFile(file);

            if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'text/plain' || file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                if (file.type === 'text/plain') {
                    reader.readAsText(file);
                } else {
                    setFilePreview(null);
                }
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleClear = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setFileError(null);
        const agent = AGENTS.find(a => a.id === selectedAgent);
        setObjectClass(agent ? agent.defaultObjectClass : ''); 
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const renderPreview = () => {
        if (!selectedFile) return null;

        if (selectedFile.type.startsWith('image/')) {
            return <img src={filePreview} alt="Preview" className="max-w-full max-h-64 object-contain rounded-lg shadow-md" />;
        } else if (selectedFile.type.startsWith('video/')) {
            return <video src={filePreview} controls className="max-w-full max-h-64 object-contain rounded-lg shadow-md" />;
        } else if (selectedFile.type.startsWith('audio/')) {
            return <audio src={filePreview} controls className="w-full max-w-xs" />;
        } else if (selectedFile.type === 'text/plain') {
            return (
                <div className="w-full h-48 overflow-auto bg-gray-700 p-4 rounded-lg text-sm text-gray-300 text-left border border-gray-600">
                    <pre className="whitespace-pre-wrap">{filePreview}</pre>
                </div>
            );
        } else if (selectedFile.type === 'application/pdf') {
            return (
                <div className="flex flex-col items-center justify-center text-gray-400 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <FileText className="w-16 h-16 mb-3 text-red-400" />
                    <p className="text-base font-medium">PDF file selected.</p>
                    <p className="text-sm">No direct preview available.</p>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center justify-center text-gray-400 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <FileText className="w-16 h-16 mb-3" />
                    <p className="text-base font-medium">No preview available for this file type.</p>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center flex-grow p-4 sm:p-6 lg:p-8" ref={ref}>
            <h2 className="text-4xl font-extrabold mb-4 text-white">Upload for Verification</h2>
            <p className="text-lg text-gray-300 mb-10 max-w-xl">Select a file, specify the object, and choose an agent to begin the authenticity verification process.</p>

            <div className="w-full max-w-lg mb-6">
                <label htmlFor="object-class-input" className="block text-left text-gray-200 text-sm font-medium mb-2">What is this object? <span className="text-gray-400 text-xs">(e.g., "ID Card", "Luxury Watch", "Receipt")</span></label>
                <input
                    type="text"
                    id="object-class-input"
                    value={objectClass}
                    onChange={(e) => setObjectClass(e.target.value)}
                    placeholder={AGENTS.find(a => a.id === selectedAgent)?.defaultObjectClass || "e.g., ID Card, Product Label, Text Document"}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
            </div>

            <div className="w-full max-w-lg mb-8">
                <label htmlFor="agent-select" className="block text-left text-gray-200 text-sm font-medium mb-2">Select Verification Agent:</label>
                <select
                    id="agent-select"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                    {AGENTS.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                            {agent.name}
                        </option>
                    ))}
                </select>
            </div>

            <div
                className={'w-full max-w-lg p-8 border-2 ' + (isDragOver ? 'border-purple-500 bg-purple-900/20' : 'border-dashed border-gray-600') + ' rounded-2xl flex flex-col items-center justify-center h-64 transition-all duration-300'+ (selectedFile ? ' hidden' : '')}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <UploadCloud className="w-20 h-20 text-purple-400 mb-4" />
                <p className="text-gray-300 text-lg mb-4">Drag & drop your file here</p>
                <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e.target.files)}
                />
                <label htmlFor="file-upload" className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg transform hover:scale-105">
                    Or Select File
                </label>
            </div>

            {selectedFile && (
                <div className="w-full max-w-lg p-6 bg-gray-800 rounded-2xl shadow-xl border border-gray-700 flex flex-col items-center justify-center mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Selected File:</h3>
                    {renderPreview()}
                    <p className="mt-4 text-sm text-gray-300 truncate w-full px-2 text-center">{selectedFile.name}</p>
                    <button onClick={handleClear} className="mt-4 text-red-400 hover:text-red-500 text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Clear Selection
                    </button>
                </div>
            )}

            {fileError && (
                <div className="w-full max-w-lg flex flex-col items-center gap-3 p-4 bg-red-900/30 border border-red-700 rounded-lg mb-8">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <p className="text-red-300 text-base font-medium text-center">{fileError}</p>
                </div>
            )}

            {selectedFile && !fileError && objectClass && (
                <button
                    onClick={() => onVerify(selectedFile, selectedAgent, objectClass)}
                    className="w-full max-w-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 mb-10"
                    disabled={isVerifying}
                >
                    {isVerifying ? (
                        <div className="flex items-center">
                            <Loader className="w-5 h-5 animate-spin mr-3" />
                            <span>Analyzing Authenticity...</span>
                        </div>
                    ) : (
                        'Verify Uploaded File'
                    )}
                </button>
            )}

            {verificationResult && (
                <div className={`mt-10 p-6 rounded-2xl shadow-2xl w-full max-w-lg text-left transform transition-all duration-300 ease-in-out border
                    ${verificationResult.status === 'verified' ? 'bg-gradient-to-br from-green-700/30 to-green-900/30 border-green-600' :
                    verificationResult.status === 'warning' ? 'bg-gradient-to-br from-amber-700/30 to-amber-900/30 border-amber-600' :
                    'bg-gradient-to-br from-red-700/30 to-red-900/30 border-red-600'
                }`}>
                    <div className="flex items-center mb-4">
                        {verificationResult.status === 'verified' && <CheckCircle className="w-9 h-9 text-green-400 mr-3" />}
                        {verificationResult.status === 'warning' && <AlertTriangle className="w-9 h-9 text-amber-400 mr-3" />}
                        {verificationResult.status === 'danger' && <XCircle className="w-9 h-9 text-red-400 mr-3" />}
                        <h3 className="text-2xl font-bold text-white">{verificationResult.title}</h3>
                    </div>

                    <p className="text-gray-300 text-base mb-4">{verificationResult.summary}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400 mb-4">
                        <div><strong>Status:</strong> <span className="font-semibold text-white">{verificationResult.status.toUpperCase()}</span></div>
                        <div><strong>Confidence:</strong> <span className="font-semibold text-white">{verificationResult.confidence?.toFixed(2)}%</span></div>
                    </div>

                    {verificationResult.explanation && (
                        <div className="bg-gray-700/50 p-4 rounded-lg mb-3 border border-gray-600">
                            <h4 className="font-semibold text-gray-200 mb-2">Explanation:</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">{verificationResult.explanation}</p>
                        </div>
                    )}
                    {verificationResult.remediation && (
                        <div className="bg-gray-700/50 p-4 rounded-lg mb-3 border border-gray-600">
                            <h4 className="font-semibold text-gray-200 mb-2">Remediation:</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">{verificationResult.remediation}</p>
                        </div>
                    )}

                    {verificationResult.details && verificationResult.details.length > 0 && (
                        <div className="mt-5">
                            <h4 className="font-semibold text-gray-200 mb-3">Detailed Findings:</h4>
                            <ul className="space-y-3">
                                {verificationResult.details.map((detail, index) => (
                                    <li key={index} className="flex items-start text-sm bg-gray-700/30 p-3 rounded-lg border border-gray-600">
                                        <span className={`mr-3 mt-0.5 ${detail.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {detail.status === 'success' ? '✓' : '✗'}
                                        </span>
                                        <span className="text-gray-300 flex-grow"><strong>{detail.agent}:</strong> {detail.finding}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {verificationResult.recommended_for_human_review && (
                        <div className="mt-6 p-4 bg-purple-800/30 border border-purple-600 rounded-lg flex items-center gap-3 animate-pulse-fade">
                            <AlertTriangle className="w-7 h-7 text-purple-400 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-purple-300 text-base">Human Review Recommended</p>
                                <p className="text-sm text-purple-200">Due to the nature of this item or the AI's confidence, we recommend a human expert review for definitive authentication.</p>
                                <button className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-4 rounded-full transition-colors shadow-md">
                                    Request Expert Review
                                </button>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => {
                            onNavigate('upload'); // Navigate back to upload screen
                            setSelectedFile(null); // Clear selected file
                            setFilePreview(null); // Clear file preview
                            setObjectClass(''); // Clear object class
                            setSelectedAgent(AGENTS[0].id); // Reset agent to default
                        }}
                        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
                    >
                        Verify Another Item
                    </button>
                </div>
            )}
        </div>
    );
});

export default UploadScreen;

UploadScreen.propTypes = {
    onVerify: PropTypes.func.isRequired,
    initialFile: PropTypes.string,
    initialObjectClass: PropTypes.string,
    verificationResult: PropTypes.object,
    initialAgentId: PropTypes.string,
    isVerifying: PropTypes.bool.isRequired,
    onNavigate: PropTypes.func.isRequired,
};