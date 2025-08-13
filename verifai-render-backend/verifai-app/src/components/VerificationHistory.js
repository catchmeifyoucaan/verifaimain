
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { useFirebase } from '../App';
import { useAuth } from '../App';
import { Loader, Search, Filter, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const VerificationHistory = () => {
    const { db } = useFirebase();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'verified', 'warning', 'danger'

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !db) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const q = query(collection(db, "users", user.uid, "personal_verifications"), orderBy("timestamp", "desc"));
                const querySnapshot = await getDocs(q);
                const fetchedHistory = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setHistory(fetchedHistory);
            } catch (err) {
                console.error("Error fetching verification history:", err);
                setError("Failed to load history. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, db]);

    const filteredHistory = history.filter(item => {
        const matchesSearch = searchTerm === '' || 
                              item.object_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.summary?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case 'danger': return <XCircle className="w-5 h-5 text-red-400" />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-start w-full h-full p-4 sm:p-6 lg:p-8">
            <h2 className="text-4xl font-extrabold mb-8 text-white">Verification History</h2>

            <div className="w-full max-w-3xl bg-gray-800/60 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by object, title, or summary..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="verified">Verified</option>
                            <option value="warning">Warning</option>
                            <option value="danger">Danger</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center text-gray-400 mt-10">
                    <Loader className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg">Loading history...</p>
                </div>
            )}

            {error && (
                <div className="flex flex-col items-center justify-center text-red-400 mt-10">
                    <XCircle className="w-12 h-12 mb-4" />
                    <p className="text-lg">{error}</p>
                </div>
            )}

            {!loading && !error && filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center text-gray-400 mt-10">
                    <Calendar className="w-12 h-12 mb-4" />
                    <p className="text-lg">No verification history found.</p>
                    <p className="text-md text-gray-500">Start verifying items to see your history here!</p>
                </div>
            )}

            {!loading && !error && filteredHistory.length > 0 && (
                <div className="w-full max-w-3xl space-y-4">
                    {filteredHistory.map((item) => (
                        <div key={item.id} className={`bg-gray-800/60 backdrop-blur-lg border ${item.status === 'verified' ? 'border-green-600' : item.status === 'warning' ? 'border-amber-600' : 'border-red-600'} rounded-xl shadow-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                            <div className="flex items-center gap-3">
                                {getStatusIcon(item.status)}
                                <div>
                                    <p className="text-lg font-semibold text-white">{item.title || 'Verification Result'}</p>
                                    <p className="text-sm text-gray-300">{item.object_class} - {item.summary}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm text-gray-400">{item.timestamp?.toDate().toLocaleString() || 'N/A'}</p>
                                {item.confidence && <p className="text-xs text-gray-500">Confidence: {item.confidence.toFixed(2)}%</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

VerificationHistory.propTypes = {};

export default VerificationHistory;
