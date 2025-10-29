import React, { useState, useEffect } from 'react';
import { getAllFeedback } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    totalCourses: 0,
    recentFeedback: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const feedback = await getAllFeedback();
        
        const total = feedback.length;
        const avgRating = total > 0
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / total
          : 0;
        
        const courses = new Set(feedback.map(f => f.courseCode)).size;
        
        // Recent feedback (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recent = feedback.filter(
          f => new Date(f.createdAt) > weekAgo
        ).length;

        setStats({
          totalFeedback: total,
          averageRating: avgRating,
          totalCourses: courses,
          recentFeedback: recent,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const CircularStat = ({ value, label, color }) => {
    const percentage = label === 'Average Rating' ? (value / 5) * 100 : 
                      label === 'Total Feedback' ? Math.min((value / 50) * 100, 100) :
                      label === 'Courses' ? Math.min((value / 20) * 100, 100) :
                      Math.min((value / 10) * 100, 100);

    return (
      <div className="circular-stat">
        <div className="circle-container">
          <div 
            className="circle-progress"
            style={{
              background: `conic-gradient(${color} ${percentage}%, #f0f0f0 ${percentage}% 100%)`
            }}
          >
            <div className="circle-inner">
              <div className="stat-value">{value}</div>
              {label === 'Average Rating' && <div className="stat-suffix">/5</div>}
            </div>
          </div>
        </div>
        <div className="stat-label">{label}</div>
      </div>
    );
  };

  const statCards = [
    {
      label: "Total Feedback",
      value: stats.totalFeedback,
      color: "#3498db"
    },
    {
      label: "Average Rating",
      value: stats.averageRating.toFixed(1),
      color: "#f39c12"
    },
    {
      label: "Courses",
      value: stats.totalCourses,
      color: "#2ecc71"
    },
    {
      label: "This Week",
      value: stats.recentFeedback,
      color: "#9b59b6"
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Feedback Dashboard</h1>
        <p>Overview of all course feedback statistics</p>
      </div>
      
      <div className="circular-stats-grid">
        {statCards.map((stat, index) => (
          <CircularStat
            key={stat.label}
            value={stat.value}
            label={stat.label}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;