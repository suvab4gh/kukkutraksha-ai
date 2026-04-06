# Development History

This document tracks all development work, technical decisions, and changes made throughout the project lifecycle.

## Project Overview

**Goal**: Build a full-stack IoT-based poultry disease monitoring system for West Bengal farms using ESP32 sensors, MQTT, and real-time analytics.

**Timeline**: October 2024 - October 2025

---

## Phase 1: Initial Setup (Oct 2024)

### Architecture Decisions
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Backend**: Node.js 25 + Express (ES Modules)
- **Database**: Supabase PostgreSQL (Primary Database)
- **Authentication**: Supabase Auth
- **MQTT Broker**: HiveMQ Cloud
- **Maps**: Leaflet.js + OpenStreetMap

### Tech Stack Upgrades
- Upgraded to October 2025 versions:
  - Next.js 16.0.0
  - React 19.2.0
  - Node.js 25.0.0
  - TailwindCSS 4.1.16
  - TypeScript 5.9.3

---

## Phase 2: Authentication System

### Authentication Evolution
- Initial system built with Supabase Auth
- Real ID/Aadhaar-based registration for farmers
- JWT-based token verification

### Supabase Integration
**Reason**: Modern, open-source, PostgreSQL-based platform

**Implementation**:
1. Installed @supabase/supabase-js
2. Created `lib/supabase.ts` client configuration
3. Implemented authentication flow:
   - `supabase.auth.signInWithPassword()`
   - `supabase.auth.signUp()`
   - Supabase JWT session tokens
4. Created PostgreSQL schema with profiles, farms tables
5. Implemented Row-Level Security (RLS) policies
6. Auto-profile creation trigger on signup

**Benefits**:
- Clean codebase architecture
- Simplified deployment
- PostgreSQL database with full relational features
- Better privacy and data control

---

## Phase 3: Farmer Dashboard

### Core Features
1. **Real-time Sensor Monitoring**
   - 5 sensor cards: Ammonia, CO₂, Temperature, TDS, Humidity
   - Color-coded risk indicators (Green/Yellow/Red)
   - WebSocket integration for live updates

2. **Visualization**
   - 15-zone disease heatmap (A-O grid layout)
   - Individual sensor trend cards with 24-hour graphs
   - Interactive Leaflet map for farm location

3. **Sensor Health System** (iPhone-style)
   - Created `SensorHealthPanel` component
   - Health percentage (0-100%) for each sensor
   - Status: Working / Pending Update / Not Working
   - Battery level, signal strength, calibration status

### UI/UX Improvements
1. **Farmer Bio Card**
   - Compact profile card above alerts
   - Owner details, farm info, verification status
   - Masked Aadhaar (XXXX XXXX 1234)
   - License status badges (Active/Expired/Pending)

2. **Input Visibility Fix**
   - Added `text-gray-900` class to all inputs
   - Prevents white-on-white text issue

3. **Password Toggle**
   - Eye/EyeOff icons from lucide-react
   - Show/hide password during registration

### Layout Restructuring (Latest)
**User Request**: Prioritize sensor data at top, move nearby farms map to bottom

**New Layout Order**:
1. Sensor Health Panel (iPhone-style)
2. Real-time Sensor Cards (with gradient backgrounds)
3. Sensor Health Monitoring Grid
4. 15-Zone Disease Heatmap
5. Sensor Trends (24-hour graphs)
6. Farmer Bio + Alerts (sidebar)
7. Nearby Farms Map (moved to bottom)

**Visual Enhancements**:
- Gradient backgrounds on sensor cards (red/yellow/green)
- Vertical gradient bar indicator
- Health percentage display
- "HiveMQ Connected" badge

---

## Phase 4: Admin Dashboard

### Core Features
1. **District-Level Map**
   - All West Bengal farms displayed as pins
   - Color-coded by status (Green/Yellow/Red)
   - Custom pin icons with pulsing animation for critical farms

