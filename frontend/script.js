document.getElementById('bookButton').addEventListener('click', function () {
    const instrumentId = document.getElementById('instrumentId').value;
    const name = document.getElementById('name').value;
    const finishTime = document.getElementById('finishTime').value;

    // Input Validation
    if (!instrumentId || !name || !finishTime) {
        alert('Please fill in all fields.');
        return;
    }

    const bookingData = { instrumentId, name, finishTime }; // Simplified object creation

    fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to book instrument. Please try again.');
        }
        return response.json();
    })
    .then(data => {
        // Notify user and update UI
        alert('Booking successful!');
        addBookingToList(data);
        clearForm();
        
        // Send notification
        new Notification('Booking Confirmed', {
            body: `${data.instrumentId} booked until ${new Date(data.finishTime).toLocaleString()}`,
        });
    })
    .catch(error => {
        alert(error.message);
    });
});

// Function to add a booking to the list
function addBookingToList(booking) {
    const bookingList = document.getElementById('bookingList');
    const listItem = document.createElement('li');
    listItem.textContent = `${booking.instrumentId} booked by ${booking.name} until ${new Date(booking.finishTime).toLocaleString()}`;
    bookingList.appendChild(listItem);
}

// Function to clear the form inputs
function clearForm() {
    document.getElementById('instrumentId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('finishTime').value = '';
}

// Fetch bookings on page load
window.onload = function () {
    fetchBookings();
};

// Function to fetch and display bookings
function fetchBookings() {
    fetch('http://localhost:3001/api/bookings')
        .then(response => response.json())
        .then(data => {
            const bookingHistoryList = document.getElementById('bookingHistoryList');
            bookingHistoryList.innerHTML = ''; // Clear the list
            data.forEach(booking => {
                const listItem = document.createElement('li');
                listItem.textContent = `${booking.instrumentId} booked by ${booking.name} until ${new Date(booking.finishTime).toLocaleString()}`;
                bookingHistoryList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching bookings:', error);
        });
};

// Request permission for notifications
if (Notification.permission !== 'denied') {
    Notification.requestPermission();
}
// Function to initialize QR code scanning
function startQRCodeScanner() {
    const qrReader = new Html5Qrcode("qr-reader");
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        // Handle the scanned QR code result
        document.getElementById('instrumentId').value = decodedText; // Assuming QR code contains instrument ID
        qrReader.stop().then((ignore) => {
            console.log("QR Code scanning stopped.");
        }).catch((err) => {
            console.error("Failed to stop scanning.", err);
        });
    };

    const qrCodeErrorCallback = (errorMessage) => {
        // Handle scan error if needed
        console.warn(`QR Code scan error: ${errorMessage}`);
    };

    // Start scanning with the camera
    qrReader.start(
        { facingMode: "environment" }, 
        {
            fps: 10,
            qrbox: 250 // Customize the scanning box size
        },
        qrCodeSuccessCallback,
        qrCodeErrorCallback)
    .catch(err => {
        console.error("Unable to start scanning.", err);
    });
}

// Start the QR code scanner when the page loads
window.onload = function () {
    fetchBookings();
    startQRCodeScanner(); // Initialize QR code scanner
};
