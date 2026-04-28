# 📋 Tài Liệu: Vấn Đề & Cách Giải Quyết Chat Module

---

## 🔴 VẤN ĐỀ 1: Tin Nhắn Hiển Thị Sai Vị Trí (Trên cùng thay vì dưới cùng)

### 🐛 Root Cause
- Tin nhắn mới phải ở **dưới cùng** (cuối danh sách) nhưng hiện tại ở **trên cùng**
- Nguyên nhân: Khi subscribe WebSocket nhận message mới, component render không scroll xuống

### ✅ Cách Giải Quyết

**1. ChatWidget.js - Thêm auto-scroll khi có message mới:**
```javascript
useEffect(() => {
  // Scroll to bottom whenever messages update
  if (messagesContainerRef.current) {
    setTimeout(() => {
      messagesContainerRef.current.scrollTop = 
        messagesContainerRef.current.scrollHeight;
    }, 0);
  }
}, [userMessages]); // Thêm userMessages vào dependency
```

**2. Ensure messages sorted by timestamp (newest last):**
```javascript
// Trong ChatContext hoặc component, sort messages
const sortedMessages = [...userMessages].sort((a, b) => 
  new Date(a.createdAt) - new Date(b.createdAt)
);
```

---

## 🔴 VẤN ĐỀ 2: Chữ "[SHOP]" Được Gắn Vào Content Tin Nhắn

### 🐛 Root Cause
```javascript
// ChatWidget.js - Line 119-120
const content = chatMode === 'SHOP' ? `[SHOP] ${trimmed}` : trimmed;
sendMessage(userConversation.id, content);
```
**Problem:** `[SHOP]` là nhãn UI, không nên lưu vào content trong DB

### ✅ Cách Giải Quyết

**Backend không nên phụ thuộc vào content prefix. Thay vào đó:**

```javascript
// ChatWidget.js - Sửa handleSend
const handleSend = () => {
  if (!input.trim() || !userConversation) return;
  
  const trimmed = input.trim();
  
  // ❌ CÁCH CŨ (SAI)
  // const content = chatMode === 'SHOP' ? `[SHOP] ${trimmed}` : trimmed;
  
  // ✅ CÁCH MỚI (ĐÚNG)
  // Gửi message + metadata
  sendMessage(userConversation.id, trimmed, chatMode); // Thêm chatMode
  setInput('');
};
```

**ChatSocketHelper.js - Sửa sendMessage:**
```javascript
function sendMessage(conversationId, content, chatMode = 'BOT') {
  if (!stompClient || !stompClient.connected || !content.trim()) return;
  
  stompClient.publish({
    destination: ApiUrl.CHAT_SEND_WS,
    body: JSON.stringify({ 
      conversationId, 
      content,
      chatMode,  // ✅ Thêm field này
    }),
  });
}
```

**Backend sẽ nhận được:**
```json
{
  "conversationId": "conv-123",
  "content": "gggggggggg",
  "chatMode": "SHOP"  // ← Backend dùng cái này để xác định loại
}
```

**Backend trả về (broadcast):**
```json
{
  "id": "msg-456",
  "conversationId": "conv-123",
  "content": "gggggggggg",
  "senderType": "USER",      // ← USER, ADMIN, EMPLOYEE
  "senderName": "Nguyễn Văn A",
  "createdAt": "2026-04-21T10:30:00Z",
  "chatChannel": "SHOP"      // ← BOT hay SHOP (UI hint)
}
```

---

## 🔴 VẤN ĐỀ 3: Cả Bot và Shop Đều Hiện Tin Nhắn Giống Nhau

### 🐛 Root Cause
```javascript
// ChatWidget.js - Line 301-307
const isMine = m.senderType === 'USER';
const isBot = m.senderType === 'BOT';

return (
  <Box bg={isMine ? 'blue.500' : isBot ? 'green.500' : 'gray.200'}>
```

**Problem:** 
1. Không phân biệt Bot vs Shop
2. Backend không trả về đủ info

