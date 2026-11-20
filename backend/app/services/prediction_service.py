from pathlib import Path
import joblib


# ==========================================
# PROJECT PATHS
# ==========================================

# Project root:
# AIRenewableEnergyOptimization/
BASE_DIR = Path(__file__).resolve().parents[3]

# Models directory
MODELS_DIR = BASE_DIR / "models"


# ==========================================
# LOAD TRAINED MODELS
# ==========================================

rf_model = joblib.load(
    MODELS_DIR / "random_forest_model.pkl"
)

xgb_model = joblib.load(
    MODELS_DIR / "xgboost_model.pkl"
)

lgb_model = joblib.load(
    MODELS_DIR / "lightgbm_model.pkl"
)


# ==========================================
# LOAD PREPROCESSING FILES
# ==========================================

feature_columns = joblib.load(
    MODELS_DIR / "feature_columns.pkl"
)

label_encoders = joblib.load(
    MODELS_DIR / "label_encoders.pkl"
)


print("All ML models loaded successfully!")
print("Number of features:", len(feature_columns))
import pandas as pd


def get_all_predictions(input_data: dict):
    """
    Takes input data and generates predictions
    from Random Forest, XGBoost, and LightGBM.
    """

    # Convert input dictionary into DataFrame
    input_df = pd.DataFrame([input_data])

    # Ensure feature order matches training data
    input_df = input_df[feature_columns]

    # Generate predictions
    rf_prediction = float(
        rf_model.predict(input_df)[0]
    )

    xgb_prediction = float(
        xgb_model.predict(input_df)[0]
    )

    lgb_prediction = float(
        lgb_model.predict(input_df)[0]
    )

    # Return all predictions
    return {
        "random_forest": round(rf_prediction, 2),
        "xgboost": round(xgb_prediction, 2),
        "lightgbm": round(lgb_prediction, 2)
    }
def select_best_model(predictions: dict):
    """
    Selects the best model based on
    the evaluation metrics obtained during training.
    """

    model_performance = {
        "random_forest": {
            "mae": 16.001618,
            "rmse": 43.728307,
            "r2": 0.970945
        },
        "xgboost": {
            "mae": 24.017571,
            "rmse": 52.541599,
            "r2": 0.958053
        },
        "lightgbm": {
            "mae": 48.715140,
            "rmse": 86.676733,
            "r2": 0.885845
        }
    }

    # Select model with the highest R2, then lowest RMSE, then lowest MAE
    best_model = max(
        model_performance,
        key=lambda model: (
            model_performance[model]["r2"],
            -model_performance[model]["rmse"],
            -model_performance[model]["mae"]
        )
    )

    return {
        "recommended_model": best_model,
        "final_prediction": predictions[best_model],
        "model_performance": model_performance[best_model],
        "all_performances": model_performance
    }