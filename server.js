// Import necessary packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an instance of Express
const app = express();
const PORT = 3001; // You can change this to your preferred port

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse incoming JSON requests

// In-memory storage for bookings
let bookings = [];

// API endpoint to create a new booking
app.post('/api/bookings', (req, res) => {
    const { instrumentId, name, finishTime } = req.body;
    // Check if the instrument is already booked
    const existingBooking = bookings.find(booking => booking.instrumentId === instrumentId);
    if (existingBooking) {
        return res.status(400).json({ message: 'Instrument is already booked.' });
    }

    // Create a new booking
    const newBooking = { instrumentId, name, finishTime };
    bookings.push(newBooking);

    res.status(201).json(newBooking);
});

// API endpoint to get all bookings
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
