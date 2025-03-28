const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000; // Change if needed

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set views directory

// Serve static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// Route to serve the homepage
app.get("/", (req, res) => {
    res.render("Main"); // No need to add ".ejs"
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
