import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllLevels, addLevel, editLevel, removeLevel } from '../redux/features/level/levelSlice';
import { fetchAllCourses } from '../redux/features/coures/courseSlice';
import { Plus, Edit, Trash, X, BookOpen, ChevronRight, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const LevelFormModal = ({ isOpen, onClose, onSubmit, courses, levelData }) => {
  const [formData, setFormData] = useState({ name: '', levelNumber: '', courses: [] });

  useEffect(() => {
    if (levelData) {
      setFormData({
        name: levelData.name || '',
        levelNumber: levelData.levelNumber || '',
        courses: levelData.courses?.map(c => c._id) || []
      });
    } else {
      setFormData({ name: '', levelNumber: '', courses: [] });
    }
  }, [levelData, isOpen]);

  const handleCourseToggle = (courseId) => {
    setFormData(prev => {
      const newCourses = prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId];
      return { ...prev, courses: newCourses };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center bg-green-700 text-white rounded-t-lg">
            <h3 className="text-xl font-semibold">{levelData ? 'Edit Level' : 'Create New Level'}</h3>
            <button type="button" onClick={onClose} className="p-1 hover:bg-green-800 rounded-full transition-colors">
              <X size={20}/>
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Name</label>
              <input 
                type="text" 
                placeholder="Enter level name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Number</label>
              <input 
                type="number" 
                placeholder="Enter level number" 
                value={formData.levelNumber} 
                onChange={(e) => setFormData({...formData, levelNumber: e.target.value})} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                required 
                min="1" 
              />
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Assign Courses:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                {courses.map(course => (
                  <label key={course._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-green-50 transition-colors cursor-pointer border border-gray-200">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-green-600 focus:ring-green-500" 
                      checked={formData.courses.includes(course._id)} 
                      onChange={() => handleCourseToggle(course._id)} 
                    />
                    <BookOpen size={16} className="text-green-600" />
                    <span className="flex-1">{course.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              {levelData ? 'Update Level' : 'Create Level'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminLevels = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const dispatch = useDispatch();

  const { levels, error, loading } = useSelector(state => state.levels);
  const { courses } = useSelector(state => state.courses);

  useEffect(() => {
    dispatch(fetchAllLevels());
    dispatch(fetchAllCourses());
  }, [dispatch]);
  
  const handleOpenModal = (level = null) => {
    setEditingLevel(level);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingLevel(null);
    setIsModalOpen(false);
  };
  
  const handleSubmit = (formData) => {
    const action = editingLevel
      ? dispatch(editLevel({ id: editingLevel._id, updatedData: formData }))
      : dispatch(addLevel(formData));
      
    action.unwrap()
      .then(() => toast.success(`Level ${editingLevel ? 'updated' : 'created'}!`))
      .catch((err) => toast.error(err.message || 'An error occurred'));
    
    handleCloseModal();
  };

  const handleDelete = (levelId, levelName) => {
    if (window.confirm(`Are you sure you want to delete "${levelName}"? This action cannot be undone.`)) {
      dispatch(removeLevel(levelId)).unwrap()
        .then(() => toast.success("Level deleted successfully"))
        .catch(err => toast.error(err.message || 'Failed to delete level'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
              Admin Panel
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center">
                <Home size={16} className="text-gray-400" />
                <a href="#" className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">Dashboard</a>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight size={16} className="text-gray-400" />
                <span className="ml-2 text-sm font-medium text-green-700">Level Management</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Level Management</h1>
            <p className="text-green-100 mt-1">Create and manage educational levels and their courses</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-white text-green-700 px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-green-50 transition-colors shadow-md"
          >
            <Plus size={20} /> New Level
          </button>
        </div>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Error: {error}
          </div>
        )}

        {/* Levels List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">All Levels ({levels.length})</h2>
          </div>
          
          { levels.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No levels yet</h3>
              <p className="mt-1 text-gray-500">Get started by creating your first level.</p>
              <button 
                onClick={() => handleOpenModal()} 
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto hover:bg-green-700 transition-colors"
              >
                <Plus size={18} /> Create Level
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {levels.map(level => (
                <li key={level._id} className="p-6 hover:bg-green-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-100 text-green-800 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                          {level.levelNumber}
                        </div>
                        <h3 className="font-bold text-xl text-gray-900">{level.name}</h3>
                      </div>
                      <div className="ml-12">
                        <p className="text-sm text-gray-500 mb-2">
                          Courses: {level.courses.filter(c => c).length || 'None'}
                        </p>
                        {level.courses.filter(c => c).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {level.courses.filter(c => c).map(course => (
                              <span key={course._id} className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <BookOpen size={12} className="mr-1" />
                                {course.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(level)} 
                        className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                        title="Edit level"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(level._id, level.name)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete level"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <LevelFormModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          courses={courses}
          levelData={editingLevel}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Education Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AdminLevels;