import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def train_kaggle_model():
    base_path = os.path.dirname(__file__)
    # The user provided path in archive folder
    data_path = os.path.join(base_path, 'archive', 'Student_performance_data _.csv')
    
    if not os.path.exists(data_path):
        # Check if it was moved to the ai folder directly
        data_path = os.path.join(base_path, 'Student_performance_data _.csv')
        if not os.path.exists(data_path):
            print(f"Error: Dataset not found at {data_path}")
            return

    # Load data
    df = pd.read_csv(data_path)
    
    # Selecting relevant features for our SmartTutor system
    # We'll use: StudyTimeWeekly, Absences, Tutoring, ParentalSupport, Extracurricular
    # Target: GPA (which represents the overall grade)
    
    features = ['StudyTimeWeekly', 'Absences', 'Tutoring', 'ParentalSupport', 'Extracurricular']
    X = df[features]
    y = df['GPA']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print("--- KAGGLE DATASET TRAINING RESULTS ---")
    print(f"Features Used: {features}")
    print(f"Mean Absolute Error (GPA points): {mae:.4f}")
    print(f"R2 Score: {r2:.4f}")
    
    # Save model
    model_path = os.path.join(base_path, 'performance_model.joblib')
    joblib.dump(model, model_path)
    print(f"Model successfully updated and saved to {model_path}")

if __name__ == "__main__":
    train_kaggle_model()
