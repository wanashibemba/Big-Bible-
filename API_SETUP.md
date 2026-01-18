# API.Bible Setup Guide

Your Bible Projector app has been upgraded to use **API.bible**, giving you access to 2500+ Bible translations including popular versions like NIV, ESV, NLT, and NKJV!

## Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. **Visit**: [https://scripture.api.bible/](https://scripture.api.bible/)
2. **Click** "Sign Up" or "Get Started"
3. **Create a free account** (no credit card required)
4. **Copy your API key** from the dashboard

### Step 2: Add Your API Key to the App

#### Option A: For the Modular Version (index.html + script.js)

1. Open `script.js` in a text editor
2. Find this line (near the top):
   ```javascript
   API_KEY: 'YOUR_API_KEY_HERE',
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   API_KEY: 'abc123xyz456',  // Your actual key here
   ```
4. Save the file

#### Option B: For the Standalone Version (big-bible-standalone.html)

1. Open `big-bible-standalone.html` in a text editor
2. Search for `YOUR_API_KEY_HERE`
3. Replace it with your actual API key
4. Save the file

### Step 3: Test It!

1. Open your app in a browser
2. Select a translation (try NIV or ESV!)
3. Choose a passage (like John 3:16-17)
4. Click "Display Scripture"

If you see verses appear, you're all set! 🎉

## Available Translations

Your app now includes:

### Popular Translations
- ✅ New International Version (NIV)
- ✅ English Standard Version (ESV)
- ✅ New Living Translation (NLT)
- ✅ King James Version (KJV)
- ✅ New King James Version (NKJV)
- ✅ Christian Standard Bible (CSB)
- ✅ New American Standard Bible (NASB)

### Free Public Domain
- ✅ World English Bible (WEB)
- ✅ American Standard Version (ASV)
- ✅ Bible in Basic English (BBE)

## Troubleshooting

### "Invalid API key" Error

**Problem**: You see an error about an invalid API key

**Solutions**:
1. Make sure you replaced `YOUR_API_KEY_HERE` with your actual key
2. Check that there are no extra spaces or quotes
3. Verify your key is active at [scripture.api.bible](https://scripture.api.bible/)

### No Verses Appear

**Problem**: The page loads but no verses show up

**Solutions**:
1. Check your browser's console (F12) for errors
2. Verify you have an internet connection
3. Make sure the book/chapter/verse range is valid

### Rate Limiting

**Problem**: "Too many requests" error

**Solution**: API.bible has generous rate limits for free accounts. If you hit the limit, wait a few minutes and try again.

## API Key Security

### Is it safe to expose my API key?

For a **free, non-commercial, donation-funded app** like yours:
- ✅ **Yes, it's acceptable** to include the key in your code
- ✅ API.bible allows this for non-commercial use
- ✅ You can set usage limits on your key in the dashboard

### Best Practices

1. **Set usage limits** in your API.bible dashboard
2. **Monitor usage** regularly
3. **Don't use the same key** for multiple projects
4. **Regenerate if compromised** - you can get a new key anytime

## API.bible Features

- 📖 **2500+ Bible versions** across 1600+ languages
- 🆓 **Free for non-commercial use** (perfect for donation-funded apps)
- 🚀 **Fast and reliable** API
- 📱 **CORS enabled** for browser usage
- 📊 **Usage dashboard** to monitor requests

## Support

- **API.bible Help**: [docs.api.bible](https://docs.api.bible/)
- **App Issues**: Check the main README.md

## Terms of Service

By using API.bible, you agree to their [Terms and Conditions](https://docs.api.bible/terms-and-conditions/). Your donation-funded, non-commercial app complies with their free tier usage.

---

**Ready to go?** Get your API key at [scripture.api.bible](https://scripture.api.bible/) and start displaying powerful Bible translations! 🙏
