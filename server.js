const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Setup 'uploads' directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));
// Serve uploaded files securely
app.use('/api/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/posts', require('./backend/routes/posts'));

// Fallback logic for SPA or 404
app.use((req, res) => {
    const isApi = req.url.startsWith('/api');
    if (isApi) {
        return res.status(404).json({ message: 'API route not found' });
    }
    
    let reqPath = req.path;
    if (reqPath === '/') reqPath = '/index.html';
    else if (!reqPath.includes('.')) reqPath += '.html';
    
    const filePath = path.join(__dirname, 'frontend', reqPath);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`\n🚀 Server is up and running!`);
    console.log(`👉 Click the link to open: http://localhost:${PORT}\n`);
});
