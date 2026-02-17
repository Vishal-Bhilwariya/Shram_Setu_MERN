try {
    console.log("Starting server...");
    require('./server.js');
} catch (e) {
    console.error("Failed to start server:", e);
}
