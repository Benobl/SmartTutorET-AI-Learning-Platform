import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def train_model():
    base_path = os.path.dirname(__file__)
    data_path = os.path.join(base_path, 'student_data.csv')
    
    if not os.path.exists(data_path):
        print("❌ Data file not found. Run data_generator.py first.")
        return

    # Load data
    df = pd.read_csv(data_path)
    
    # Features and Target
    X = df.drop('final_grade', axis=1)
    y = df['final_grade']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest Regressor
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"Model Performance:")
    print(f"   Mean Absolute Error: {mae:.2f}")
    print(f"   R2 Score: {r2:.2f}")
    
    # Save model
    model_path = os.path.join(base_path, 'performance_model.joblib')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
