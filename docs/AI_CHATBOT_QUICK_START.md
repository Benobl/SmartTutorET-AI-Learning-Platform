# AI Chatbot - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Verify Backend is Running

```bash
cd smarttutor-backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
✅ MongoDB Connected Successfully
```

---

### Step 2: Verify Frontend is Running

```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js ready on http://localhost:3000
```

---

### Step 3: Test the AI Tutor

1. **Open browser**: http://localhost:3000/dashboard/student/ai-tutor
2. **Try a question**: Click a suggested topic or type your own
3. **Get AI response**: Wait 2-5 seconds for the AI to respond

---

## 🧪 Quick Test

### Test from Browser
1. Go to: http://localhost:3000/dashboard/student/ai-tutor
2. Type: "Explain quadratic equations"
3. Press Enter or click Send
4. Wait for AI response

### Test from Command Line

```bash
cd smarttutor-backend
node test-ai-chatbot.js
```

Expected output:
```
========================================
TESTING AI CHATBOT INTEGRATION
========================================

Test: Simple Math Question
✅ PASSED: AI response received
Response Time: 2500ms

...

🎉 All tests passed! AI Chatbot is working correctly!
```

---

## 📝 Example Questions to Try

### Mathematics
- "Explain quadratic equations"
- "How do I solve 2x + 5 = 15?"
- "What is the Pythagorean theorem?"
- "Help me understand derivatives"

### Science
- "What is photosynthesis?"
- "Explain Newton's laws of motion"
- "What is chemical bonding?"
- "How does cell division work?"

### English
- "Explain Shakespeare's Romeo and Juliet"
- "What is a metaphor?"
- "Help me write a persuasive essay"

### General
- "Give me study tips for exams"
- "How can I improve my grades?"
- "What's the best way to memorize formulas?"

---

## ✅ What Should Work

- ✅ Send messages and get AI responses
- ✅ Conversation history maintained
- ✅ Loading indicator while AI thinks
- ✅ Error messages if something fails
- ✅ Suggested topics work
- ✅ Auto-scroll to latest message
- ✅ Timestamps on messages

---

## 🐛 Troubleshooting

### Problem: "Failed to get AI response"

**Check**:
1. Is backend running? (http://localhost:5000)
2. Is GEMINI_API_KEY in .env?
3. Check backend console for errors

**Solution**:
```bash
# Check backend logs
cd smarttutor-backend
npm run dev

# Look for errors in console
```

### Problem: "AI is not responding"

**Check**:
1. Open browser console (F12)
2. Look for network errors
3. Check if API call is being made

**Solution**:
```bash
# Test API directly
curl -X POST http://localhost:5000/api/generate-response \
  -H "Content-Type: application/json" \
  -d '{"studentQuery":"test"}'
```

### Problem: "Connection refused"

**Solution**:
- Make sure backend is running on port 5000
- Check if another process is using port 5000
- Restart backend server

---

## 🎯 Success Indicators

You'll know it's working when:

1. **Welcome Screen Shows**:
   - AI Brain icon
   - Suggested topics
   - Pro tips card

2. **Can Send Messages**:
   - Type in input field
   - Click send button
   - Message appears in chat

3. **AI Responds**:
   - Loading indicator shows
   - AI response appears after 2-5 seconds
   - Response is relevant to question

4. **No Errors**:
   - No red error messages
   - No console errors
   - Smooth user experience

---

## 📊 Performance Expectations

- **Response Time**: 2-5 seconds
- **Response Length**: 150-300 words
- **Accuracy**: High (powered by Google Gemini)
- **Context Awareness**: Last 5 messages
- **Uptime**: 99%+ (depends on Google API)

---

## 🎓 Tips for Best Results

1. **Be Specific**: "Explain quadratic equations" is better than "help with math"
2. **Ask Follow-ups**: "Can you explain that simpler?" or "Give me an example"
3. **Provide Context**: "I'm struggling with chemistry bonding" helps AI tailor response
4. **Use Suggested Topics**: Quick way to start learning
5. **Ask for Practice**: "Give me practice problems" or "Create a quiz"

---

## 🔧 Configuration

### Backend API Endpoint
**File**: `frontend/app/dashboard/student/ai-tutor/page.tsx`
```typescript
const response = await fetch('http://localhost:5000/api/generate-response', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ studentQuery, conversationHistory })
})
```

### AI Model
**File**: `smarttutor-backend/controllers/ai.controller.js`
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

### API Key
**File**: `smarttutor-backend/.env`
```env
GEMINI_API_KEY=AIzaSyCjUb6o5gDdzsq9yU52kAt1fgD6vK-96VA
```

---

## 📚 Next Steps

Once the AI chatbot is working:

1. **Test with Real Students**: Get feedback on responses
2. **Monitor Usage**: Track most asked questions
3. **Integrate Performance Data**: Personalize based on grades
4. **Add Features**: Voice input, image recognition, etc.
5. **Optimize**: Cache common questions, improve response time

---

## ✨ Features Coming Soon

- 🎤 Voice input/output
- 📸 Image recognition (upload homework photos)
- 📊 Study session tracking
- 👥 Collaborative learning
- 📱 Mobile app
- 🌐 Offline mode

---

**Status**: ✅ Ready to Use  
**Model**: Google Gemini 1.5 Flash  
**Response Time**: 2-5 seconds  
**Accuracy**: High  

**Start chatting now!** 🚀
