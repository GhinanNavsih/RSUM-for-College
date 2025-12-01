# 🔧 Enable Required Google Maps APIs

## ⚠️ Action Required

Your Google Maps API key is configured, but you need to **enable additional APIs** in Google Cloud Console for the map picker to work.

---

## 📋 Quick Fix (5 minutes)

### Step 1: Go to Google Cloud Console

Open: **https://console.cloud.google.com/**

### Step 2: Select Your Project

Make sure you're in the project where you created the API key.

### Step 3: Enable Required APIs

You need to enable **3 APIs** (you may have only enabled Distance Matrix API):

#### 1. Maps JavaScript API

1. Go to **APIs & Services** → **Library**
2. Search: **"Maps JavaScript API"**
3. Click on it
4. Click **"ENABLE"**
5. Wait for confirmation

#### 2. Places API

1. Go to **APIs & Services** → **Library**
2. Search: **"Places API"**
3. Click on it
4. Click **"ENABLE"**
5. Wait for confirmation

#### 3. Geocoding API

1. Go to **APIs & Services** → **Library**
2. Search: **"Geocoding API"**
3. Click on it
4. Click **"ENABLE"**
5. Wait for confirmation

#### 4. Distance Matrix API (Already Enabled ✅)

You already have this one enabled!

### Step 4: Verify APIs

Go to **APIs & Services** → **Dashboard**

You should see **4 enabled APIs**:
- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API
- ✅ Distance Matrix API

### Step 5: Wait & Refresh

1. **Wait 1-2 minutes** for APIs to activate
2. **Refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Try the map picker again**

---

## 🎯 What Each API Does

| API | Purpose | Example |
|-----|---------|---------|
| **Maps JavaScript API** | Display interactive map | Show map of Ponorogo |
| **Places API** | Search with autocomplete | Search "Jl. Sudirman" → suggestions |
| **Geocoding API** | Convert address ↔ coordinates | "Jl. Sudirman" → lat/lng |
| **Distance Matrix API** | Calculate distance | Sudirman → Hospital = 5.3 km |

---

## 💰 Cost Impact

**Still FREE!** ✅

Your free tier now covers:

| API | Free Tier | Typical Usage | Cost |
|-----|-----------|---------------|------|
| Maps JavaScript API | 28,000 loads/month | ~50/month | $0 |
| Places API | 100,000 requests/month | ~50/month | $0 |
| Geocoding API | 100,000 requests/month | ~100/month | $0 |
| Distance Matrix API | 40,000 requests/month | ~50/month | $0 |

**Total Monthly Cost: Still $0** 🎉

---

## ✅ Checklist

**Before using map picker, ensure:**

- [ ] Maps JavaScript API enabled
- [ ] Places API enabled
- [ ] Geocoding API enabled
- [ ] Distance Matrix API enabled (already done)
- [ ] Wait 1-2 minutes after enabling
- [ ] Refresh browser
- [ ] Test the map picker

---

## 🔒 Optional: Restrict API Key (Recommended for Production)

After enabling all APIs, you should restrict your API key:

### API Restrictions

1. Go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **"API restrictions"**, select **"Restrict key"**
4. Check these APIs:
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Distance Matrix API
5. Click **"Save"**

### Application Restrictions (For Production)

1. Select **"HTTP referrers (web sites)"**
2. Add your domain:
   ```
   http://localhost:3000/*
   https://yourdomain.com/*
   ```
3. Click **"Save"**

**Note:** For now (development), you can skip application restrictions.

---

## 🆘 Troubleshooting

### Error: "This page can't load Google Maps correctly"

**Solution:** Enable Maps JavaScript API (see Step 3 above)

### Error: "places.SearchBox is not available"

**Solution:** Enable Places API (see Step 3 above)

### Error: "Geocoding service failed"

**Solution:** Enable Geocoding API (see Step 3 above)

### Error: "This project is not authorized to use this API"

**Solution:**
1. Check billing is enabled (even for free tier)
2. Verify APIs are enabled
3. Wait 1-2 minutes
4. Refresh browser

---

## 🎯 Summary

**Problem:** Map picker shows "can't load Google Maps correctly"

**Cause:** Additional APIs not enabled

**Solution:** Enable 3 more APIs in Google Cloud Console
1. Maps JavaScript API
2. Places API
3. Geocoding API

**Time:** 5 minutes

**Cost:** $0 (within free tier)

**After enabling:** Wait 1-2 minutes, refresh browser, try again!

---

**Once these APIs are enabled, your map picker will work perfectly!** 🗺️✨

