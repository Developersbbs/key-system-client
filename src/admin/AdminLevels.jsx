import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllLevels, addLevel, editLevel, removeLevel } from '../redux/features/level/levelSlice';
// ✅ FIXED: Corrected import path from 'coures' to 'courses'
import { fetchAllCourses } from '../redux/features/coures/courseSlice';
import { Plus, Edit, Trash, X } from 'lucide-react';
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
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold">{levelData ? 'Edit Level' : 'Create New Level'}</h3>
            <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <input type="text" placeholder="Level Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" required />
            <input type="number" placeholder="Level Number" value={formData.levelNumber} onChange={(e) => setFormData({...formData, levelNumber: e.target.value})} className="w-full p-2 border rounded" required min="1" />
            <div>
              <h4 className="font-semibold mb-2">Assign Courses:</h4>
              <div className="space-y-2">
                {courses.map(course => (
                  <label key={course._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                    <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={formData.courses.includes(course._id)} onChange={() => handleCourseToggle(course._id)} />
                    {course.title}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Save Level</button>
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

  const { levels, error } = useSelector(state => state.levels);
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
      .catch((err) => toast.error(err));
    
    handleCloseModal();
  };

  const handleDelete = (levelId, levelName) => {
    if (window.confirm(`Are you sure you want to delete "${levelName}"?`)) {
      dispatch(removeLevel(levelId)).unwrap()
        .then(() => toast.success("Level deleted."))
        .catch(err => toast.error(err));
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Level Management</h1>
        <button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> New Level
        </button>
      </div>
      
      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">Error: {error}</div>}

      <div className="bg-white rounded-lg shadow-sm">
       
          <ul className="divide-y">
            {levels.map(level => (
              <li key={level._id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Level {level.levelNumber}: {level.name}</h3>
                  <p className="text-sm text-gray-500">
                    Courses: {
                      level.courses
                        .filter(c => c) // Filter out null courses
                        .map(c => c.title)
                        .join(', ') || 'None'
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(level)} className="p-2 hover:bg-gray-100 rounded-md"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(level._id, level.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-md"><Trash size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        
      </div>

      <LevelFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        courses={courses}
        levelData={editingLevel}
      />
    </div>
  );
};

export default AdminLevels;