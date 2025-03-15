
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const winston = require('winston');
const cors = require("cors");

const app = express(); // ✅ Move this up
app.use(cors());  
// Logger setup
const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
  });

  const getPostsSummary = async (startTime, endTime) => {
    try {
      const url = `http://localhost:3002/api/posts?startTime=${startTime}&endTime=${endTime}`;
      console.log(`Fetching posts from: ${url}`); // Debugging
      const response = await axios.get(url);
      console.log(`Received response:`, response.data); // Debugging
      return { totalPosts: response.data.length };
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      console.error("Error details:", error.response?.data || error);
      return { error: "Failed to fetch postssss" };
    }
  };
  
  // Root route
  app.get("/", (req, res) => {
    res.send("Post Summary Service is running!");
  });
  
  // Summary route
  app.get("/summary", async (req, res) => {   
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime and endTime are required" });
    } 
    const summary = await getPostsSummary(startTime, endTime);
    res.json(summary);
  });
  
// Start the server
const PORT = process.env.PORT || 3003;
app.listen(3003, () => {
  console.log(`Post Summary Service running on port ${3003}`);
});

// Function to fetch posts from the Posts service
// const getPostsSummary = async (startTime, endTime) => {
//     try {
//       const response = await axios.get(`${process.env.POSTS_SERVICE_URL}?startTime=${startTime}&endTime=${endTime}`);
//       return { totalPosts: response.data.length };
//     } catch (error) {
//       return { error: "Failed to fetch posts" };
//     }
//   }; 