### ✅ Cách Giải Quyết

**ChatWidget.js - Sửa message render logic:**
```javascript
const MessageContent = ({ message }) => {
  const { content, senderType, chatChannel } = message;
  
  // Xác định loại tin nhắn
  const isMine = senderType === 'USER';
  const isAdmin = senderType === 'ADMIN';
  const isEmployee = senderType === 'EMPLOYEE';
  const isBot = senderType === 'BOT';
  
  // Xác định màu theo senderType
  let bgColor = 'gray.200';
  let textColor = 'gray.900';
  
  if (isMine) {
    bgColor = 'blue.500';
    textColor = 'white';
  } else if (isBot) {
    bgColor = 'green.500';
    textColor = 'white';
  } else if (isAdmin || isEmployee) {
    bgColor = 'orange.400';
    textColor = 'white';
  }
  
  return (
    <Flex justify={isMine ? 'flex-end' : 'flex-start'}>
      <Box
        maxW="88%"
        px={4}
        py={3}
        borderRadius="xl"
        bg={bgColor}
        color={textColor}
        boxShadow="lg"
      >
        {!isMine && (
          <Text fontSize="xs" opacity={0.9} mb={1} fontWeight="bold">
            {message.senderName}
            {chatChannel === 'SHOP' && ' (Shop)'} {/* ← Nhãn Shop */}
            {isBot && ' (Bot)'}
          </Text>
        )}
        <MessageContent content={content} />
      </Box>
    </Flex>
  );
};
```

**Backend - Phải trả về đầy đủ:**
```json
{
  "id": "msg-456",
  "content": "Xin chào",
  "senderType": "ADMIN",           // ← USER | ADMIN | EMPLOYEE | BOT
  "senderName": "Tư Vấn Viên",
  "senderId": "admin-123",
  "conversationId": "conv-123",
  "chatChannel": "SHOP",           // ← BOT | SHOP (để biết gửi qua kênh nào)
  "createdAt": "2026-04-21T10:30:00Z"
}
```

---

## 🔴 VẤN ĐỀ 4: Admin Nhắn Lại Lấy Về Tên Khách

### 🐛 Root Cause
```javascript
{!isMine && (
  <Text fontSize="xs">{m.senderName}</Text> // ← Lấy tên sai
)}
```

**Problem:** Server trả về `senderName` không đúng (có thể trả tên user thay vì tên admin)

### ✅ Cách Giải Quyết

**Backend - Khi broadcast message phải đúng sender:**
```json
// ✅ ĐÚNG - Khi Admin gửi
{
  "senderType": "ADMIN",
  "senderName": "Admin Support",  // ← Tên ADMIN, không phải customer
  "senderId": "admin-123",
  "senderAvatar": "admin-avatar-url"
}

// ✅ ĐÚNG - Khi User gửi
{
  "senderType": "USER",
  "senderName": "Nguyễn Văn A",    // ← Tên USER
  "senderId": "user-123",
  "senderAvatar": "user-avatar-url"
}
```

**ChatContext.js - Verify senderName logic:**
```javascript
ChatSocketHelper.subscribe(ApiUrl.CHAT_TOPIC(convId), async (msg) => {
  const data = JSON.parse(msg.body);
  
  // Verify data structure
  console.log('📨 Received message:', {
    senderType: data.senderType,
    senderName: data.senderName,
    content: data.content,
  });
  
  setUserMessages((prev) => [...prev, data]);
});
```

---

# 🎯 Backend WebSocket Response Specification

## 📤 FE gửi lên (POST `/app/chat/send`)

```json
{
  "conversationId": "conv-123",
  "content": "Xin chào",
  "chatMode": "SHOP"  // Optional: BOT | SHOP
}
```

---

## 📥 BE Broadcast lại qua `/topic/chat/{conversationId}`

### ✅ Response Format (REQUIRED)

