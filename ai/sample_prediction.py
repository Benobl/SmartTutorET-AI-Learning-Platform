import joblib
import pandas as pd
import os

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'performance_model.joblib')
model = joblib.load(MODEL_PATH)

# Sample student data from Kaggle features
# Features: ['StudyTimeWeekly', 'Absences', 'Tutoring', 'ParentalSupport', 'Extracurricular']
sample_data = pd.DataFrame([{
    'StudyTimeWeekly': 15.5,
    'Absences': 2,
    'Tutoring': 1,
    'ParentalSupport': 3,
    'Extracurricular': 1
}])

# Predict
prediction = model.predict(sample_data)[0]

print("--- AI PERFORMANCE PREDICTION (KAGGLE MODEL) ---")
print(f"Student Profile:")
print(f"  - Weekly Study Time: 15.5 hours")
print(f"  - Absences: 2")
print(f"  - Tutoring: Yes")
print(f"  - Parental Support: High (3/4)")
print(f"  - Extracurriculars: Yes")
print("-" * 40)
print(f"AI PREDICTED GPA: {prediction:.2f}")
print("-" * 40)

# Recommendation Logic
if prediction > 3.5:
    print("AI RECOMMENDATION: Excellent! The student is maintaining a top-tier GPA. Suggest advanced placement courses.")
elif prediction > 2.5:
    print("AI RECOMMENDATION: Good standing. To reach a 3.5+ GPA, focus on zero absences and increasing study time slightly.")
else:
    print("AI RECOMMENDATION: Warning. GPA is below 2.5. Immediate intervention with tutoring and parental consultation recommended.")
