# Google Maps API Setup Guide

## Overview

This guide explains how to set up Google Maps Distance Matrix API for ambulance distance calculation in the RSUM system.

## Why Google Maps API?

✅ **Accurate Distance** - Real road distance, not straight line  
✅ **Automatic Calculation** - No manual measurement needed  
✅ **Audit Trail** - Google Maps URL stored for verification  
✅ **Professional** - Industry-standard solution  
✅ **Cost-Effective** - Free tier covers typical hospital usage  

---

## Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "RSUM-Hospital-System"
4. Click "Create"
5. Wait for project creation (30 seconds)

### Step 2: Enable Distance Matrix API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Distance Matrix API"
3. Click on "Distance Matrix API"
4. Click **"Enable"** button
5. Wait for API to be enabled

### Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the API key (looks like: `AIzaSyB...`)
4. Click **"Restrict Key"** (recommended for security)

### Step 4: Restrict API Key (Security)

**Application Restrictions:**
1. Select **"HTTP referrers (web sites)"**
2. Add your domains:
   ```
   http://localhost:3000/*
   https://yourdomain.com/*
   ```

**API Restrictions:**
1. Select **"Restrict key"**
2. Select **"Distance Matrix API"**
3. Click **"Save"**

### Step 5: Add to Environment Variables

1. Create file `.env.local` in project root (if not exists)
2. Add the API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB...your_actual_key_here
   ```
3. **Important:** Never commit `.env.local` to Git!
4. Restart your development server

### Step 6: Verify Setup

1. Restart dev server: `npm run dev`
2. Go to `/prices`
3. Select "11. AMBULANCE"
4. Try adding ambulance service in visit editor
5. Test distance calculation

---

## Pricing & Quotas

### Distance Matrix API Costs

| Usage | Cost | Free Tier |
|-------|------|-----------|
| 0-100,000 requests/month | $5 per 1,000 | First $200/month free |
| Typical hospital usage | ~50-100 requests/month | **$0** (within free tier) |

### Free Tier Details

- **$200 free credit** per month
- Covers **40,000 requests** per month
- Typical hospital: **50-100 requests/month**
- **Estimated cost: $0/month** ✅

### Billing Setup (Recommended)

1. Go to **Billing** in Google Cloud Console
2. Set up billing account (credit card required)
3. Set **budget alerts** at $10, $50, $100
4. Enable **quota limits** to prevent overuse
5. Monitor usage monthly

**Note:** Even with billing enabled, you likely won't be charged due to free tier.

---

## Security Best Practices

### 1. API Key Restrictions

✅ **DO:**
- Restrict to specific domains
- Restrict to specific APIs
- Use separate keys for dev/prod
- Rotate keys periodically

❌ **DON'T:**
- Commit API keys to Git
- Share keys publicly
- Use unrestricted keys
- Reuse keys across projects

### 2. Environment Variables

**File: `.env.local`**
```bash
# ✅ GOOD - In .env.local (not committed)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyB...

# ❌ BAD - In code (committed to Git)
const API_KEY = 'AIzaSyB...';
```

### 3. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Example: Limit to 100 requests per day per user
const DAILY_LIMIT = 100;
let requestCount = 0;
let lastResetDate = new Date().toDateString();

function checkRateLimit() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    requestCount = 0;
    lastResetDate = today;
  }
  
  if (requestCount >= DAILY_LIMIT) {
    throw new Error('Daily API limit reached');
  }
  
  requestCount++;
}
```

### 4. Input Validation

Always validate user input before API calls:

```typescript
if (!validateAddress(pickupLocation)) {
  alert('Alamat tidak valid. Minimal 5 karakter.');
  return;
}
```

---

## Usage in Application

### In Visit Editor

```typescript
import { calculateDistance, getHospitalAddress } from '@/lib/googleMaps';

// User enters pickup location
const pickupLocation = 'Jl. Sudirman No. 45, Ponorogo';

// Calculate distance
const result = await calculateDistance(
  pickupLocation,
  getHospitalAddress()
);

if (result.status === 'success') {
  // Use distance for pricing
  setAmbulanceForm({
    ...ambulanceForm,
    oneWayKm: result.distanceKm,
    googleMapsUrl: result.mapsUrl,
  });
  
  // Calculate cost
  const tariff = calculateAmbulanceTariff({
    vehicleType: 'GRANDMAX',
    serviceType: 'PASIEN',
    oneWayKm: result.distanceKm,
    googleMapsUrl: result.mapsUrl,
  });
  
  console.log(`Distance: ${result.distanceKm} km`);
  console.log(`Cost: Rp ${tariff.total.toLocaleString()}`);
} else {
  // Handle error - show manual input
  alert(result.errorMessage);
}
```

---

## API Response Examples

### Successful Response

```json
{
  "status": "OK",
  "origin_addresses": ["Jl. Sudirman No. 45, Ponorogo, Jawa Timur, Indonesia"],
  "destination_addresses": ["RS UNIPDU Medika, Ponorogo, Jawa Timur, Indonesia"],
  "rows": [
    {
      "elements": [
        {
          "status": "OK",
          "distance": {
            "text": "5.3 km",
            "value": 5300
          },
          "duration": {
            "text": "12 menit",
            "value": 720
          }
        }
      ]
    }
  ]
}
```