```json
{
  "id": "msg-789",                           // Message ID (unique)
  "conversationId": "conv-123",              // Hội thoại ID
  "content": "Xin chào",                     // Nội dung
  "senderType": "USER",                      // ← CRITICAL: USER | ADMIN | EMPLOYEE | BOT
  "senderName": "Nguyễn Văn A",              // ← Tên người gửi (không lấy từ khác)
  "senderId": "user-123",                    // ID người gửi
  "senderAvatar": "https://...",             // Avatar URL
  "createdAt": "2026-04-21T10:30:00Z",       // Timestamp ISO-8601
  "chatChannel": "SHOP",                     // ← BOT | SHOP (UI hint)
  "status": "DELIVERED"                      // Trạng thái
}
```

### 🔍 Chi Tiết Từng Field

| Field | Kiểu | Mục Đích | Ví Dụ |
|-------|------|---------|-------|
| `id` | String | Định danh message unique | "msg-789" |
| `conversationId` | String | ID cuộc trò chuyện | "conv-123" |
| `content` | String | Nội dung (không gắn [SHOP]) | "Xin chào" |
| `senderType` | String | Loại người gửi | "USER", "ADMIN" |
| `senderName` | String | Tên người gửi **thực sự** | "Nguyễn Văn A" |
| `senderId` | String | ID người gửi | "user-123" |
| `senderAvatar` | String | Avatar URL | "https://..." |
| `createdAt` | ISO-8601 | Timestamp | "2026-04-21T10:30:00Z" |
| `chatChannel` | String | Kênh chat (UI hint) | "SHOP", "BOT" |
| `status` | String | Trạng thái | "SENT", "DELIVERED" |

---

## 🤔 Tại Sao Backend Phải Trả Về Đầy Đủ Info?

### 1️⃣ Frontend Không Nên Suy Đoán
```javascript
// ❌ SAI: FE tự xử lý logic
const isSender = message.senderId === currentUserId;

// ✅ ĐÚNG: Backend quyết định
const isSender = message.senderType === 'USER';
```

### 2️⃣ Mở Rộng Dễ Dàng
```javascript
// Sau này thêm senderType = 'BOT_ASSISTANT'
// FE chỉ cần thêm case, không cần sửa BE logic
```

### 3️⃣ Bảo Mật (Không Tin Client)
```javascript
// ❌ ĐỦ NGUY HIỂM: Lấy từ localStorage
const senderType = localStorage.getItem('userRole'); // ← Attacker sửa dễ

// ✅ AN TOÀN: Backend quyết định
// Server biết request từ user nào, tự trả về senderType
```

### 4️⃣ Chuẩn GraphQL / REST Best Practices
```
Response phải "self-contained" (tự giải thích)
FE không phải query thêm info từ chỗ khác
```

---

# 📋 Checklist Fix

- [ ] **Issue 1**: Thêm auto-scroll + sort message by timestamp
- [ ] **Issue 2**: Gửi `chatMode` riêng, không gắn vào content
- [ ] **Issue 3**: Thêm phân biệt `senderType` trong render
- [ ] **Issue 4**: Xác minh Backend trả về đúng `senderName`
- [ ] Backend response include đầy đủ fields theo spec trên

---

# 🔗 Files Cần Sửa

1. `src/components/chat/ChatWidget.js` - Fix issues 1, 2, 3
2. `src/utils/ChatSocketHelper.js` - Fix issue 2 (parameter)
3. **Backend** - Trả về đầy đủ message object
4. `src/contexts/ChatContext.js` - Add logging nếu cần

---

# 🧪 Test Cases

```
✅ User send "hello" → hiện ở dưới, màu xanh, tên "Nguyễn Văn A"
✅ Admin reply → hiện dưới, màu cam, tên "Admin Support"
✅ Bot reply → hiện dưới, màu xanh lá, tên "Trendify Bot"
✅ Shop/Bot toggle → không gắn [SHOP] vào content
✅ Scroll auto → message mới luôn visible
```

---

**Tạo bởi:** Copilot  
**Ngày:** 2026-04-21
