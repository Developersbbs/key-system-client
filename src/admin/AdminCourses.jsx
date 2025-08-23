import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCourses, addCourse, editCourse, removeCourse, clearError } from '../redux/features/coures/courseSlice';
import { Plus, Edit2, Trash2, X, BookOpen, Users, Clock, ImageIcon } from 'lucide-react';

const AdminCourses = () => {
  const dispatch = useDispatch();
  const { courses, error } = useSelector((state) => state.courses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', image: '' });
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({ 
        title: course.title, 
        description: course.description, 
        category: course.category || '', 
        image: course.image || '' 
      });
    } else {
      setEditingCourse(null);
      setFormData({ title: '', description: '', category: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({ title: '', description: '', category: '', image: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('--- handleSubmit function was called! ---');
    console.log('Is editing:', !!editingCourse);
    console.log('Form Data:', formData);
    
    if (editingCourse) {
      dispatch(editCourse({ id: editingCourse._id, updatedData: formData }));
    } else {
      dispatch(addCourse(formData));
    }
    handleCloseModal();
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      dispatch(removeCourse(id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
              <p className="text-gray-600">Create and manage your courses</p>
            </div>
            <button 
              onClick={() => handleOpenModal()} 
              className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              Create Course
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 mr-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                <p className="text-gray-600">Total Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.reduce((acc, course) => acc + (course.chapters?.length || 0), 0)}
                </p>
                <p className="text-gray-600">Total Chapters</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 mr-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(courses.map(course => course.category)).size}
                </p>
                <p className="text-gray-600">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first course</p>
            <button 
              onClick={() => handleOpenModal()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors duration-200"
            >
              <Plus size={20} />
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-r from-teal-600 to-green-600 relative overflow-hidden">
                  {course.image ? (
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-600 text-white flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-white opacity-50" />
                  </div>
                  {course.category && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-white bg-opacity-20 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium">
                        {course.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {course.description.length > 120 
                      ? `${course.description.substring(0, 120)}...` 
                      : course.description
                    }
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {course.chapters?.length || 0} chapters
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link 
                      to={`/admin/courses/${course._id}/chapters`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors duration-200"
                    >
                      <BookOpen size={16} />
                      Manage Chapters
                    </Link>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(course)} 
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                        title="Edit course"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(course._id, course.title)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input 
                      type="text" 
                      id="title"
                      name="title"
                      placeholder="Enter course title" 
                      value={formData.title} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200" 
                      required 
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea 
                      id="description"
                      name="description"
                      placeholder="Enter course description" 
                      value={formData.description} 
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none" 
                      required 
                    />
                  </div>

                  {/* Category and Image URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input 
                        type="text" 
                        id="category"
                        name="category"
                        placeholder="e.g., Programming, Design" 
                        value={formData.category} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200" 
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input 
                        type="url" 
                        id="image"
                        name="image"
                        placeholder="https://example.com/image.jpg" 
                        value={formData.image} 
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200" 
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;