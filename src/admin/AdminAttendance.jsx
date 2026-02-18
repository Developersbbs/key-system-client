import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMeetings, fetchMeetingLogs } from '../redux/features/meetings/meetingSlice';
import { fetchAllMembers } from '../redux/features/members/memberSlice';
import { Calendar, Users, Clock, Search, Download, ChevronRight, BarChart3, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';

// Attendance Details Modal Component
const AttendanceDetailsModal = ({ isOpen, onClose, userId, meetingId, userName }) => {
    const [sessionDetails, setSessionDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId && meetingId) {
            fetchSessionDetails();
        }
    }, [isOpen, userId, meetingId]);

    const fetchSessionDetails = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/meetings/${meetingId}/attendance/${userId}`);
            if (res.data.success) {
                setSessionDetails(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching session details:', error);
            toast.error('Failed to load session details');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Eye className="text-emerald-600" size={24} />
                            Session History
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Detailed attendance for: <span className="font-semibold text-gray-800">{userName || sessionDetails?.userName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : sessionDetails ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                                    <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide mb-1">Total Sessions</p>
                                    <p className="text-3xl font-bold text-emerald-800">{sessionDetails.sessionCount}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                    <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Total Duration</p>
                                    <p className="text-3xl font-bold text-blue-800">{sessionDetails.totalDuration} <span className="text-lg">mins</span></p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                    <p className="text-xs text-purple-700 font-semibold uppercase tracking-wide mb-1">Avg Duration</p>
                                    <p className="text-3xl font-bold text-purple-800">{Math.round(sessionDetails.totalDuration / sessionDetails.sessionCount)} <span className="text-lg">mins</span></p>
                                </div>
                            </div>

                            {/* Sessions Timeline */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-emerald-600" />
                                    Join/Rejoin Timeline
                                </h4>
                                <div className="space-y-3">
                                    {sessionDetails.sessions.map((session, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                                        #{session.sessionNumber}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm">
                                                            {index === 0 ? 'First Join' : `Rejoin ${index}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {session.status === 'Active' ? (
                                                                <span className="text-green-600 font-medium">● Currently Active</span>
                                                            ) : (
                                                                'Completed'
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-blue-600">
                                                        {session.duration > 0 ? `${session.duration} mins` : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Joined At</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {format(new Date(session.joinedAt), 'MMM d, yyyy')}
                                                    </p>
                                                    <p className="text-sm text-emerald-600 font-semibold">
                                                        {format(new Date(session.joinedAt), 'h:mm:ss a')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Left At</p>
                                                    {session.leftAt ? (
                                                        <>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {format(new Date(session.leftAt), 'MMM d, yyyy')}
                                                            </p>
                                                            <p className="text-sm text-red-600 font-semibold">
                                                                {format(new Date(session.leftAt), 'h:mm:ss a')}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-400 italic">Still in meeting</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No session data available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminAttendance = () => {
    const dispatch = useDispatch();
    const { meetings, loading } = useSelector(state => state.meetings);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        dispatch(fetchAllMeetings());
    }, [dispatch]);

    const handleSelectMeeting = (meetingId) => {
        if (selectedMeetingId === meetingId) return; // Already selected
        setSelectedMeetingId(meetingId);
        fetchLogs(meetingId);
    };

    const fetchLogs = (meetingId) => {
        setLoadingLogs(true);
        dispatch(fetchMeetingLogs(meetingId))
            .unwrap()
            .then((data) => {
                setAttendanceLogs(data.logs);
            })
            .catch(() => toast.error('Failed to load attendance logs'))
            .finally(() => setLoadingLogs(false));
    };

    const handleSyncAttendance = async (meetingId, e) => {
        e.stopPropagation(); // Prevent row click
        const toastId = toast.loading("Syncing with Zoom...");
        try {
            const res = await apiClient.post(`/meetings/${meetingId}/sync`);
            if (res.data.success) {
                toast.success(res.data.message, { id: toastId });
                // If this is the currently selected meeting, refresh logs
                if (selectedMeetingId === meetingId) {
                    fetchLogs(meetingId);
                }
            }
        } catch (error) {
            console.error("Sync error:", error);
            toast.error(error.response?.data?.message || "Failed to sync attendance", { id: toastId });
        }
    };

    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedMeeting = meetings.find(m => m._id === selectedMeetingId);

    const downloadReport = () => {
        if (!attendanceLogs.length || !selectedMeeting) return;

        const headers = ['Name', 'Email', 'Joined At', 'Left At', 'Duration (mins)'];
        const csvRows = [headers.join(',')];

        attendanceLogs.forEach(log => {
            const row = [
                `"${log.userName}"`,
                `"${log.userId?.email || ''}"`,
                `"${format(new Date(log.joinedAt), 'PP pp')}"`,
                `"${log.leftAt ? format(new Date(log.leftAt), 'PP pp') : '-'}"`,
                log.duration
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedMeeting.title}_attendance.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleViewDetails = (log) => {
        setSelectedUser({
            userId: log.userId._id || log.userId,
            userName: log.userName
        });
        setIsModalOpen(true);
    };

    // Calculate generic stats
    const totalParticipants = attendanceLogs.length;
    const avgDuration = totalParticipants > 0
        ? Math.round(attendanceLogs.reduce((acc, log) => acc + (log.duration || 0), 0) / totalParticipants)
        : 0;

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance Reports</h1>
                    <p className="text-gray-500 mt-1">Track member participation and watching hours</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">

                {/* Left: Meeting List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search meetings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div></div>
                        ) : filteredMeetings.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">No meetings found</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredMeetings.map(meeting => (
                                    <div
                                        key={meeting._id}
                                        onClick={() => handleSelectMeeting(meeting._id)}
                                        className={`p-4 cursor-pointer hover:bg-emerald-50 transition-colors ${selectedMeetingId === meeting._id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-semibold text-sm ${selectedMeetingId === meeting._id ? 'text-emerald-800' : 'text-gray-800'}`}>{meeting.title}</h3>
                                            {meeting.zoomMeetingId && (
                                                <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Zoom</span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 gap-3 mb-2">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(meeting.meetingDate), 'MMM d, yyyy')}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(meeting.meetingDate), 'h:mm a')}</span>
                                        </div>

                                        {selectedMeetingId === meeting._id && meeting.zoomMeetingId && (
                                            <button
                                                onClick={(e) => handleSyncAttendance(meeting._id, e)}
                                                className="w-full mt-2 text-xs bg-white border border-emerald-200 text-emerald-700 py-1.5 rounded-lg font-medium hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                                                Sync Report
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                    {!selectedMeeting ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-1">Select a Meeting</h3>
                            <p className="text-sm">Choose a meeting from the list to view attendance details and watching hours.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedMeeting.title}</h2>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {format(new Date(selectedMeeting.meetingDate), 'PPP p')}</span>
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Participants</p>
                                        <p className="text-xl font-bold text-emerald-600">{totalParticipants}</p>
                                    </div>
                                    <div className="text-right pl-4 border-l border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg Duration</p>
                                        <p className="text-xl font-bold text-blue-600">{avgDuration}m</p>
                                    </div>
                                    <button
                                        onClick={downloadReport}
                                        disabled={attendanceLogs.length === 0}
                                        className="ml-2 flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Download CSV"
                                    >
                                        <Download size={18} /> Export
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loadingLogs ? (
                                    <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div></div>
                                ) : attendanceLogs.length === 0 ? (
                                    <div className="text-center p-20 text-gray-500">
                                        <p>No attendance records found.</p>
                                        {selectedMeeting.zoomMeetingId && (
                                            <p className="text-xs mt-2 text-emerald-600">Try clicking "Sync Report" to fetch data from Zoom.</p>
                                        )}
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Member</th>
                                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Joined At</th>
                                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Left At</th>
                                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Duration</th>
                                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {attendanceLogs.map((log) => (
                                                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                                {log.userName.charAt(0)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <button
                                                                    onClick={() => handleViewDetails(log)}
                                                                    className="text-left hover:text-emerald-600 transition-colors group"
                                                                >
                                                                    <p className="font-medium text-gray-900 text-sm group-hover:underline flex items-center gap-1">
                                                                        {log.userName}
                                                                        <Eye size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">{log.userId?.email}</p>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {format(new Date(log.joinedAt), 'h:mm a')}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {log.leftAt ? format(new Date(log.leftAt), 'h:mm a') : '-'}
                                                    </td>
                                                    <td className="p-4 text-sm text-right">
                                                        {log.duration > 0 ? (
                                                            <span className="font-bold text-blue-600">{log.duration} mins</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.duration > 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {log.duration > 30 ? 'Attended' : 'Partial'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Attendance Details Modal */}
            <AttendanceDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={selectedUser?.userId}
                meetingId={selectedMeetingId}
                userName={selectedUser?.userName}
            />
        </div>
    );
};

export default AdminAttendance;
