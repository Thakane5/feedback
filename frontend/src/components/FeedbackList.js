import React, { useState, useEffect } from 'react';
import { getAllFeedback, deleteFeedback } from '../services/api';
import './FeedbackList.css';

const FeedbackList = ({ refreshTrigger }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteFeedback(id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Failed to delete feedback. Please try again.');
      }
    }
  };

  const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="feedback-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-list-error">
        <p>{error}</p>
        <button onClick={fetchFeedbacks} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <div className="feedback-header">
        <h1>All Feedback</h1>
        <p className="subtitle">View and manage all submitted feedback</p>
      </div>

      <div className="divider"></div>

      {feedbacks.length === 0 ? (
        <div className="empty-state">
          <h3>No Feedback Submitted Yet</h3>
          <p>Be the first to share your course experience!</p>
        </div>
      ) : (
        <div className="feedback-cards">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="card-header">
                <div className="student-info">
                  <h3 className="student-name">{feedback.studentName}</h3>
                  <span className="course-code">{feedback.courseCode}</span>
                </div>
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="delete-button"
                  title="Delete feedback"
                >
                  Delete
                </button>
              </div>
              
              <div className="rating-section">
                <StarRating rating={feedback.rating} />
              </div>

              <div className="comments-section">
                <p className="comments">{feedback.comments}</p>
              </div>

              <div className="date-section">
                <span className="timestamp">{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;