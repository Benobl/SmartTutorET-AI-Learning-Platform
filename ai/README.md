# SmartTutor AI Engine

The SmartTutor AI Engine is a FastAPI-based service that provides intelligent academic performance predictions and tutoring capabilities for the SmartTutor ET platform.

## Features

- **Performance Prediction**: Predicts a student's final grade based on lessons completed, assessment scores, time spent, and attendance.
- **AI Recommendations**: Generates personalized study tips based on performance metrics.
- **Neural Chat**: Interfaces with OpenAI's models to provide interactive tutoring support.
- **Custom ML Model**: Uses a Scikit-learn model (`performance_model.joblib`) trained on student performance data.

## Prerequisites

- Python 3.9+
- OpenAI API Key (set in `.env`)

## Installation

1. Navigate to the `ai` directory:
   ```bash
   cd ai
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Create a `.env` file in the `ai` directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Service

Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

The service will be available at `http://localhost:8000`.

## API Endpoints

- `POST /predict`: Takes student metrics and returns a grade prediction and recommendations.
- `POST /chat`: Handles interactive chat messages.
- `GET /health`: Checks the system and model status.

## Training the Model

If you need to retrain the model, use the provided trainer scripts:

```bash
python model_trainer.py
```
This will generate a new `performance_model.joblib` based on the data in `student_data.csv`.
