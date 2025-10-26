# 💬 Real-Time Chat Frontend

Modern real-time chat application built with React, TypeScript, Redux Toolkit, and Socket.IO.

## 🎯 Features

- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Message status (sent/delivered/read)
- ✅ User presence (online/offline)
- ✅ Optimistic UI updates
- ✅ Auto-reconnection
- ✅ Message history
- ✅ Unread count badges
- ✅ Responsive design

## 🛠 Tech Stack

- **React 19.2** with Hooks
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **Socket.IO Client** for real-time
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Tanstack Query** for HTTP requests
- **Lucide React** for icons

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 3. Run Development Server

```bash
npm run dev
```

Application runs on `http://localhost:5173`

## ⚙️ Environment Variables

```env
VITE_API_URL=http://localhost:5000
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Chat/
│   │       ├── ChatWindow.tsx       # Main chat component
│   │       ├── MessageList.tsx
│   │       └── MessageInput.tsx
│   │
│   ├── hooks/
│   │   ├── useSocket.ts             # Socket.IO hook
│   │   └── useMessages.ts
│   │
│   ├── store/
│   │   ├── index.ts                 # Redux store
│   │   └── slices/
│   │       ├── authSlice.ts         # User auth state
│   │       ├── messageSlice.ts      # Messages state
│   │       ├── presenceSlice.ts     # Presence state
│   │       └── uiSlice.ts           # UI state
│   │
│   ├── services/
│   │   ├── socket.service.ts        # Socket.IO client
│   │   └── api.service.ts           # HTTP API
│   │
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   │
│   ├── App.tsx                      # Main app
│   └── main.tsx                     # Entry point
│
├── public/
├── .env
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Main Components

### ChatWindow

```tsx
import ChatWindow from "./components/Chat/ChatWindow";

<ChatWindow
  conversationId="conv-123-456"
  participantId="user-456"
  participantName="Jane Smith"
  participantAvatar="https://example.com/avatar.jpg"
/>;
```

**Props:**

- `conversationId` - Unique conversation ID
- `participantId` - Other user's ID
- `participantName` - Display name
- `participantAvatar` - Avatar URL (optional)

## 🔌 Socket.IO Integration

### Automatic Features

The app automatically handles:

- Connection to backend
- Real-time message delivery
- Typing indicators
- Presence updates
- Auto-reconnection
- Message status updates

### Custom Hook Usage

```tsx
import { useSocket } from "./hooks/useSocket";

function ChatComponent() {
  const { isConnected, sendMessage, startTyping, stopTyping } = useSocket(
    userId,
    username,
    role
  );

  const handleSend = async () => {
    await sendMessage(conversationId, receiverId, content);
  };

  return <div>Connected: {isConnected ? "Yes" : "No"}</div>;
}
```

## 🗃 Redux State Management

### Store Structure

```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean
  },
  message: {
    messagesByConversation: Record<string, Message[]>,
    conversations: Conversation[],
    typingIndicators: Record<string, string[]>,
    totalUnreadCount: number
  },
  presence: {
    presenceMap: Record<string, UserPresence>,
    onlineUsers: string[]
  },
  ui: {
    isSidebarOpen: boolean,
    notifications: Notification[]
  }
}
```


```

## 🔧 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚀 Production Build

```bash
# Build
npm run build

# Output in dist/ folder
# Deploy to any static hosting (Vercel, Netlify, etc.)
```

## 🌐 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Custom Server

```bash
npm run build
# Serve dist/ folder with nginx or any static server
```

## 🐛 Troubleshooting

**Socket not connecting:**

```bash
# Check backend is running
curl http://localhost:5000/health

# Check VITE_API_URL in .env
echo $VITE_API_URL
```

**Build errors:**

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**TypeScript errors:**

```bash
# Check tsconfig.json
# Install missing types
npm install -D @types/node
```

## 📚 Key Files Explained

**App.tsx** - Main application component
**useSocket.ts** - Socket.IO connection management
**messageSlice.ts** - Message state management
**socket.service.ts** - Socket.IO client wrapper
**ChatWindow.tsx** - Main chat UI component

## 🔒 Security

- XSS protection via React
- CSRF tokens for API calls
- Secure WebSocket (WSS in production)
- Input sanitization
- Environment variables for sensitive data

## 🎯 Features in Development

- [ ] File upload/sharing
- [ ] Voice messages
- [ ] Video calls
- [ ] Group chats
- [ ] Message search
- [ ] Emoji reactions
- [ ] Message editing
- [ ] Push notifications

## 📖 Documentation

- [React Docs](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License

## 👤 Author

Suman Shrestha - [@NAMUS09](https://github.com/NAMUS09)

---

**Built with ⚛️ React + TypeScript + Socket.IO**
