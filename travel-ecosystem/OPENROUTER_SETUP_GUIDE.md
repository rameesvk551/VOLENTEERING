# OpenRouter Setup Guide for Travel Discovery Engine

## What is OpenRouter?

OpenRouter is a unified API that gives you access to multiple AI models (OpenAI, Anthropic, Google, Meta, etc.) through a single API key. It's perfect for:
- **Cost savings**: Use free models or pay only for what you use
- **Flexibility**: Switch between models easily
- **No vendor lock-in**: Access to 100+ models from different providers

## Step-by-Step Setup

### 1. Get Your OpenRouter API Key

1. Go to **https://openrouter.ai/**
2. Click **"Sign In"** (use Google, GitHub, or email)
3. Navigate to **"Keys"** section: https://openrouter.ai/keys
4. Click **"Create Key"**
5. Give it a name (e.g., "Travel Discovery Engine")
6. Copy the API key (starts with `sk-or-v1-...`)

💰 **Free Credits**: New accounts get $1 free credit to test paid models!

### 2. Configure Your Environment

Open the `.env` file in your discovery-engine:
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
nano .env  # or use your preferred editor
```

Update these lines with your actual OpenRouter API key:
```bash
# Replace 'your_openrouter_api_key_here' with your actual key
OPENAI_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE
OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE
```

### 3. Choose Your AI Model

OpenRouter offers both **FREE** and **PAID** models:

#### 🆓 Free Models (Recommended to Start)

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `google/gemini-2.0-flash-001` | ⚡⚡⚡ | ⭐⭐⭐⭐ | General tasks, fast responses |
| `meta-llama/llama-3.1-8b-instruct:free` | ⚡⚡ | ⭐⭐⭐ | Quick queries, basic tasks |
| `google/gemini-flash-1.5` | ⚡⚡⚡ | ⭐⭐⭐⭐ | Balanced performance |

#### 💰 Paid Models (Better Quality)

| Model | Cost | Quality | Best For |
|-------|------|---------|----------|
| `openai/gpt-4o-mini` | $0.15/1M tokens | ⭐⭐⭐⭐⭐ | Best OpenAI, good value |
| `anthropic/claude-3.5-sonnet` | $3/1M tokens | ⭐⭐⭐⭐⭐ | Complex reasoning, best quality |
| `google/gemini-pro-1.5` | $1.25/1M tokens | ⭐⭐⭐⭐ | Long context, good value |

**To change model**, edit this line in `.env`:
```bash
OPENAI_MODEL=google/gemini-2.0-flash-001  # Change to your preferred model
```

### 4. Restart Your Service

Stop the current service (Ctrl+C in terminal) and restart:
```bash
cd /home/ramees/www/VOLENTEERING/travel-ecosystem/services/discovery-engine
npm run dev
```

### 5. Test Your Setup

#### Test 1: Check if API key is working
```bash
curl http://localhost:3000/api/v1/discover \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "festivals in India"}'
```

Look for these log messages (should say `hasOpenAIKey: true`):
```json
{"hasOpenAIKey":true,"level":"info","message":"🚀 Discovery Pipeline Started"...}
```

#### Test 2: Check OpenRouter Dashboard
Go to: https://openrouter.ai/activity
- You should see your API requests appearing
- Check your usage and remaining credits

## Optional: Get Tavily API Key for Web Search

Tavily provides **real-time web search** to find current events and attractions:

### 1. Get Tavily API Key
1. Go to **https://tavily.com/**
2. Sign up (Free tier: 1,000 searches/month)
3. Get your API key from dashboard
4. Add to `.env`:
```bash
TAVILY_API_KEY=tvly-YOUR_ACTUAL_KEY_HERE
```

### 2. Restart Service
```bash
# Stop current service (Ctrl+C)
npm run dev
```

## Configuration Reference

### Full `.env` Example
```bash
# OpenRouter Configuration
OPENAI_API_KEY=sk-or-v1-your-key-here
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_API_BASE=https://openrouter.ai/api/v1

# Model Selection
OPENAI_MODEL=google/gemini-2.0-flash-001
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Optional Tavily for Web Search
TAVILY_API_KEY=tvly-your-key-here

# Database (already configured)
MONGODB_URI=mongodb://localhost:27017/travel_discovery
REDIS_HOST=localhost
WEAVIATE_URL=http://localhost:8080
```

## How It Works

### Without API Keys (Current State)
```
User Query → Fallback Entity Extraction → Database Search → Limited Results
❌ No AI-powered extraction
❌ No semantic search
❌ No real-time web data
❌ No intelligent summaries
```

### With OpenRouter API Key
```
User Query → AI Entity Extraction → Semantic Search → Intelligent Results
✅ Smart query understanding
✅ Better search results
✅ AI-generated summaries
✅ Personalized recommendations
```

### With OpenRouter + Tavily
```
User Query → AI Extraction → Web Search → Database + Live Data → Best Results
✅ Everything above PLUS:
✅ Real-time events from web
✅ Current festivals & attractions
✅ Up-to-date information
✅ Comprehensive coverage
```

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution**: Make sure you've replaced `your_openrouter_api_key_here` with your actual key and restarted the service.

### Issue: API errors or rate limits
**Solution**: 
1. Check your credits at https://openrouter.ai/credits
2. Try a different free model
3. Add credits to your account

### Issue: Embeddings not working
**Solution**: OpenRouter's embedding support varies. Keep using OpenAI's embeddings or use a local embedding model.

### Issue: Slow responses
**Solution**: 
- Use faster models like `google/gemini-2.0-flash-001`
- Reduce `maxTokens` in the configuration
- Enable caching (`ENABLE_CACHING=true`)

## Cost Estimation

### Free Tier Usage (Google Gemini Flash)
- **Cost**: $0 (completely free)
- **Limits**: Rate limited but generous
- **Good for**: Development, testing, personal use

### Low-Cost Paid Tier (GPT-4o-mini)
- **Typical query**: ~500 tokens
- **Cost per query**: ~$0.00008 (less than a penny)
- **100 queries**: ~$0.008 (less than 1 cent)
- **1,000 queries**: ~$0.08 (8 cents)
- **Good for**: Production apps, moderate usage

### Premium Tier (Claude 3.5 Sonnet)
- **Typical query**: ~500 tokens
- **Cost per query**: ~$0.0015
- **100 queries**: ~$0.15
- **1,000 queries**: ~$1.50
- **Good for**: Best quality, complex reasoning

## Next Steps

1. ✅ **Get OpenRouter API key** (https://openrouter.ai/keys)
2. ✅ **Update `.env` file** with your key
3. ✅ **Choose a model** (start with free `google/gemini-2.0-flash-001`)
4. ✅ **Restart service** (`npm run dev`)
5. ✅ **Test it** (make API requests)
6. 🔄 **Optional**: Get Tavily key for web search
7. 🚀 **Deploy**: Once working, deploy your app!

## Resources

- **OpenRouter**: https://openrouter.ai/
- **Model Rankings**: https://openrouter.ai/rankings
- **Pricing**: https://openrouter.ai/docs#models
- **Documentation**: https://openrouter.ai/docs
- **Tavily**: https://tavily.com/
- **Support**: Check OpenRouter Discord or docs

---

**Questions?** Check the logs and look for:
- `hasOpenAIKey: true` - API key is configured ✅
- `hasOpenAIKey: false` - API key missing ❌
- Check https://openrouter.ai/activity for API usage

**Status**: Ready to use OpenRouter! 🚀
