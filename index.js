const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors({credentials: true, origin: true}));

// app.use(cors({
//   allowedHeaders: ['Content-Type']
// }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});