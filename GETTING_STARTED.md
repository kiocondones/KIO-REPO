# Getting Started with GOLI

GOLI is a service desk management system with a Flask backend and three React frontends.

## Prerequisites

- **Python 3.9+** - [Download](https://www.python.org/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://www.mysql.com/downloads/)

Check installation:
```bash
python --version
node --version
mysql --version
```

## Database Setup

Before running the backend, set up the MySQL database:

1. **Create database**: Open MySQL and run:
   ```sql
   CREATE DATABASE goli_unified;
   ```

2. **Import schema**: Use your database copy's schema.sql file:
   ```bash
   mysql -u root -p goli_unified < path/to/schema.sql
   ```

3. **Configure connection** (if different from defaults):
   - Create `backend/.env` from `backend/.env.example`
   - Update database credentials if needed

## Quick Setup

### 1. Backend (Terminal 1)

```bash
# Create virtual environment (first time only)
python -m venv .venv

# Activate it
.venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Run server
python app.py
```
✓ Backend runs at `http://localhost:5000`

**Note:** Backend uses default DB credentials. If different, create `backend/.env` from `backend/.env.example`

### 2. Requestor App (Terminal 2)

```bash
cd requestor-app
npm install
npm run dev
```
✓ Available at `http://localhost:5173`

### 3. Servicedesk App (Terminal 3)

```bash
cd servicedesk-app
npm install
npm run dev
```
✓ Available at `http://localhost:5174`

### 4. Technician App (Terminal 4)

```bash
cd technician-app
npm install
npm run dev
```
✓ Available at `http://localhost:5175`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Virtual environment won't activate | Make sure you're in the project root |
| "pip: command not found" | Activate virtual environment first |
| Port 5000 already in use (OSError 10048) | Kill existing process: `Get-NetTCPConnection -LocalPort 5000 \| Stop-Process -Force` then restart backend |
| Backend won't connect to DB | Check `backend/.env` credentials and ensure MySQL is running |
| Frontend shows blank page | Ensure backend is running on port 5000 (test with `curl http://127.0.0.1:5000/api/health`) |
| After code updates, run DB migration | `flask db upgrade head` to apply latest schema changes |

## Running Later

```bash
# Activate environment
.venv\Scripts\activate

# Terminal 1: Backend
python backend/app.py

# Terminal 2: Requestor
cd requestor-app && npm run dev

# Terminal 3: Servicedesk
cd servicedesk-app && npm run dev

# Terminal 4: Technician
cd technician-app && npm run dev
```
