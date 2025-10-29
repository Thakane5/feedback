const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory "database" - empty, ready for your data
let feedbackDB = [];
let idCounter = 1;

// GET all feedback
app.get("/api/feedback", (req, res) => {
  try {
    // Sort by latest first
    const sortedFeedback = [...feedbackDB].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    return res.status(200).json({
      success: true,
      data: sortedFeedback,
      count: sortedFeedback.length
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// GET single feedback by ID
app.get("/api/feedback/:id", (req, res) => {
  try {
    const feedback = feedbackDB.find((f) => f.id === Number(req.params.id));
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: "Feedback not found" 
      });
    }
    return res.json({ 
      success: true, 
      data: feedback 
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// POST new feedback
app.post("/api/feedback", (req, res) => {
  try {
    const { studentName, courseCode, comments, teachingQuality, preparation, support } = req.body;

    // Validate required fields
    if (!studentName || !courseCode || !comments) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (studentName, courseCode, comments)"
      });
    }

    // Validate rating categories
    if (!teachingQuality || !preparation || !support) {
      return res.status(400).json({
        success: false,
        message: "Please rate all categories (teachingQuality, preparation, support)"
      });
    }

    // Validate rating values (1-5)
    const ratings = [teachingQuality, preparation, support];
    for (const rating of ratings) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "All ratings must be between 1 and 5"
        });
      }
    }

    // Calculate average rating
    const averageRating = Math.round((Number(teachingQuality) + Number(preparation) + Number(support)) / 3);

    const newFeedback = {
      id: idCounter++,
      studentName: studentName.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      comments: comments.trim(),
      rating: averageRating,
      teachingQuality: Number(teachingQuality),
      preparation: Number(preparation),
      support: Number(support),
      createdAt: new Date().toISOString(),
    };

    feedbackDB.push(newFeedback);
    
    return res.status(201).json({
      success: true,
      message: "Feedback added successfully",
      data: newFeedback,
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// DELETE feedback
app.delete("/api/feedback/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const index = feedbackDB.findIndex((f) => f.id === id);
    
    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Feedback not found" 
      });
    }
    
    const deletedFeedback = feedbackDB.splice(index, 1)[0];
    
    return res.json({ 
      success: true, 
      message: "Feedback deleted successfully",
      data: deletedFeedback
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// GET dashboard statistics
app.get("/api/stats", (req, res) => {
  try {
    const totalFeedback = feedbackDB.length;
    
    const averageRating = totalFeedback > 0 
      ? feedbackDB.reduce((sum, f) => sum + f.rating, 0) / totalFeedback 
      : 0;
    
    const totalCourses = new Set(feedbackDB.map(f => f.courseCode)).size;
    
    // Recent feedback (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentFeedback = feedbackDB.filter(
      f => new Date(f.createdAt) > weekAgo
    ).length;

    // Category averages
    const avgTeachingQuality = totalFeedback > 0 
      ? feedbackDB.reduce((sum, f) => sum + f.teachingQuality, 0) / totalFeedback 
      : 0;
    
    const avgPreparation = totalFeedback > 0 
      ? feedbackDB.reduce((sum, f) => sum + f.preparation, 0) / totalFeedback 
      : 0;
    
    const avgSupport = totalFeedback > 0 
      ? feedbackDB.reduce((sum, f) => sum + f.support, 0) / totalFeedback 
      : 0;

    return res.json({
      success: true,
      data: {
        totalFeedback,
        averageRating: Number(averageRating.toFixed(1)),
        totalCourses,
        recentFeedback,
        categoryAverages: {
          teachingQuality: Number(avgTeachingQuality.toFixed(1)),
          preparation: Number(avgPreparation.toFixed(1)),
          support: Number(avgSupport.toFixed(1))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
    data: {
      totalFeedback: feedbackDB.length,
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Feedback API is running!",
    endpoints: {
      "GET /api/feedback": "Get all feedback",
      "GET /api/feedback/:id": "Get single feedback",
      "POST /api/feedback": "Create new feedback",
      "DELETE /api/feedback/:id": "Delete feedback",
      "GET /api/stats": "Get dashboard statistics",
      "GET /api/health": "Health check"
    }
  });
});

// 404 handler for undefined routes - FIXED VERSION
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Available routes: GET /api/feedback, POST /api/feedback, DELETE /api/feedback/:id, GET /api/stats"
  });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Database ready: ${feedbackDB.length} feedback entries`);
  console.log(`API available at: http://localhost:${PORT}`);
});