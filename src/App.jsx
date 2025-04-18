import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_PATH } from './data/ApiPath';
import StudentPanel from './StudentPanel';
import './App.css';

function App() {
  const [activePanel, setActivePanel] = useState('student'); // 'student' or 'admin'
  const [formData, setFormData] = useState({
    subjectName: '',
    unitName: '',
    topic: '',
    extraInfo: '',
    secretCode: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showMessage, setShowMessage] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subjectName: '',
    unitName: '',
    topic: '',
    extraInfo: '',
    secretCode: ''
  });

  useEffect(() => {
    if (activePanel === 'admin') {
      fetchResources();
    }
  }, [activePanel]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_PATH}/api/resources`);
      setResources(response.data);
      setLoading(false);
    } catch (error) {
      setMessage({ text: 'Error fetching resources', type: 'error' });
      setShowMessage(true);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleEditFileChange = (e) => {
    setEditingResource(prev => ({
      ...prev,
      newPdfFile: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('subjectName', formData.subjectName);
    data.append('unitName', formData.unitName);
    data.append('topic', formData.topic);
    data.append('extraInfo', formData.extraInfo);
    data.append('secretCode', formData.secretCode);
    
    if (pdfFile) {
      data.append('pdf', pdfFile);
    }

    try {
      const response = await axios.post(`${API_PATH}/api/resources`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201) {
        setMessage({ text: 'Resource added successfully!', type: 'success' });
        setFormData({
          subjectName: '',
          unitName: '',
          topic: '',
          extraInfo: '',
          secretCode: ''
        });
        setPdfFile(null);
        fetchResources(); // Refresh the resources list
      }
      
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Error adding resource', 
        type: 'error' 
      });
      setShowMessage(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await axios.delete(`${API_PATH}/api/resources/${id}`, {
        data: { secretCode: formData.secretCode }
      });
      
      setMessage({ text: 'Resource deleted successfully!', type: 'success' });
      setShowMessage(true);
      fetchResources(); // Refresh the resources list
      
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Error deleting resource', 
        type: 'error' 
      });
      setShowMessage(true);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setEditFormData({
      subjectName: resource.subjectName,
      unitName: resource.unitName,
      topic: resource.topic,
      extraInfo: resource.extraInfo || '',
      secretCode: formData.secretCode
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('subjectName', editFormData.subjectName);
    data.append('unitName', editFormData.unitName);
    data.append('topic', editFormData.topic);
    data.append('extraInfo', editFormData.extraInfo);
    data.append('secretCode', editFormData.secretCode);
    
    if (editingResource.newPdfFile) {
      data.append('pdf', editingResource.newPdfFile);
    }

    try {
      await axios.put(`${API_PATH}/api/resources/${editingResource._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ text: 'Resource updated successfully!', type: 'success' });
      setShowMessage(true);
      setShowEditModal(false);
      fetchResources();
      
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Error updating resource', 
        type: 'error' 
      });
      setShowMessage(true);
    }
  };

  const renderAdminPanel = () => (
    <div className="admin-panel">
      <div className="form-container">
        <h1>Resources Manager Admin Panel</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subjectName">Subject Name:</label>
            <input
              type="text"
              id="subjectName"
              name="subjectName"
              value={formData.subjectName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="unitName">Unit Name:</label>
            <input
              type="text"
              id="unitName"
              name="unitName"
              value={formData.unitName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="topic">Topic:</label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="extraInfo">Extra Information:</label>
            <textarea
              id="extraInfo"
              name="extraInfo"
              value={formData.extraInfo}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pdf">Upload PDF:</label>
            <input
              type="file"
              id="pdf"
              name="pdf"
              accept=".pdf"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="secretCode">Admin Secret Code:</label>
            <input
              type="password"
              id="secretCode"
              name="secretCode"
              value={formData.secretCode}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit">Add Resource</button>
        </form>
        
        {showMessage && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="resources-list">
        <h2>Existing Resources</h2>
        {loading ? (
          <div className="loading">Loading resources...</div>
        ) : (
          <div className="resources-grid">
            {resources.map((resource) => (
              <div key={resource._id} className="resource-card">
                <h3>{resource.subjectName}</h3>
                <div className="resource-details">
                  <p><strong>Unit:</strong> {resource.unitName}</p>
                  <p><strong>Topic:</strong> {resource.topic}</p>
                  {resource.extraInfo && (
                    <p><strong>Additional Info:</strong> {resource.extraInfo}</p>
                  )}
                </div>
                <div className="resource-actions">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="edit-btn"
                  >
                    Edit Resource
                  </button>
                  <button
                    onClick={() => handleDelete(resource._id)}
                    className="delete-btn"
                  >
                    Delete Resource
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Resource</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="edit-subjectName">Subject Name:</label>
                <input
                  type="text"
                  id="edit-subjectName"
                  name="subjectName"
                  value={editFormData.subjectName}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-unitName">Unit Name:</label>
                <input
                  type="text"
                  id="edit-unitName"
                  name="unitName"
                  value={editFormData.unitName}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-topic">Topic:</label>
                <input
                  type="text"
                  id="edit-topic"
                  name="topic"
                  value={editFormData.topic}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-extraInfo">Extra Information:</label>
                <textarea
                  id="edit-extraInfo"
                  name="extraInfo"
                  value={editFormData.extraInfo}
                  onChange={handleEditInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-pdf">Update PDF (optional):</label>
                <input
                  type="file"
                  id="edit-pdf"
                  name="pdf"
                  accept=".pdf"
                  onChange={handleEditFileChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-secretCode">Admin Secret Code:</label>
                <input
                  type="password"
                  id="edit-secretCode"
                  name="secretCode"
                  value={editFormData.secretCode}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="modal-buttons">
                <button type="submit" className="update-btn">Update Resource</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      <nav className="navigation">
        <button
          className={`nav-btn ${activePanel === 'student' ? 'active' : ''}`}
          onClick={() => setActivePanel('student')}
        >
          Student Panel
        </button>
        <button
          className={`nav-btn ${activePanel === 'admin' ? 'active' : ''}`}
          onClick={() => setActivePanel('admin')}
        >
          Admin Panel
        </button>
      </nav>

      {activePanel === 'student' ? <StudentPanel /> : renderAdminPanel()}
    </div>
  );
}

export default App; 