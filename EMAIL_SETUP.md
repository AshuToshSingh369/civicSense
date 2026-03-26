# Email Setup Guide - CivicSense OTP

## ⚠️ Current Status

```
✅ Server running on port 5000
❌ Email notifications disabled (credentials not found)
```

Your server is running, but OTP emails won't be sent until you configure Gmail credentials.

---

## 🔧 Step-by-Step Email Setup

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** (left sidebar)
3. Scroll down to **How you sign in to Google**
4. Click **2-Step Verification**
5. Follow the prompts to enable it

> ⚠️ 2FA is required before you can create App Passwords

---

### Step 2: Generate Google App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Windows Computer** (or your device type)
4. Click **Generate**
5. Google will show you a 16-character password

**Example:**
```
xxxx xxxx xxxx xxxx
```

Copy this password (you'll need it in Step 3)

---

### Step 3: Update Your `.env` File

**File:** `backend/.env`

Add or update these lines:

```env
# Email Service (Gmail with App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
ALERT_EMAIL=authority@gmail.com
```

**Replace:**
- `your_email@gmail.com` → Your actual Gmail address
- `xxxx xxxx xxxx xxxx` → The 16-character password from Step 2
- `authority@gmail.com` → Email to send alert notifications

**Example:**
```env
EMAIL_USER=john.ashut@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
ALERT_EMAIL=admin@civicsense.local
```

---

### Step 4: Restart the Server

After updating `.env`, restart your Node server:

```bash
# If running in terminal
Ctrl + C

# Restart
npm run dev
```

You should now see:

```
✅ Email transporter initialized with Gmail
✅ Email transporter verified successfully
[CivicSense] Server running on port 5000 in development mode
```

---

## ✅ Test Email Sending

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "securePassword123",
    "homeDepartment": "City Hall"
  }'
```

### Check Server Console

You should see:

```
📧 [OTP SENT] To: test@example.com | Code: 123456 | Expires in 10 minutes
✅ OTP email sent successfully. Message ID: <msg-id>
```

If you see this message, **emails are working!** ✅

---

## 🚨 Troubleshooting

### Getting "Email transporter verification failed"

**Causes:**
1. EMAIL_USER is not a Gmail address
2. EMAIL_PASS is incorrect
3. 2FA is not enabled on Gmail
4. App Password not generated correctly

**Solution:**
- Re-check your Gmail 2FA is enabled
- Re-generate the App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Make sure there are NO extra spaces in the password (copy carefully)

### Getting "INVALID_LOGIN_ATTEMPT"

**Cause:** Password has extra spaces or special characters

**Solution:**
- Copy the App Password directly from Google
- Do NOT add/remove spaces
- Paste exactly as shown: `xxxx xxxx xxxx xxxx`

### Emails not reaching inbox

**Common reasons:**
1. Email going to SPAM folder → Check your spam folder
2. Gmail blocking the connection → Go to [myaccount.google.com/security](https://myaccount.google.com/security) and check "Recent security activity"
3. Credentials correct but service not restarted → Restart `npm run dev`

### Gmail shows "Account has been compromised"

This is NORMAL when using App Passwords. Click "Review your account activity" and approve it.

---

## 📧 Example `.env` File

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/civicsense

# Authentication
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# ============ EMAIL CONFIGURATION ============
# Gmail with 2FA + App Password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
ALERT_EMAIL=authority@gmail.com

# ============ AI & EXTERNAL SERVICES ============
OPENAI_API_KEY=sk-proj-your_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============ GOOGLE OAUTH ============
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## ✨ After Email Setup

Once emails are working:

1. **OTP Verification** ✅
   - Users receive 6-digit codes
   - 10-minute expiration
   - Beautiful HTML template

2. **Status Notifications** ✅
   - Real-time report status updates
   - Authority name & timestamp
   - Links to track reports

3. **Alert Emails** ✅
   - Critical threat alerts
   - High-severity issues
   - Sent to authorities

---

## 🔒 Security Notes

- ✅ App Passwords are safer than storing actual Gmail password
- ✅ Each password works only for Gmail on that device
- ✅ Can be revoked anytime at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- ✅ 16-character random string provided by Google
- ✅ Never commit `.env` to Git (keep `.env.example` public only)

---

## 📞 Support

**Still having issues?**

1. Check the console output for specific error messages
2. Verify EMAIL_USER and EMAIL_PASS are exactly as provided by Google
3. Ensure 2FA is enabled on your Gmail account
4. Check that `.env` is in the `backend/` directory
5. Restart the server after any `.env` changes

---

**Status:** Ready for email testing! 🚀