### Error Response

```json
{
  "status": "ZERO_RESULTS",
  "error_message": "No route could be found between the origin and destination."
}
```

---

## Troubleshooting

### Issue: "API key not configured"

**Solution:**
1. Check `.env.local` file exists
2. Verify variable name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Restart development server
4. Clear browser cache

### Issue: "REQUEST_DENIED"

**Possible causes:**
- API not enabled in Google Cloud Console
- API key restrictions too strict
- Billing not enabled (if over free tier)

**Solution:**
1. Enable Distance Matrix API
2. Check API key restrictions
3. Verify domain is whitelisted
4. Enable billing (with alerts)

### Issue: "ZERO_RESULTS"

**Possible causes:**
- Invalid address
- Address not found
- No route available

**Solution:**
1. Verify address format
2. Add city name (e.g., ", Ponorogo")
3. Use more specific address
4. Offer manual distance input as fallback

### Issue: "OVER_QUERY_LIMIT"

**Possible causes:**
- Exceeded daily quota
- Too many requests per second
- Billing not enabled

**Solution:**
1. Check quota in Google Cloud Console
2. Enable billing
3. Implement rate limiting
4. Cache common routes

### Issue: Distance seems wrong

**Possible causes:**
- Wrong route selected by Google
- Traffic/construction
- Multiple routes available

**Solution:**
1. Check Google Maps URL in metadata
2. Verify route visually
3. Use manual override if needed
4. Add notes to service

---

## Testing

### Test Cases

1. **Valid Address (Same City)**
   ```
   Origin: "Jl. Sudirman No. 45, Ponorogo"
   Destination: "RS UNIPDU Medika, Ponorogo"
   Expected: ~5 km, success
   ```

2. **Valid Address (Different City)**
   ```
   Origin: "Jl. Merdeka No. 10, Madiun"
   Destination: "RS UNIPDU Medika, Ponorogo"
   Expected: ~40 km, success
   ```

3. **Incomplete Address**
   ```
   Origin: "Jl. Sudirman"
   Destination: "RS UNIPDU Medika, Ponorogo"
   Expected: May work or may need city
   ```

4. **Invalid Address**
   ```
   Origin: "asdfghjkl"
   Destination: "RS UNIPDU Medika, Ponorogo"
   Expected: ZERO_RESULTS error
   ```

5. **Very Long Distance**
   ```
   Origin: "Jakarta"
   Destination: "RS UNIPDU Medika, Ponorogo"
   Expected: ~800 km, success
   ```

### Manual Testing Checklist

- [ ] API key configured in `.env.local`
- [ ] Server restarted after adding key
- [ ] Test with valid address
- [ ] Verify distance accuracy
- [ ] Check Google Maps URL
- [ ] Test with invalid address
- [ ] Verify error handling
- [ ] Test manual distance input fallback
- [ ] Check metadata storage in Firestore
- [ ] Verify invoice displays correctly

---

## Cost Monitoring

### Google Cloud Console

1. Go to **Billing** → **Reports**
2. Filter by **Distance Matrix API**
3. View usage by day/month
4. Set up alerts for unusual usage

### Expected Usage

**Typical Hospital:**
- Ambulance services per day: 1-3
- API calls per day: 1-3
- API calls per month: 30-90
- **Cost per month: $0** (within free tier)

**Peak Usage:**
- Ambulance services per day: 10
- API calls per month: 300
- **Cost per month: ~$1.50**

---

## Alternative: Manual Distance Input

If Google Maps API is not available or desired, users can:

1. Open Google Maps manually
2. Get directions from pickup to hospital
3. Note the distance
4. Enter distance manually in the form

**UI will support both:**
- ✅ Automatic calculation via API
- ✅ Manual distance input

---

## Summary

### Setup Checklist

- [ ] Create Google Cloud project
- [ ] Enable Distance Matrix API
- [ ] Create API key
- [ ] Restrict API key (security)
- [ ] Add key to `.env.local`
- [ ] Restart dev server
- [ ] Test distance calculation
- [ ] Set up billing alerts
- [ ] Monitor usage

### Benefits

✅ **Accurate** - Real road distance  
✅ **Automatic** - No manual measurement  
✅ **Auditable** - Maps URL stored  
✅ **Professional** - Industry standard  
✅ **Cost-Effective** - Free for typical usage  

### Status

**Implementation:**
- ✅ Google Maps service created (`lib/googleMaps.ts`)
- ✅ Distance calculation function
- ✅ Error handling
- ✅ URL generation
- ✅ Validation functions

**Next Steps:**
1. Get Google Maps API key
2. Add to `.env.local`
3. Integrate into visit editor
4. Test with real addresses

---

**Ready to integrate!** 🗺️

For detailed integration into the visit editor, see: `AMBULANCE_SERVICE_INTEGRATION_GUIDE.md` (to be created)