2. **Enhanced Map Features** (Google Maps-style)
   - Pin popups with comprehensive farm owner details
   - Action buttons: Call, Alert, View Details
   - postMessage API for cross-frame communication
   - Enhanced legend with farm counts

3. **Farm Owner Directory**
   - Created `FarmOwnerList` component (359 lines)
   - Search by name, district, email, owner
   - Status filter (All/Safe/Warning/Critical)
   - Sort by (Name/Status/District)
   - Expandable farm cards with verification details
   - Quick action buttons (Call, Alert, View Dashboard, Open in Maps)

4. **Emergency Alert System**
   - Modal dialog for sending critical alerts
   - Custom message textarea
   - Integrates with `/api/alerts/emergency` endpoint
   - Real-time alert display in Critical Alerts section

### Layout Structure
1. Statistics Cards (Total, Active, Critical, Warning, Safe)
2. District Filter Dropdown
3. Interactive Map (full-width, 600px height)
4. Farm Owners Directory (searchable, filterable)
5. Critical Alerts + Farm Status Summary (2-column)

---

## Phase 5: Backend Architecture

### Database Strategy
**Database Architecture**:
- **Supabase PostgreSQL**: All application data (users, farms, sensors, alerts)

### Authentication Middleware
**File**: `backend/middleware/auth.js`

**Implementation (Supabase)**:
```javascript
const decodedToken = await admin.auth().verifyIdToken(idToken);
req.user = decodedToken;
```

**New (Supabase)**:
```javascript
const { data: { user } } = await supabase.auth.getUser(token);
req.user = { uid: user.id, email: user.email, role: user.user_metadata?.role };
```

### MQTT Integration
- HiveMQ Cloud broker
- Topic: `poultry/sensors/#`
- Payload format: JSON with ammonia, co2, temperature, tds, humidity
- Real-time data storage in Supabase PostgreSQL

### WebSocket Service
- Broadcasts sensor updates to connected clients
- Alert notifications
- Farm status changes

---

## Phase 6: Data Model Design

### Supabase Schema

#### profiles
```sql
- id (UUID, FK to auth.users)
- email (TEXT, unique)
- role (TEXT: 'farmer' | 'admin' | 'field_worker')
- created_at (TIMESTAMPTZ)
```

#### farms
```sql
- id (UUID, primary key)
- user_id (UUID, FK to auth.users)
- farm_name (TEXT)
- owner_name (TEXT)
- phone (TEXT)
- district (TEXT)
- location (GEOGRAPHY POINT)
- farm_type (TEXT: 'Broiler' | 'Layer' | 'Mixed')
- aadhaar_number (TEXT, encrypted)
- pan_card (TEXT)
- license_status (TEXT: 'Active' | 'Expired' | 'Pending')
- poultry_farm_id (TEXT, unique)
- current_status (TEXT: 'safe' | 'warning' | 'critical')
- created_at (TIMESTAMPTZ)
```

### Supabase Tables

#### sensor_data
```javascript
{
  farmId: ObjectId,
  zone: String (A-O),
  ammonia: Number,
  co2: Number,
  temperature: Number,
  tds: Number,
  humidity: Number,
  timestamp: Date,
  deviceId: String
}
```

#### alerts
```javascript
{
  farmId: ObjectId,
  severity: String ('info' | 'warning' | 'critical'),
  message: String,
  type: String,
  isRead: Boolean,
  isResolved: Boolean,
  createdAt: Date
}
```

---

## Phase 7: Component Architecture

### Key Components Created

1. **SensorCard** (Enhanced)
   - Gradient backgrounds based on risk level
   - Vertical gradient bar indicator
   - Health percentage display
   - File: `components/SensorCard.tsx`

2. **SensorHealthPanel**
   - iPhone-style health monitoring
   - Overall sensor health percentage
   - Battery, signal, uptime metrics
   - File: `components/SensorHealthPanel.tsx`

