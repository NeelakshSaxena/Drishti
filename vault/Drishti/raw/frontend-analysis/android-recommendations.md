# Android Adaptation Recommendations

## 1. Architecture Recommendations

### Recommended Android Architecture
- **MVVM** with ViewModels, LiveData/StateFlow
- **Repository pattern** for API + local data
- **Retrofit** for HTTP, **OkHttp** for WebSocket
- **Hilt** for DI
- **Navigation Component** for fragment navigation
- **MapLibre Android SDK** for maps (same engine as frontend)

## 2. Auth Implementation

### Must Match
- POST body format for `/family/parent/login`, `/family/child/login`, etc.
- Query parameter pattern: `?parent_id=X`, `?child_id=X`
- No `Authorization` header for family routes
- "Remember Me" → `EncryptedSharedPreferences` vs in-memory
- Session validation on app launch (same API calls as web)
- Stale session clearing → navigate to login

### SharedPreferences Keys
```
parent_id, parent_name          // Parent session
child_id, child_code, child_name // Child session
drishti.backendUrl              // Custom backend URL
```

## 3. API Client Configuration

### Base URL
```kotlin
val BASE_URL = BuildConfig.API_BASE_URL 
    ?: "https://drishti-walb.onrender.com"
```

### Retrofit Setup
- No auth interceptor needed for family routes
- Add `Content-Type: application/json` header
- Retry policy: 3 attempts, 1s delay (matches `API_CONFIG`)
- Timeout: 30s (matches `LOADING_TIMEOUT`)

## 4. Polling Implementation

| Endpoint | Interval | Android Mechanism |
|---|---|---|
| Parent dashboard | 5s | `repeatOnLifecycle` + `delay(5000)` |
| Guest view | 5s | Same |
| Child link check | 2s | Same |
| Location updates | Continuous | `FusedLocationProviderClient` |

## 5. Location Sharing

### Must Match
- POST to `/family/child/location?child_id={id}`
- Body: `{ "lat": float, "lon": float }` (not `lng`!)
- Stop: POST to `/family/child/stop-sharing?child_id={id}`

### Android Implementation
- `FusedLocationProviderClient` with high accuracy
- `LocationRequest` with 5s interval
- Foreground service for background tracking
- Runtime permission: `ACCESS_FINE_LOCATION`

## 6. Visual Alignment

### Color Palette (Material 3 / Custom)
```xml
<color name="background">#09090B</color>
<color name="surface">#0A0A0A</color>
<color name="surfaceVariant">#27272A</color>
<color name="onSurface">#FAFAFA</color>
<color name="onSurfaceVariant">#A1A1AA</color>
<color name="primary">#FAFAFA</color>
<color name="onPrimary">#171717</color>
<color name="statusLive">#34D399</color>
<color name="statusWarning">#FBBF24</color>
<color name="statusError">#F87171</color>
<color name="cardBorder">#27272A</color>
<color name="inputBackground">#18181B</color>
```

### Typography
- Font: Inter (bundle or Google Fonts dependency)
- Body: 14sp
- Label: 10sp, uppercase, letter-spacing 0.1em
- Title: 24sp, bold

### Corner Radius
- Cards: 12dp (matches `rounded-xl`)
- Buttons: 8dp (matches `rounded-md`)
- Inputs: 8dp
- Avatar: circular (50%)

## 7. Key Behavioral Differences

| Web Behavior | Android Adaptation |
|---|---|
| `localStorage` persists forever | `EncryptedSharedPreferences` |
| `sessionStorage` per-tab | ViewModel scope (cleared on Activity destroy) |
| `navigator.geolocation.watchPosition` | `FusedLocationProviderClient` |
| `navigator.clipboard.writeText` | `ClipboardManager` |
| `setInterval` polling | `CoroutineScope` + `repeatOnLifecycle` |
| CSS animations | `ObjectAnimator` / Lottie |
| `window.location.origin` | `BuildConfig.BASE_URL` |
| `router.push()` | `NavController.navigate()` |
| `router.back()` | `NavController.popBackStack()` |

## 8. Deep Linking

Support guest view via deep links:
```
https://drishti-app.com/guest/{token}
drishti://guest/{token}
```

## 9. Offline Behavior

- Cache last dashboard state in Room DB
- Show "Last updated: X" timestamp
- Queue location updates when offline
- Retry on connectivity restored
