import React, { useState } from 'react';
import { addFeedback } from '../services/api';
import './FeedbackForm.css';

const FeedbackForm = ({ onFeedbackAdded }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    comments: '',
    engagement: 0,
    resources: 0,
    satisfaction: 0
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      [category]: rating
    }));
    
    if (errors[category]) {
      setErrors(prev => ({
        ...prev,
        [category]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = "Student name is required";
    } else if (formData.studentName.length < 2) {
      newErrors.studentName = "Name must be at least 2 characters";
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = "Course code is required";
    } else if (formData.courseCode.length < 2) {
      newErrors.courseCode = "Course code must be at least 2 characters";
    }

    if (!formData.comments.trim()) {
      newErrors.comments = "Comments are required";
    } else if (formData.comments.length < 10) {
      newErrors.comments = "Comments must be at least 10 characters";
    }

    if (formData.engagement < 1) {
      newErrors.engagement = "Please rate course engagement";
    }

    if (formData.resources < 1) {
      newErrors.resources = "Please rate learning resources";
    }

    if (formData.satisfaction < 1) {
      newErrors.satisfaction = "Please rate overall satisfaction";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate average rating from all categories
      const averageRating = (formData.engagement + formData.resources + formData.satisfaction) / 3;
      
      await addFeedback({
        studentName: formData.studentName.trim(),
        courseCode: formData.courseCode.trim(),
        comments: formData.comments.trim(),
        rating: Math.round(averageRating),
        engagement: formData.engagement,
        resources: formData.resources,
        satisfaction: formData.satisfaction
      });

      setSuccessMessage('Feedback submitted successfully!');
      setFormData({
        studentName: '',
        courseCode: '',
        comments: '',
        engagement: 0,
        resources: 0,
        satisfaction: 0
      });
      setErrors({});

      if (onFeedbackAdded) {
        onFeedbackAdded();
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({ submit: error.message || 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingCategory = ({ title, value, onChange, error }) => {
    return (
      <div className="rating-category">
        <div className="category-header">
          <label className="category-label">{title}</label>
          <div className="rating-display">
            <span className="rating-number">{value}</span>
            <span className="rating-slash">/5</span>
          </div>
        </div>
        <div className="star-rating-group">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= value ? 'active' : ''}`}
              onClick={() => onChange(star)}
            >
              <span className="star-icon">★</span>
              <span className="star-number">{star}</span>
            </button>
          ))}
        </div>
        {error && <div className="category-error">{error}</div>}
      </div>
    );
  };

  return (
    <div className="feedback-form-container">
      <div className="form-header">
        <h1>Submit Course Feedback</h1>
        <p>Share your experience and help us improve</p>
      </div>

      <div className="form-card">
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label htmlFor="studentName" className="form-label">Student Name *</label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className={`form-input ${errors.studentName ? 'error' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.studentName && (
              <div className="error-message">{errors.studentName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="courseCode" className="form-label">Course Code *</label>
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              className={`form-input ${errors.courseCode ? 'error' : ''}`}
              placeholder="e.g., BIWA2110"
            />
            {errors.courseCode && (
              <div className="error-message">{errors.courseCode}</div>
            )}
          </div>

          {/* Ratings Section */}
          <div className="rating-section">
            <h3 className="rating-section-title">Course Ratings (1-5)</h3>
            
            <RatingCategory
              title="How engaging is this course"
              value={formData.engagement}
              onChange={(rating) => handleRatingChange('engagement', rating)}
              error={errors.engagement}
            />

            <RatingCategory
              title="Learning Resources & Support"
              value={formData.resources}
              onChange={(rating) => handleRatingChange('resources', rating)}
              error={errors.resources}
            />

            <RatingCategory
              title="Overall Satisfaction"
              value={formData.satisfaction}
              onChange={(rating) => handleRatingChange('satisfaction', rating)}
              error={errors.satisfaction}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comments" className="form-label">Additional Comments *</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              className={`form-textarea ${errors.comments ? 'error' : ''}`}
              placeholder="Share your detailed feedback about the course..."
              rows="5"
            />
            {errors.comments && (
              <div className="error-message">{errors.comments}</div>
            )}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;