3. **SensorHealthMonitor**
   - Grid view of all sensors
   - Working/Pending Update/Not Working status
   - Edit sensor details, add notes
   - File: `components/SensorHealthMonitor.tsx`

4. **FarmerBioCard**
   - Compact farmer profile
   - Masked Aadhaar with reveal option
   - License status badges
   - File: `components/FarmerBioCard.tsx`

5. **AdminMap** (Enhanced)
   - Google Maps-style pins
   - Pulsing animation for critical farms
   - Rich popups with action buttons
   - File: `components/AdminMap.tsx`

6. **FarmOwnerList**
   - Comprehensive farm directory
   - Search, filter, sort functionality
   - Expandable details
   - File: `components/FarmOwnerList.tsx`

7. **SensorZoneHeatmap**
   - 15-zone grid (A-O)
   - Color-coded risk visualization
   - Zone-specific metrics
   - File: `components/SensorZoneHeatmap.tsx`

---

## Phase 8: Cleanup & Optimization (Current)

### Documentation Cleanup
**Removed Files**:
- ARCHITECTURE.md
- BYPASS_LOGIN.md
- CHECKLIST.md
- FIREBASE_SETUP.md
- GITHUB_SETUP.md
- PROJECT_SUMMARY.md
- QUICK_ACCESS.md
- SENSOR_TRENDS_UPDATE.md
- SETUP_GUIDE.md
- SUPABASE_SETUP.md
- TEST_DATA.md
- VISUAL_CHANGES_GUIDE.md
- WHAT_YOU_WILL_SEE.md

**Kept Files**:
- README.md (comprehensive setup guide)
- DEVELOPMENT.md (this file - work history)

### Backend Configuration
**Changes**:
1. Implemented Supabase Auth middleware
2. Created `backend/config/supabase.js`
3. Updated `backend/middleware/auth.js`
4. Added Supabase credentials to `backend/.env`

### Mock Data Removal (In Progress)
**Target**: Remove all test/mock data from farmer dashboard

**Mock Data Locations**:
- `generateMockZoneData()` function
- `initializeMockSensorData()` function
- Hardcoded farmer bio data ('Rajesh Kumar', '123456789012')

**Plan**: Replace with real API calls to backend

---

## Technical Decisions & Rationale

### Why Supabase?
1. **Cost**: More affordable at scale
2. **Database**: PostgreSQL for all data types
3. **Open Source**: Can self-host if needed
4. **Privacy**: All data under our control
5. **Simplicity**: Single platform for auth + database
6. **Deployment**: Easy configuration
4. **Aggregation**: Powerful for analytics

### Database Architecture
- **Supabase PostgreSQL**: Primary database for all data (users, farms, sensors, time-series data)
- **Benefits**: Single source of truth, simplified data management, built-in real-time features

### Why Leaflet over Google Maps?
1. **Cost**: Free and open-source
2. **Customization**: Full control over styling
3. **Privacy**: No tracking, GDPR-compliant
4. **Performance**: Lighter than Google Maps

---

## Current State (October 2025)

### Working Features
✅ Supabase authentication (login/register)
✅ Farmer dashboard with sensor monitoring
✅ Admin dashboard with farm directory
✅ Real-time WebSocket updates
✅ MQTT sensor data ingestion
✅ Interactive maps with custom pins
✅ Emergency alert system
✅ Sensor health monitoring
✅ Disease detection algorithms
✅ Gradient-based risk visualization

### In Progress
🔄 Removing mock data from farmer dashboard
🔄 Backend Supabase integration completion
🔄 API endpoint optimization

### Pending
⏳ ESP32 firmware development
⏳ Production deployment (Vercel + Railway)
⏳ HiveMQ broker configuration
⏳ Performance testing
⏳ Security audit

---

## Code Quality Improvements

### TypeScript Coverage
- 100% TypeScript in frontend
- ES Modules in backend (Node.js 25)
- Proper interface definitions
- Type-safe API calls

