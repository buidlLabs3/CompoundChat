# WhatsApp Business API Setup Guide

## 🚀 Get Your WhatsApp Credentials (15-30 minutes)

### Step 1: Create Meta Developer Account

1. Go to https://developers.facebook.com/
2. Click **"Get Started"** or **"Log In"**
3. Log in with your Facebook account (or create one)
4. Complete the developer registration

### Step 2: Create a New App

1. Click **"My Apps"** → **"Create App"**
2. Select **"Business"** as app type
3. Fill in:
   - **App Name**: CompoundChat (or your choice)
   - **Contact Email**: Your email
   - **Business Account**: Create new or select existing
4. Click **"Create App"**

### Step 3: Add WhatsApp Product

1. In your app dashboard, find **"WhatsApp"** product
2. Click **"Set Up"** or **"Add to App"**
3. You'll be taken to WhatsApp setup

### Step 4: Get Test Phone Number (Instant)

Meta provides a **free test number** for development:

1. Go to **WhatsApp → Getting Started**
2. You'll see a test number like: `+1 555 025 3483`
3. **Add your phone number**:
   - Click "To" field
   - Enter your WhatsApp number (with country code, e.g., +254712345678)
   - Click **"Send code via WhatsApp"**
   - Enter the 6-digit code you receive
4. ✅ Your phone is now registered for testing!

### Step 5: Get Your Credentials

#### A. **WHATSAPP_PHONE_NUMBER_ID** (Phone Number ID)

1. In **WhatsApp → API Setup**
2. Look for **"Phone Number ID"** under the test number
3. Copy the number (looks like: `123456789012345`)
4. This is your `WHATSAPP_PHONE_NUMBER_ID`

#### B. **WHATSAPP_API_KEY** (Temporary Access Token)

1. In **WhatsApp → API Setup**
2. Look for **"Temporary access token"**
3. Click **"Copy"** button
4. This is your `WHATSAPP_API_KEY`
5. ⚠️ **Note**: This token expires in 24 hours (we'll make it permanent later)

#### C. **WHATSAPP_WEBHOOK_SECRET** (You Create This)

1. This is a secret **you** create for security
2. Generate a strong random string:
   ```bash
   openssl rand -base64 32
   ```
3. Or use any random string like: `mySecretWebhook123!@#`
4. This is your `WHATSAPP_WEBHOOK_SECRET`

#### D. **WHATSAPP_BUSINESS_ACCOUNT_ID** (Optional for now)

1. In **WhatsApp → Getting Started**
2. Look for **"WhatsApp Business Account ID"**
3. Copy the number (looks like: `123456789012345`)

### Step 6: Configure Webhook

1. In **WhatsApp → Configuration**
2. Click **"Edit"** next to Webhook
3. Enter:
   - **Callback URL**: `https://your-ngrok-url.ngrok.app/webhook`
     - Get this from your running ngrok (e.g., `https://ec08d15d0a5f.ngrok-free.app/webhook`)
   - **Verify Token**: Your `WHATSAPP_WEBHOOK_SECRET` (the one you created in Step 5C)
4. Click **"Verify and Save"**
5. ✅ If successful, you'll see green checkmark

6. **Subscribe to Webhook Fields**:
   - Click **"Manage"** button
   - Check **"messages"** 
   - Click **"Subscribe"**

### Step 7: Update Your .env File

Now update `/home/core/Desktop/CompoundChat/.env`:

```bash
# Replace with your actual values
WHATSAPP_API_KEY=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_WEBHOOK_SECRET=mySecretWebhook123!@#
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
```

### Step 8: Test It!

1. Make sure your server is running (`npm run dev`)
2. Make sure ngrok is running (`ngrok http 3000`)
3. Send a message to the **test number** from your registered WhatsApp:
   - Send: `help`
   - Bot should respond with available commands!

---

## 🔄 Make Access Token Permanent (Important!)

The temporary token expires in 24 hours. To make it permanent:

### Option 1: Generate System User Token (Recommended)

1. Go to **Meta Business Suite** → https://business.facebook.com/
2. Click **Settings** (gear icon)
3. Under **Users**, select **"System Users"**
4. Click **"Add"** → Create system user (name: "CompoundChat")
5. Click on the new system user
6. Click **"Add Assets"**
7. Select **"Apps"** → Choose your app → Enable **"Manage App"**
8. Click **"Generate New Token"**
9. Select your app
10. Permissions: Check **"whatsapp_business_messaging"** and **"whatsapp_business_management"**
11. Click **"Generate Token"**
12. ✅ Copy this token - it **never expires!**
13. Replace `WHATSAPP_API_KEY` in `.env` with this new token

### Option 2: Extend Temporary Token (Simpler but expires in 60 days)

1. Use Meta's token debugger: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste your temporary token
3. Click **"Extend Access Token"**
4. Copy the new extended token (valid for 60 days)
5. Replace `WHATSAPP_API_KEY` in `.env`

---

## 🎯 Quick Reference

### Your .env Should Look Like:

```bash
NODE_ENV=development
PORT=3000

# Generate these
MASTER_ENCRYPTION_KEY=<openssl rand -hex 32>
JWT_SECRET=<openssl rand -hex 32>

# Get from Alchemy (free)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# From WhatsApp Business API
WHATSAPP_API_KEY=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_WEBHOOK_SECRET=mySecretWebhook123!@#
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
```

---

## 📱 Test Messages to Send

Once connected, try these commands on WhatsApp:

1. `help` - See all available commands
2. `create wallet` - Create your wallet (24-word mnemonic)
3. `balance` - Check your balance
4. `markets` - See Compound markets

---

## 🐛 Troubleshooting

### "Webhook verification failed"
- ✅ Check ngrok is running
- ✅ Verify URL is correct: `https://your-url.ngrok.app/webhook`
- ✅ Verify token matches exactly (case-sensitive)
- ✅ Restart your server after changing .env

### "No response from bot"
- ✅ Check server is running (`curl http://localhost:3000/health`)
- ✅ Check ngrok is active (`curl https://your-url.ngrok.app/health`)
- ✅ Check server logs for errors
- ✅ Verify webhook is subscribed to "messages"

### "Invalid access token"
- ✅ Token expired - get new one or make it permanent
- ✅ Copy full token (starts with "EAA")
- ✅ No spaces or line breaks in token

### "Phone number not registered"
- ✅ Complete phone verification in Meta dashboard
- ✅ Use the phone number you registered (with country code)
- ✅ Make sure it's your personal WhatsApp account

---

## 🚀 Production Setup (For Live Users)

For production, you need:

1. **Facebook Business Verification**
   - Go through Meta's business verification
   - Takes 1-3 days

2. **Get Your Own Phone Number**
   - Apply for WhatsApp Business API access
   - Or use a WhatsApp Business Solution Provider

3. **Request Production Access**
   - In Meta dashboard: WhatsApp → API Setup
   - Click "Start using the API"

---

## 📞 Need Help?

- **WhatsApp Docs**: https://developers.facebook.com/docs/whatsapp
- **Community**: https://stackoverflow.com/questions/tagged/whatsapp-business-api
- **Meta Support**: https://developers.facebook.com/support/

---

**You're all set! Start testing on WhatsApp!** 🎉


