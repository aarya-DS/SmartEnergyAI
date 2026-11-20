from pydantic import BaseModel


from typing import Optional

class PredictionRequest(BaseModel):
    # Categorical features
    building_id: str
    site_id: str
    primaryspaceusage: str

    # Building information
    sqm: float

    # Weather information (now optional)
    weather_condition: Optional[str] = None
    airTemperature: Optional[float] = None
    cloudCoverage: Optional[float] = None
    dewTemperature: Optional[float] = None
    seaLvlPressure: Optional[float] = None
    windDirection: Optional[float] = None
    windSpeed: Optional[float] = None

    # Time information
    hour: int
    day_of_week: int
    month: int
    day: int
    year: int
    is_weekend: int

    # Available solar generation
    solar_available: float