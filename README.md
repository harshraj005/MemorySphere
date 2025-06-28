# MemorySphere - AI Cognitive Twin

A React Native Expo application that serves as your AI-powered cognitive twin for memories and productivity.

## 🚀 Features

- **AI Memory Assistant**: Store and query your memories using natural language
- **Smart Task Management**: AI-powered task parsing and organization
- **3-Day Free Trial**: Experience premium features with no credit card required
- **Data Retention Management**: Automated data lifecycle with user notifications
- **Cross-Platform**: Works on iOS, Android, and Web
- **Beautiful UI**: Modern design with light/dark theme support

## 🛠 Technology Stack

- **Framework**: Expo SDK 52.0.30 with Expo Router 4.0.17
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email/password
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native
- **Payments**: Ready for RevenueCat integration (mobile subscriptions)

## 📱 Platform Support

This app is designed to work across all platforms:
- **iOS**: Native mobile experience
- **Android**: Native mobile experience  
- **Web**: Full web application support

## 🔧 Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memorysphere-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 💳 Payment Integration

**Important**: This project is configured for RevenueCat integration for mobile app store compliance.

### Current Status
- Stripe integration has been removed (not suitable for mobile app stores)
- RevenueCat integration is required for production deployment
- Mock subscription UI is implemented for development

### To Implement RevenueCat:
1. Export this project from Bolt
2. Open in a local development environment (VS Code, Cursor, etc.)
3. Follow the [RevenueCat Expo installation guide](https://www.revenuecat.com/docs/getting-started/installation/expo)
4. Configure in-app products in App Store Connect and Google Play Console
5. Set up RevenueCat webhooks to sync with Supabase

## 🗄 Database Schema

The application uses Supabase with the following main tables:
- `users` - User profiles and trial information
- `memories` - AI memory storage with tags and metadata
- `tasks` - Task management with priorities and due dates
- `user_deletion_schedule` - Automated data retention management

## 🔐 Authentication & Security

- Email/password authentication via Supabase Auth
- Row Level Security (RLS) enabled on all tables
- Automatic trial period management (3 days)
- Secure data deletion workflows

## 📊 Data Retention Policy

- **Trial Period**: 3 days free access
- **Grace Period**: 3 months after trial expiration
- **Warning System**: Email notifications at 30, 14, and 3 days before deletion
- **Automatic Cleanup**: Permanent data deletion after grace period

## 🎨 Design System

- **Colors**: Comprehensive color system with light/dark themes
- **Typography**: Consistent font weights and sizing
- **Spacing**: 8px grid system
- **Components**: Reusable gradient cards and buttons
- **Icons**: Lucide icon library with consistent sizing

## 🚀 Deployment

### Web Deployment
The app can be deployed to any static hosting service:
```bash
npm run build:web
```

### Mobile Deployment
For mobile app stores, you'll need to:
1. Integrate RevenueCat for subscriptions
2. Create development builds with Expo Dev Client
3. Submit to App Store and Google Play Store

## 🔧 Key Features Implementation

### AI Memory System
- Natural language memory storage
- Tag-based organization
- Smart search and retrieval
- Conversation-style queries

### Task Management
- AI-powered task parsing from natural language
- Priority-based organization
- Due date management
- Smart suggestions

### Subscription Management
- Trial period tracking
- Access control based on subscription status
- Graceful degradation for expired users

## 📝 Development Notes

### Platform Considerations
- Uses `Platform.select()` for platform-specific code
- Web-compatible implementations for all features
- Responsive design with `useWindowDimensions`

### Error Handling
- Inline error messages instead of Alert dialogs
- Graceful fallbacks for network issues
- User-friendly error states

### Performance
- Optimized StyleSheet creation
- Efficient re-rendering patterns
- Lazy loading where appropriate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across platforms
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the FAQ in the app
- Contact the development team

---

Built with ❤️ using Bolt.new AI