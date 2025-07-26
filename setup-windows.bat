@echo off
echo Setting up VendorConnect platform for Windows...
echo.

echo 1. Installing root dependencies...
call npm install
if %errorlevel% neq 0 goto :error

echo.
echo 2. Building shared package...
cd packages\shared
call npm run build
if %errorlevel% neq 0 goto :error
cd ..\..

echo.
echo 3. Installing backend dependencies...
cd packages\backend
call npm install
if %errorlevel% neq 0 goto :error
cd ..\..

echo.
echo 4. Installing frontend dependencies...
cd packages\frontend
call npm install
if %errorlevel% neq 0 goto :error
cd ..\..

echo.
echo 5. Creating environment file...
if not exist "packages\backend\.env" (
    copy "packages\backend\.env.example" "packages\backend\.env"
    echo Created backend .env file
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Install PostgreSQL and Redis manually, or
echo 2. Install Docker Desktop and run: docker-compose up -d
echo 3. Start the application:
echo    - Backend: cd packages\backend ^&^& npm run dev
echo    - Frontend: cd packages\frontend ^&^& npm run dev
echo.
goto :end

:error
echo.
echo Error occurred during setup!
exit /b 1

:end
pause