### Component Design
- Single Responsibility Principle
- Reusable, composable components
- Props interfaces for all components
- Consistent naming conventions

### State Management
- Zustand for global auth state
- Local state for component-specific data
- Proper cleanup in useEffect hooks

### Error Handling
- Try-catch blocks in all async functions
- User-friendly error messages
- Console logging for debugging
- Fallback UI for errors

---

## Performance Optimizations

1. **Dynamic Imports**
   - AdminMap: `dynamic(() => import(...), { ssr: false })`
   - FarmMap: Same approach
   - Prevents Leaflet SSR issues

2. **Data Fetching**
   - Parallel API calls where possible
   - Pagination for large datasets
   - Caching with proper invalidation

3. **Rendering**
   - Conditional rendering to reduce DOM nodes
   - Memoization for expensive calculations
   - Lazy loading for images/maps

4. **Bundle Size**
   - Tree-shaking enabled
   - Code splitting by route
   - Minimal dependencies

---

## Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Secure token storage (httpOnly cookies for production)
   - Role-based access control (RBAC)

2. **Data Protection**
   - Aadhaar masking (XXXX XXXX 1234)
   - Row-Level Security in Supabase
   - Environment variables for sensitive data

3. **API Security**
   - Token verification middleware
   - CORS configuration
   - Rate limiting (to be implemented)

4. **Input Validation**
   - Email format validation
   - Password strength requirements
   - SQL injection prevention (parameterized queries)

---

## Deployment Strategy

### Frontend (Vercel)
- Automatic deployments from main branch
- Environment variables configured in dashboard
- Preview deployments for PRs
- Edge functions for API routes

### Backend (Railway/Render)
- Docker container deployment
- Environment variables management
- Auto-scaling based on load
- Health check endpoints

### Database
- **Supabase**: Managed PostgreSQL, automatic backups, real-time subscriptions

### MQTT Broker
- HiveMQ Cloud managed service
- TLS/SSL encryption
- Username/password authentication

---

## Lessons Learned

1. **Supabase Platform**: Comprehensive auth and database solution
2. **PostgreSQL for IoT**: Excellent for structured and time-series data
3. **Mock Data Removal**: Should be done earlier in development
4. **Component Structure**: Early planning prevents refactoring
5. **Documentation**: Single DEVELOPMENT.md better than multiple .md files
6. **Type Safety**: TypeScript catches bugs early
7. **Testing**: Need to implement automated tests
8. **Performance**: Dynamic imports essential for Leaflet

---

## Future Roadmap

### Short Term
1. Complete mock data removal
2. Implement automated tests (Jest + React Testing Library)
3. Add loading skeletons for better UX
4. Implement rate limiting on API
5. Add data export functionality (CSV/Excel)

### Medium Term
1. Mobile app (React Native)
2. Push notifications (FCM)
3. Machine learning for disease prediction
4. Historical data analytics dashboard
5. Bulk sensor management
6. Email notifications for critical alerts

### Long Term
1. Multi-state expansion (beyond West Bengal)
2. Integration with government databases
3. Veterinary consultation system
4. Supply chain management
5. Marketplace for poultry products
6. AI-powered recommendations

---

## Contributors

- **Lead Developer**: Suvab Ghosh (suvab4gh)
- **Architecture**: Full-stack design
- **Frontend**: Next.js + React + TypeScript
- **Backend**: Node.js + Express + Supabase
- **DevOps**: Git, GitHub, Vercel, Railway

---

## References

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [HiveMQ Docs](https://docs.hivemq.com/)
- [Leaflet Docs](https://leafletjs.com/reference.html)

### Tools
- VS Code with GitHub Copilot
- Supabase Studio
- Postman (API testing)
- Git/GitHub

---

**Last Updated**: October 25, 2025

**Status**: Active Development

**Version**: 1.0.0-beta
