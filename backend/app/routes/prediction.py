from fastapi import APIRouter, HTTPException

from app.schemas.prediction import PredictionRequest

from app.services.prediction_service import (
    get_all_predictions,
    select_best_model,
    label_encoders
)

from app.services.optimization_service import optimize_energy


# ==========================================
# CREATE ROUTER
# ==========================================

router = APIRouter(
    prefix="/predict",
    tags=["Energy Prediction"]
)


# ==========================================
# PREDICTION ENDPOINT
# ==========================================

@router.post("/")
def predict_energy(request: PredictionRequest):

    # ==========================================
    # 1. CONVERT REQUEST TO DICTIONARY
    # ==========================================

    input_data = request.model_dump()


    # ==========================================
    # 2. SEPARATE SOLAR DATA AND WEATHER
    # ==========================================

    solar_available = input_data.pop("solar_available")
    weather_condition = input_data.pop("weather_condition", None)

    # Defaults if missing
    default_air_temp = 20.0
    if input_data["airTemperature"] is None:
        input_data["airTemperature"] = default_air_temp

    # Map weather condition to cloud coverage and dew point if not provided
    if input_data["cloudCoverage"] is None:
        if weather_condition == "Sunny":
            input_data["cloudCoverage"] = 0.0
        elif weather_condition == "Partly Cloudy":
            input_data["cloudCoverage"] = 2.0
        elif weather_condition == "Cloudy":
            input_data["cloudCoverage"] = 6.0
        elif weather_condition == "Rainy":
            input_data["cloudCoverage"] = 8.0
        else:
            input_data["cloudCoverage"] = 2.0  # fallback

    if input_data["dewTemperature"] is None:
        # Crude estimation: dew point is lower than air temp, closer if rainy
        if weather_condition == "Rainy":
            input_data["dewTemperature"] = input_data["airTemperature"] - 1.0
        else:
            input_data["dewTemperature"] = input_data["airTemperature"] - 5.0
            
    if input_data["seaLvlPressure"] is None:
        input_data["seaLvlPressure"] = 1015.0
    if input_data["windDirection"] is None:
        input_data["windDirection"] = 180.0
    if input_data["windSpeed"] is None:
        input_data["windSpeed"] = 5.0


    # ==========================================
    # 3. ENCODE CATEGORICAL FEATURES SAFELY
    # ==========================================

    categorical_columns = [
        "building_id",
        "site_id",
        "primaryspaceusage"
    ]

    for column in categorical_columns:

        value = input_data[column]

        # Check whether the value exists in
        # the training dataset
        if value not in label_encoders[column].classes_:

            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Unknown categorical value",
                    "column": column,
                    "value": value,
                    "message": (
                        f"The value '{value}' for '{column}' "
                        "was not found in the training dataset."
                    )
                }
            )

        # Encode the categorical value
        input_data[column] = int(
            label_encoders[column]
            .transform([value])[0]
        )


    # ==========================================
    # 4. GET PREDICTIONS FROM ALL 3 MODELS
    # ==========================================

    try:

        predictions = get_all_predictions(
            input_data
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail={
                "error": "Prediction failed",
                "message": str(e)
            }
        )


    # ==========================================
    # 5. SELECT BEST MODEL
    # ==========================================

    model_decision = select_best_model(
        predictions
    )

    recommended_model = (
        model_decision["recommended_model"]
    )

    final_prediction = (
        model_decision["final_prediction"]
    )


    # ==========================================
    # 6. OPTIMIZE SOLAR + GRID ALLOCATION
    # ==========================================

    optimization = optimize_energy(
        predicted_demand=final_prediction,
        solar_available=solar_available
    )


    # ==========================================
    # 7. RETURN COMPLETE RESULT
    # ==========================================

    return {

        "status": "success",

        "predictions": {
            "random_forest": predictions[
                "random_forest"
            ],

            "xgboost": predictions[
                "xgboost"
            ],

            "lightgbm": predictions[
                "lightgbm"
            ]
        },

        "recommended_model": recommended_model,

        "model_metrics": model_decision["model_performance"],
        "all_model_metrics": model_decision["all_performances"],

        "final_predicted_demand": final_prediction,

        "solar_available": round(
            solar_available,
            2
        ),

        "optimization": {

            "solar_used": optimization[
                "solar_used"
            ],

            "grid_required": optimization[
                "grid_required"
            ],

            "solar_percentage": optimization[
                "solar_percentage"
            ],

            "grid_percentage": optimization[
                "grid_percentage"
            ]
        }
    }