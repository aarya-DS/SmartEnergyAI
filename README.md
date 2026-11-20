# AI Renewable Energy Optimization for Smart Buildings

An intelligent web platform and machine learning system designed to predict commercial building energy consumption, optimize solar PV self-consumption, and reduce carbon emissions and electricity utility costs.

---

## 🌟 Key Features

- **Energy Demand Forecasting**: Machine learning ensemble models (Random Forest, XGBoost, LightGBM) trained on ASHRAE building telemetry and weather data.
- **Solar PV Dispatch Optimization**: Dynamic calculation of solar power self-consumption, grid energy reliance, and battery discharge opportunities.
- **Interactive Web Dashboard**: React single-page application featuring telemetry monitoring, diurnal load curves, solar generation curves, and dynamic building metrics.
- **RESTful API Backend**: High-performance FastAPI server providing asynchronous prediction endpoints and building portfolio management.
- **Multi-Tenant Authentication**: SQLite/SQL-based authentication with bcrypt password hashing and JWT token management.

---

## 🏗️ System Architecture

```
AIRenewableEnergyOptimization/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint & CORS configuration
│   │   ├── database.py       # SQLite engine & User schema
│   │   ├── routes/           # Auth, Buildings & Prediction routes
│   │   ├── services/         # ML inference & optimization logic
│   │   └── schemas/          # Pydantic request/response models
│   └── requirements.txt      # Python backend dependencies
├── frontend/                 # React SPA Dashboard
│   ├── src/
│   │   ├── pages/            # Landing, Dashboard, Analytics, MyBuildings, Auth
│   │   ├── components/       # EnergyOptimization, Charts, PredictionForm
│   │   └── services/api.js   # Axios client for backend endpoints
│   └── package.json          # Frontend dependencies
├── models/                   # Serialized ML model artifacts & encoders
│   ├── xgboost_model.pkl
│   ├── lightgbm_model.pkl
│   ├── feature_columns.pkl
│   └── label_encoders.pkl
├── data/raw/                 # Metadata and weather datasets
├── notebooks/                # Exploratory Data Analysis & training experiments
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: 3.9+ installed
- **Node.js**: v16+ and npm installed
- **Git**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```
Backend API will run at `http://localhost:8000` (Interactive docs at `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start development server
npm start
```
Frontend will run at `http://localhost:3000`.

---

## 📊 Machine Learning Pipeline

- **Dataset**: Building Data Genome Project 2 (BDG2) / ASHRAE Great Energy Predictor III.
- **Preprocessing**: Imputation, cyclic temporal feature engineering (hour of day, day of week, month), and one-hot/label encoding for building primary use categories.
- **Models**:
  - **Random Forest**: Top performance baseline for non-linear feature interactions.
  - **XGBoost**: Gradient-boosted decision trees for fast inference.
  - **LightGBM**: Highly optimized, lightweight gradient boosting.
- **Evaluation Metrics**: $R^2$ Score, Root Mean Squared Error (RMSE), and Mean Absolute Error (MAE).

---

## 👥 Authors & Acknowledgments

- **Team 11**: AI Renewable Energy Optimization for Smart Buildings
