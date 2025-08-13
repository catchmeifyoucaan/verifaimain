# VerifAi: AI-Powered Authenticity Verification

VerifAi is a cutting-edge application designed to empower users with instant, AI-driven authenticity verification. Leveraging advanced machine learning models, VerifAi allows you to quickly determine the legitimacy of various items, from physical products to digital documents, directly through your device's camera or by uploading files.

## Key Features:

*   **Real-time Camera Verification:** Point your camera at an object, and VerifAi's integrated AI vision model (powered by TensorFlow.js and COCO-SSD) will detect and identify it in real-time. Select a detected object to instantly capture an image and send it for authenticity analysis.
*   **Multi-format File Uploads:** Upload images, videos, audio, text documents, PDFs, and even spreadsheets for comprehensive AI analysis. VerifAi supports a wide range of file types to cover diverse verification needs.
*   **Specialized AI Agents:** Choose from a selection of AI agents tailored for specific verification tasks, including:
    *   **General Purpose:** For broad authenticity checks across various items.
    *   **ID Document Verifier:** Specialized in detecting tampering, forgery, and spoofing attempts on identity documents.
    *   **Product Authenticator:** Focuses on brand logos, serial numbers, material quality, and packaging to verify product legitimacy.
    *   **Text Analyzer:** Analyzes textual content for authenticity, anomalies, plagiarism, or AI generation.
*   **Detailed Verification Reports:** Receive clear, concise, and comprehensive reports on the authenticity of your items, including a status (verified, warning, or danger), confidence score, summary, detailed findings, and explanations for any anomalies detected.
*   **User-Friendly Interface:** A clean, intuitive interface ensures a seamless verification experience.
*   **Secure Authentication:** Powered by Firebase Authentication, ensuring your data and sessions are secure.

## How it Works:

VerifAi utilizes a powerful backend (FastAPI) that communicates with the Google Gemini API. When you submit an item for verification, the application sends the data to the backend, which then uses the selected AI agent to analyze the item and return a detailed authenticity report.

## Getting Started:

To run VerifAi locally, ensure you have Node.js, npm, and Python installed. You will also need a Google Gemini API key.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd verifai-render-backend/verifai-app
    ```
2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```
3.  **Install Backend Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables:**
    Create a `.env` file in the `verifai-render-backend/verifai-app` directory with your Google Gemini API key:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
5.  **Run the Backend Server:**
    ```bash
    uvicorn main:app --reload
    ```
6.  **Run the Frontend Application:**
    ```bash
    npm start
    ```

Open your browser to `http://localhost:3000` to access VerifAi.

## Deployment:

VerifAi can be deployed to platforms like Firebase (for the frontend) and Render (for the backend). Refer to their respective documentation for detailed deployment instructions.

## Built With:

*   **Frontend:** React.js, Tailwind CSS, TensorFlow.js, COCO-SSD
*   **Backend:** FastAPI, Google Gemini API
*   **Authentication:** Firebase Authentication

## About SurpriseAI:

VerifAi is a product of **SurpriseAI**, a pioneering company at the forefront of AI innovation. At SurpriseAI, we believe in harnessing the power of artificial intelligence to solve real-world problems and enhance human capabilities. Our mission is to develop intelligent, intuitive, and impactful AI solutions that bring clarity, security, and efficiency to everyday life. With a team of dedicated AI researchers, engineers, and designers, SurpriseAI is committed to pushing the boundaries of what's possible with AI, creating products that are not just technologically advanced but also genuinely surprising in their utility and elegance. We are driven by a passion for innovation and a commitment to building a more secure and intelligent future.

## License:

This project is licensed under the MIT License - see the LICENSE.md file for details.