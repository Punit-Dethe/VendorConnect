# 🗄️ VendorConnect Database Setup Guide

## 🚀 Quick Setup

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (with Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

### 2. Create Database
```bash
# Create database
createdb vendor_supplier_db

# Or using psql
psql -U postgres
CREATE DATABASE vendor_supplier_db;
\q
```

### 3. Configure Environment
```bash
# Copy environment template
cp packages/backend/.env.example packages/backend/.env

# Edit the .env file with your database credentials
```

### 4. Test Database Connection
```bash
cd packages/backend
node setup-database.js
```

### 5. Start the Enhanced Server
```bash
npm run dev
```

## 🌍 **New Features with Database Integration**

### ✅ **Database Persistence**
- All user registrations saved to PostgreSQL
- Real-time data synchronization
- Persistent product inventory
- Order history tracking

### ✅ **Region-wise Supplier Selection**
- Automatic location detection for cities
- Distance calculation between vendors and suppliers
- Region-based filtering and recommendations
- Nearby supplier discovery

### ✅ **Enhanced Location Features**
- **Auto-detect user region** from city/state
- **Calculate distances** using Haversine formula
- **Smart recommendations** based on proximity
- **Delivery time estimation** based on distance
- **Regional notifications** for new suppliers

## 📍 **Location-based Endpoints**

### **Get Suppliers by Region**
```bash
# Get suppliers in Mumbai
GET /api/suppliers?region=mumbai

# Get suppliers in specific city with distance limit
GET /api/suppliers?city=mumbai&maxDistance=25&userLat=19.0760&userLng=72.8777

# Get nearby suppliers (requires authentication)
GET /api/suppliers/nearby?maxDistance=20
Authorization: Bearer <token>
```

### **Registration with Location**
```bash
POST /api/auth/register
{
  "name": "New Supplier",
  "mobile": "9876543213",
  "password": "password123",
  "role": "supplier",
  "businessType": "Fruit Supplier",
  "address": "123 Market Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

## 🎯 **Complete Workflow**

### **1. New Supplier Registration**
- Supplier registers with location details
- System auto-detects coordinates for the city
- Nearby vendors (within 50km) get notified
- Supplier appears in vendor searches immediately

### **2. Vendor Supplier Discovery**
- Vendors can search by region/city
- System calculates distances to all suppliers
- Results sorted by proximity and trust score
- Delivery time estimated based on distance

### **3. Location-based Recommendations**
- Suppliers within 5km: "1-2 hours" delivery
- Suppliers within 15km: "2-4 hours" delivery  
- Suppliers beyond 15km: "4-6 hours" delivery
- "Nearby" badge for suppliers within 20km

## 🗄️ **Database Schema**

### **Users Table**
```sql
- id (Primary Key)
- mobile (Unique)
- name, email, password
- role (vendor/supplier)
- business_type, address, city, state, pincode
- latitude, longitude (Auto-calculated)
- trust_score (Default: 50)
- created_at, updated_at
```

### **Products Table**
```sql
- id (Primary Key)
- supplier_id (Foreign Key)
- name, description, category, unit
- price_per_unit, stock_quantity, minimum_stock
- image_url, is_active
- created_at, updated_at
```

### **Orders, Contracts, Payments, Notifications Tables**
- Complete order lifecycle tracking
- Digital contract management
- Payment processing records
- Real-time notification system

## 🌟 **Supported Indian Cities**

The system includes coordinates for major Indian cities:
- Mumbai, Delhi, Bangalore, Hyderabad
- Chennai, Kolkata, Pune, Ahmedabad
- Jaipur, Surat, Lucknow, Kanpur
- And many more...

## 🔧 **Troubleshooting**

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check database exists
psql -U postgres -l
```

### Environment Configuration
```bash
# Make sure .env file exists
ls packages/backend/.env

# Check database credentials
psql -U postgres -d vendor_supplier_db -c "SELECT NOW();"
```

## 🚀 **Production Deployment**

### Database Setup
1. Set up PostgreSQL on your server
2. Configure environment variables
3. Run database initialization
4. Set up SSL certificates

### Location Services
- Integrate with Google Maps API for better geocoding
- Add real-time location tracking
- Implement route optimization

---

**Your VendorConnect platform now has full database integration with region-wise supplier selection!** 🇮🇳✨