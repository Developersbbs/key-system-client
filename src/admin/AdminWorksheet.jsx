import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllWorksheets, submitWorksheet, updateWorksheet, deleteWorksheet, clearWorksheetState } from '../redux/features/worksheets/worksheetSlice';
import toast from 'react-hot-toast';

const AdminWorksheet = () => {
    const dispatch = useDispatch();
    const { worksheets, loading, success, error } = useSelector((state) => state.worksheets);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState = {
        name: '', bom: '', bdm: '', tm: '', sCall: '', jCall: '',
        stp1Name: '', stp2Name: '', register: '', staking: '', income: ''
    };

    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(() => {
        const savedDraft = localStorage.getItem('adminWorksheetDraft');
        return savedDraft ? JSON.parse(savedDraft) : initialFormState;
    });

    useEffect(() => {
        if (!editId) {
            localStorage.setItem('adminWorksheetDraft', JSON.stringify(formData));
        }
    }, [formData, editId]);

    useEffect(() => {
        dispatch(fetchAllWorksheets());
        return () => dispatch(clearWorksheetState());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success(editId ? 'Worksheet updated successfully!' : 'Worksheet submitted successfully!');
            setFormData(initialFormState);
            setEditId(null);
            localStorage.removeItem('adminWorksheetDraft');
            // Refresh the list after successful submission
            dispatch(fetchAllWorksheets());
            dispatch(clearWorksheetState());
        }
        if (error) {
            toast.error(error);
            dispatch(clearWorksheetState());
        }
    }, [success, error, dispatch, editId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return toast.error('Name is required');
        }
        if (editId) {
            dispatch(updateWorksheet({ id: editId, worksheetData: formData }));
        } else {
            dispatch(submitWorksheet(formData));
        }
    };

    const handleEdit = (sheet) => {
        setEditId(sheet._id);
        setFormData({
            name: sheet.name || '',
            bom: sheet.bom || '',
            bdm: sheet.bdm || '',
            tm: sheet.tm || '',
            sCall: sheet.sCall || '',
            jCall: sheet.jCall || '',
            stp1Name: sheet.stp1Name || '',
            stp2Name: sheet.stp2Name || '',
            register: sheet.register || '',
            staking: sheet.staking || '',
            income: sheet.income || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            await dispatch(deleteWorksheet(id));
            if (editId === id) {
                setEditId(null);
                setFormData(initialFormState);
                localStorage.removeItem('adminWorksheetDraft');
            }
            dispatch(fetchAllWorksheets());
        }
    };

    const handleCancelEdit = () => {
        setEditId(null);
        const savedDraft = localStorage.getItem('adminWorksheetDraft');
        setFormData(savedDraft ? JSON.parse(savedDraft) : initialFormState);
    };

    const isToday = (dateString) => {
        const d = new Date(dateString);
        const today = new Date();
        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );
    };

    const hasSubmittedToday = worksheets.some(sheet => isToday(sheet.date) && sheet.user?._id === currentUser?._id);

    // Submission is allowed if it's between 6 AM and Midnight (11:59 PM) AND they haven't submitted today, OR if they are currently editing an entry.
    const currentHour = new Date().getHours();
    const isSubmissionAllowed = (currentHour >= 6 && currentHour < 24 && !hasSubmittedToday) || editId !== null;

    const filteredWorksheets = worksheets.filter((sheet) =>
        sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sheet.user && sheet.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto p-4 sm:p-6 pb-24 lg:pb-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Member Worksheets</h1>
                    <p className="text-gray-600 mt-1">Review daily worksheet submissions from all members.</p>
                </div>

                {/* Search / Filters */}
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors w-full md:w-64 shadow-sm"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={() => dispatch(fetchAllWorksheets())}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
                        title="Refresh list"
                    >
                        <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-medium text-red-800">Error loading worksheets</h3>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {isSubmissionAllowed ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {editId ? 'Edit Entry' : 'New Entry'}
                        </h2>
                        {!editId && <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded border border-teal-100 font-medium">Draft Saved</span>}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">BOM</label>
                                <input type="text" name="bom" value={formData.bom} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">BDM</label>
                                <input type="text" name="bdm" value={formData.bdm} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">TM</label>
                                <input type="text" name="tm" value={formData.tm} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">S - CALL</label>
                                <input type="text" name="sCall" value={formData.sCall} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">J - CALL</label>
                                <input type="text" name="jCall" value={formData.jCall} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">STP 1 - NAME</label>
                                <input type="text" name="stp1Name" value={formData.stp1Name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">STP 2 - NAME</label>
                                <input type="text" name="stp2Name" value={formData.stp2Name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">REGISTER</label>
                                <input type="text" name="register" value={formData.register} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">STAKING</label>
                                <input type="text" name="staking" value={formData.staking} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">INCOME</label>
                                <input type="text" name="income" value={formData.income} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            {editId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {editId ? 'Updating' : 'Submitting'}
                                    </>
                                ) : (editId ? 'Update Entry' : 'Submit Entry')}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-100 overflow-hidden mb-8 p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <svg className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-amber-800 mb-2">
                        {hasSubmittedToday ? 'Worksheet Submitted' : 'Submission Closed'}
                    </h2>
                    <p className="text-amber-700 max-w-lg mx-auto">
                        {hasSubmittedToday
                            ? 'You have already submitted your worksheet for today. Great job! You can review or edit it below.'
                            : 'Worksheets can only be submitted between 6:00 AM and 11:59 PM daily. Your window to submit has either not opened yet or has closed. Please return during this time.'}
                    </p>
                </div>
            )}

            {/* Main Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.NO</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">BOM</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">BDM</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">TM</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S-Call</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">J-Call</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STP 1</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STP 2</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Register</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Staking</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Income</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && filteredWorksheets.length === 0 ? (
                                <tr>
                                    <td colSpan="14" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <svg className="animate-spin h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-gray-500 font-medium">Loading worksheets...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredWorksheets.length === 0 ? (
                                <tr>
                                    <td colSpan="14" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-gray-500 font-medium text-lg">No worksheets found</p>
                                            {searchTerm && <p className="text-gray-400 mt-1">Try adjusting your search criteria</p>}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredWorksheets.map((sheet, index) => (
                                    <tr key={sheet._id} className="hover:bg-teal-50/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {new Date(sheet.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                                            <div>{sheet.name}</div>
                                            <div className="text-xs text-gray-500 font-normal">{sheet.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.bom}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.bdm}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.tm}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.sCall}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.jCall}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.stp1Name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.stp2Name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.register}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sheet.staking}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{sheet.income}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                            {isToday(sheet.date) && sheet.user?._id === currentUser?._id && (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(sheet)}
                                                        className="text-teal-600 hover:text-teal-900 transition-colors p-1"
                                                        title="Edit"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(sheet._id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                        title="Delete"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminWorksheet;
