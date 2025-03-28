const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname,));

// Serve static files (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    res.render('dashboard'); // Renders views/dashboard.ejs
});

app.get('/login', (req, res) => {
    res.render('login'); // Assuming you have a login.ejs
});

app.get('/events', (req, res) => {
    res.render('events'); // Assuming you have an events.ejs
});

app.get('/home', (req, res) => {
    res.render('home'); // Assuming you have a home.ejs
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

