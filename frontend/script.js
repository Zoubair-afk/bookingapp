document.getElementById('bookButton').addEventListener('click', function () {
    const instrumentId = document.getElementById('instrumentId').value;
    const name = document.getElementById('name').value;
    const finishTime = document.getElementById('finishTime').value;

    // Input Validation
    if (!instrumentId || !name || !finishTime) {
        alert('Please fill in all fields.');
        return;
    }

    const bookingData = {
        instrumentId: instrumentId,
        name: name,
        finishTime: finishTime,
    };

    fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to book instrument. Please try again.');
        }
        return response.json();
    })
    .then(data => {
        alert('Booking successful!');
        addBookingToList(data);
        addBookingToHistory(data); // Add to history
        clearForm();
    })
    .catch(error => {
        alert(error.message);
    });
});

// Function to add a booking to the current bookings list
function addBookingToList(booking) {
    const bookingList = document.getElementById('bookingList');
    const listItem = document.createElement('li');
    listItem.textContent = `${booking.instrumentId} booked by ${booking.name} until ${new Date(booking.finishTime).toLocaleString()}`;
    bookingList.appendChild(listItem);
}

// Function to add a booking to the history
function addBookingToHistory(booking) {
    const bookingHistoryList = document.getElementById('bookingHistoryList');
    const listItem = document.createElement('li');
    listItem.textContent = `${booking.instrumentId} booked by ${booking.name} until ${new Date(booking.finishTime).toLocaleString()}`;
    bookingHistoryList.appendChild(listItem);
}

// Function to clear the form inputs
function clearForm() {
    document.getElementById('instrumentId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('finishTime').value = '';
}

// Fetching the bookings on page load
window.onload = function () {
    fetchBookings();
};

// Fetch bookings from the server and populate the booking history
function fetchBookings() {
    fetch('http://localhost:3001/api/bookings')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            return response.json();
        })
        .then(data => {
            const bookingHistoryList = document.getElementById('bookingHistoryList');
            bookingHistoryList.innerHTML = ''; // Clear the list first
            data.forEach(booking => {
                const listItem = document.createElement('li');
                listItem.textContent = `${booking.instrumentId} booked by ${booking.name} until ${new Date(booking.finishTime).toLocaleString()}`;
                bookingHistoryList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching bookings:', error);
        });
}

// Request permission for notifications
if (Notification.permission !== 'denied') {
    Notification.requestPermission();
}

// Map QR code strings to instrument IDs
const instrumentQRs = {
    "Glovebox1": "GB1",
    // Add more mappings here if needed
};

// Initialize the QR Code scanner
function startQRCodeScanner() {
    // Explicitly request camera access before initializing the scanner
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function (stream) {
                // Access granted, initialize scanner
                const html5QrCode = new Html5Qrcode("qr-reader");

                html5QrCode.start(
                    { facingMode: "environment" }, // Use the rear camera
                    {
                        fps: 10, // Optional, frames per second
                        qrbox: { width: 250, height: 250 } // Optional, box size
                    },
                    (decodedText, decodedResult) => {
                        // Handle the QR code result here
                        document.getElementById("qr-reader-results").innerText = decodedText;

                        const instrumentId = instrumentQRs[decodedText]; // Get the instrument ID from the QR code
                        if (instrumentId) {
                            document.getElementById("instrumentId").value = instrumentId; // Fill the form automatically
                            promptBookingDetails(instrumentId); // Trigger booking
                        } else {
                            alert('Unknown QR code scanned');
                        }
                    },
                    (errorMessage) => {
                        // Handle errors here
                        console.log("QR Code error:", errorMessage);
                    }
                ).catch(err => {
                    console.log("Failed to start QR scanner:", err);
                });
            })
            .catch(function (err) {
                console.log("Camera access denied: ", err);
                alert("Camera access is required to scan the QR code.");
            });
    } else {
        alert("Camera access is not supported on this device.");
    }
}

// Prompt user to input booking details
function promptBookingDetails(instrumentId) {
    const name = prompt("Enter your name:");
    const finishTime = prompt("Enter estimated finish time (YYYY-MM-DDTHH:mm):");

    // Validate inputs
    if (!name || !finishTime) {
        alert('Please provide both name and finish time.');
        return;
    }

    // Proceed with booking
    const bookingData = {
        instrumentId: instrumentId,
        name: name,
        finishTime: finishTime
    };

    // Submit the booking
    fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to book instrument. Please try again.');
        }
        return response.json();
    })
    .then(data => {
        alert('Booking successful!');
        addBookingToList(data);
        addBookingToHistory(data);
        clearForm();
    })
    .catch(error => {
        alert(error.message);
    });
}

// Start scanning when the page loads
window.onload = function () {
    fetchBookings(); // Fetch previous bookings on load
    startQRCodeScanner(); // Start QR code scanner on load
};
