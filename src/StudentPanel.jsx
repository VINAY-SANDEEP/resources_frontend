import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_PATH } from './data/ApiPath';
import './StudentPanel.css';

function StudentPanel() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_PATH}/api/resources`);
      setResources(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching resources');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredResources = resources.filter(resource => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resource.subjectName.toLowerCase().includes(searchLower) ||
      resource.unitName.toLowerCase().includes(searchLower) ||
      resource.topic.toLowerCase().includes(searchLower)
    );
  });

  const handleDownload = async (pdfPath) => {
    if (!pdfPath) {
      alert('No PDF available for this resource');
      return;
    }

    try {
      window.open(`${API_PATH}${pdfPath}`, '_blank');
    } catch (error) {
      alert('Error opening PDF');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="student-panel">
      <h1>Student Resources Panel</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by subject, unit, or topic..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="resources-grid">
        {filteredResources.map((resource) => (
          <div key={resource._id} className="resource-card">
            <h3>{resource.subjectName}</h3>
            <div className="resource-details">
              <p><strong>Unit:</strong> {resource.unitName}</p>
              <p><strong>Topic:</strong> {resource.topic}</p>
              {resource.extraInfo && (
                <p><strong>Additional Info:</strong> {resource.extraInfo}</p>
              )}
            </div>
            <button
              onClick={() => handleDownload(resource.pdfPath)}
              className="download-btn"
              disabled={!resource.pdfPath}
            >
              {resource.pdfPath ? 'View PDF' : 'No PDF Available'}
            </button>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="no-results">
          No resources found matching your search.
        </div>
      )}
    </div>
  );
}

export default StudentPanel;