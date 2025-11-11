### Step 1: Set Up Your Project Structure

Create a new directory for your project and set up the following structure:

```
pdf-viewer/
│
├── index.html
├── styles.css
└── script.js
```

### Step 2: Include PDF.js Library

You can include PDF.js in your project by downloading it or linking to a CDN. For simplicity, we'll use a CDN in this example.

### Step 3: Create `index.html`

Create the `index.html` file with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Viewer</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
</head>
<body>
    <div id="pdf-viewer">
        <canvas id="pdf-canvas"></canvas>
    </div>
    <input type="file" id="file-input" accept="application/pdf" />
    <script src="script.js"></script>
</body>
</html>
```

### Step 4: Create `styles.css`

Create the `styles.css` file to style your PDF viewer:

```css
body {
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
}

#pdf-viewer {
    border: 1px solid #ccc;
    width: 80%;
    height: 80%;
    overflow: auto;
}

canvas {
    width: 100%;
    height: auto;
}
```

### Step 5: Create `script.js`

Create the `script.js` file to handle the PDF rendering:

```javascript
const fileInput = document.getElementById('file-input');
const pdfCanvas = document.getElementById('pdf-canvas');
const ctx = pdfCanvas.getContext('2d');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    """
    Single-server Node setup
    ========================

    This project now supports running a single Node.js server that serves the frontend and provides the backend API (no separate Python Flask server required).

    Quick start
    -----------

    1. Install dependencies and start the server from the project root:

    ```powershell
    cd c:\Users\Muaaz\Desktop\web-project
    npm install
    npm start
    ```

    2. Open the app in your browser:

    - Main site / tracking: http://localhost:5000
    - Owner dashboard: http://localhost:5000/owner.html
    - Login: http://localhost:5000/login.html
    - Signup: http://localhost:5000/signup.html

    Notes
    -----
    - The Node server is implemented in `server.js` and uses `db.json` (lowdb) as a simple JSON database.
    - API endpoints mirror the previous Flask API (track, orders CRUD, users, register, login).
    - Frontend JS now uses relative API paths (e.g. `/api/orders`) so the same origin serves everything.

    If you want me to add a VS Code `launch.json` entry to run the server from the debugger or add a dev watcher (nodemon), say so and I'll add it.

    If you run into errors while starting the server, paste the terminal output here and I'll help fix them.
    """