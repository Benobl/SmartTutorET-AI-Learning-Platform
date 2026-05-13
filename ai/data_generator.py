import pandas as pd
import numpy as np
import os

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    
    # Features
    # 1. lessons_completed (0-100%)
    lessons_completed = np.random.uniform(0, 100, num_samples)
    
    # 2. avg_assessment_score (0-100)
    # Typically correlated with lessons completed but with noise
    avg_assessment_score = lessons_completed * 0.7 + np.random.normal(10, 10, num_samples)
    avg_assessment_score = np.clip(avg_assessment_score, 0, 100)
    
    # 3. time_spent_hours (0-200)
    time_spent_hours = (lessons_completed * 1.5) + np.random.normal(20, 15, num_samples)
    time_spent_hours = np.clip(time_spent_hours, 1, 300)
    
    # 4. attendance_rate (0-1)
    attendance_rate = np.random.uniform(0.5, 1.0, num_samples)
    
    # 5. previous_grade (0-100)
    previous_grade = np.random.normal(70, 15, num_samples)
    previous_grade = np.clip(previous_grade, 40, 100)
    
    # Target: Predicted Final Grade (0-100)
    # Formula: 0.4*assessment + 0.2*lessons + 0.1*attendance + 0.2*prev_grade + 0.1*time + noise
    predicted_grade = (
        0.4 * avg_assessment_score + 
        0.2 * lessons_completed + 
        10 * attendance_rate + 
        0.2 * previous_grade + 
        0.05 * time_spent_hours + 
        np.random.normal(0, 5, num_samples)
    )
    predicted_grade = np.clip(predicted_grade, 0, 100)
    
    df = pd.DataFrame({
        'lessons_completed': lessons_completed,
        'avg_assessment_score': avg_assessment_score,
        'time_spent_hours': time_spent_hours,
        'attendance_rate': attendance_rate,
        'previous_grade': previous_grade,
        'final_grade': predicted_grade
    })
    
    output_path = os.path.join(os.path.dirname(__file__), 'student_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated {num_samples} samples and saved to {output_path}")

if __name__ == "__main__":
    generate_synthetic_data()
