def optimize_energy(predicted_demand: float, solar_available: float):
    """
    Optimizes energy allocation between
    available solar energy and the electricity grid.
    """

    # Handle negative or invalid values
    predicted_demand = max(0, predicted_demand)
    solar_available = max(0, solar_available)

    # Use solar up to the predicted demand
    solar_used = min(predicted_demand, solar_available)

    # Remaining demand is supplied by the grid
    grid_required = predicted_demand - solar_used

    # Calculate percentages
    if predicted_demand > 0:
        solar_percentage = (solar_used / predicted_demand) * 100
        grid_percentage = (grid_required / predicted_demand) * 100
    else:
        solar_percentage = 0
        grid_percentage = 0

    return {
        "solar_used": round(solar_used, 2),
        "grid_required": round(grid_required, 2),
        "solar_percentage": round(solar_percentage, 2),
        "grid_percentage": round(grid_percentage, 2)
    }