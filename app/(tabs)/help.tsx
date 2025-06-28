import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { CircleHelp as HelpCircle, ChevronLeft, MessageCircle, Book, Mail, Phone, Search, ChevronRight, Bot, Send, X, User, Sparkles, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Settings, Shield, CreditCard, Database, Smartphone } from 'lucide-react-native';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const createStyles = (colors: any, layout: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: layout.fontSize.large,
    fontWeight: '700',
    color: colors.background,
  },
  headerSpacer: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: layout.fontSize.small,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: layout.fontSize.large,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    gap: 16,
  },
  actionCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: layout.fontSize.small,
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: layout.fontSize.medium,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqQuestion: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  faqCategory: {
    fontSize: layout.fontSize.small,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    marginLeft: 12,
    fontWeight: '500',
  },
  chatFab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  chatFabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: layout.padding,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatBotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatHeaderTitle: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
  },
  chatHeaderSubtitle: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
  },
  chatCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: layout.padding,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: layout.fontSize.small,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.background,
  },
  botMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    backgroundColor: colors.primary + '15',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  suggestionText: {
    fontSize: layout.fontSize.small,
    color: colors.primary,
    fontWeight: '500',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  chatInputField: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: layout.fontSize.medium,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyChatTitle: {
    fontSize: layout.fontSize.large,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyChatSubtitle: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  quickQuestions: {
    gap: 8,
    width: '100%',
  },
  quickQuestion: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickQuestionText: {
    fontSize: layout.fontSize.small,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How does the 3-day free trial work?',
    answer: 'Your free trial starts immediately when you sign up. You get full access to all premium features for 3 days. No credit card required. After the trial, you can subscribe to continue using premium features.',
    category: 'Trial & Billing',
    keywords: ['trial', 'free', 'billing', 'subscription', 'payment'],
  },
  {
    id: '2',
    question: 'What happens to my data if I don\'t subscribe?',
    answer: 'Your data remains safe for 3 months after your trial expires. We\'ll send you email reminders before any deletion. You can subscribe anytime during this period to keep your data.',
    category: 'Data & Privacy',
    keywords: ['data', 'deletion', 'privacy', 'storage', 'backup'],
  },
  {
    id: '3',
    question: 'How does the AI memory assistant work?',
    answer: 'Our AI analyzes your memories and conversations to help you recall information. You can ask questions in natural language, and the AI will search through your stored memories to provide relevant answers.',
    category: 'Features',
    keywords: ['ai', 'memory', 'assistant', 'search', 'recall'],
  },
  {
    id: '4',
    question: 'Can I export my data?',
    answer: 'Yes! Premium users can export all their data as a comprehensive PDF report sent to their email. This includes memories, tasks, and account information.',
    category: 'Data & Privacy',
    keywords: ['export', 'data', 'pdf', 'download', 'backup'],
  },
  {
    id: '5',
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption, secure cloud storage, and never sell your personal data. All memories are encrypted and only accessible by you.',
    category: 'Data & Privacy',
    keywords: ['security', 'encryption', 'privacy', 'safe', 'protection'],
  },
  {
    id: '6',
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your profile settings. Your premium features remain active until the end of your billing period. No cancellation fees.',
    category: 'Trial & Billing',
    keywords: ['cancel', 'subscription', 'billing', 'refund'],
  },
  {
    id: '7',
    question: 'What devices are supported?',
    answer: 'MemorySphere works on iOS, Android, and web browsers. Your data syncs across all devices automatically when you\'re signed in.',
    category: 'Technical',
    keywords: ['devices', 'ios', 'android', 'web', 'sync', 'compatibility'],
  },
  {
    id: '8',
    question: 'How do I add memories?',
    answer: 'Tap the "+" button in the Memory tab to add a new memory. You can include title, content, people involved, location, and emotions. The AI will automatically generate relevant tags.',
    category: 'Features',
    keywords: ['add', 'memory', 'create', 'tags', 'content'],
  },
];

const quickQuestions = [
  'How do I start my free trial?',
  'Is my data safe and secure?',
  'How does the AI assistant work?',
  'Can I cancel anytime?',
  'What happens after my trial ends?',
];

export default function HelpSupportScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const layout = useResponsiveLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const styles = createStyles(colors, layout);

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find relevant FAQ
    const relevantFAQ = faqData.find(faq =>
      faq.keywords.some(keyword => lowerMessage.includes(keyword)) ||
      lowerMessage.includes(faq.question.toLowerCase().substring(0, 10))
    );

    let response = '';
    let suggestions: string[] = [];

    if (relevantFAQ) {
      response = relevantFAQ.answer;
      suggestions = [
        'Tell me more about this',
        'How do I get started?',
        'Contact support',
      ];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = `Hello ${user?.first_name || 'there'}! 👋 I'm your MemorySphere assistant. I'm here to help you with any questions about the app, your account, or features. What would you like to know?`;
      suggestions = quickQuestions.slice(0, 3);
    } else if (lowerMessage.includes('help')) {
      response = 'I\'d be happy to help! Here are some common topics I can assist with:\n\n• Getting started with MemorySphere\n• Managing your subscription\n• Using AI features\n• Data privacy and security\n• Technical support\n\nWhat specific question do you have?';
      suggestions = ['How to add memories?', 'Subscription help', 'Privacy questions'];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      response = 'You can reach our support team at:\n\n📧 Email: support@memorysphere.app\n📞 Phone: +1 (555) 123-4567\n\nWe typically respond within 24 hours. For urgent issues, please call us directly.';
      suggestions = ['Send email now', 'View FAQ', 'Technical issues'];
    } else {
      response = 'I understand you\'re asking about "' + userMessage + '". While I don\'t have a specific answer for that, I can help you with:\n\n• Account and billing questions\n• Feature explanations\n• Technical support\n• Data privacy concerns\n\nTry asking about one of these topics, or contact our support team for personalized help.';
      suggestions = ['Contact support', 'View FAQ', 'Account help'];
    }

    return {
      id: Date.now().toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
      suggestions,
    };
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isBot: false,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput);
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setChatInput(suggestion);
    sendMessage();
  };

  const handleQuickQuestion = (question: string) => {
    setChatInput(question);
    setTimeout(() => sendMessage(), 100);
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const quickActions = [
    {
      icon: MessageCircle,
      title: 'AI Chat Assistant',
      description: 'Get instant help from our intelligent chatbot',
      action: () => setShowChatbot(true),
      color: colors.primary,
    },
    {
      icon: Book,
      title: 'User Guide',
      description: 'Learn how to use all MemorySphere features',
      action: () => {},
      color: colors.secondary,
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a message for personalized help',
      action: () => {},
      color: colors.success,
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for urgent technical issues',
      action: () => {},
      color: colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ResponsiveContainer>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={colors.background} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <HelpCircle size={24} color={colors.background} strokeWidth={1.5} />
              <Text style={styles.headerTitle}>Help & Support</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.headerSubtitle}>
            Get help, find answers, and contact our support team
          </Text>
        </ResponsiveContainer>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Help</Text>
            <ResponsiveGrid minItemWidth={250} gap={16} style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.action}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.cardGradient}
                    style={styles.actionCard}
                  >
                    <LinearGradient
                      colors={[action.color + '20', action.color + '10']}
                      style={styles.actionIconContainer}
                    >
                      <action.icon size={24} color={action.color} strokeWidth={1.5} />
                    </LinearGradient>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Get Help</Text>
                      <ChevronRight size={16} color={colors.primary} strokeWidth={2} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ResponsiveGrid>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.searchContainer}
            >
              <Search size={20} color={colors.textLight} strokeWidth={1.5} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search FAQ..."
                placeholderTextColor={colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </LinearGradient>

            <View style={styles.faqList}>
              {filteredFAQs.map((faq) => (
                <LinearGradient
                  key={faq.id}
                  colors={colors.cardGradient}
                  style={styles.faqItem}
                >
                  <Text style={styles.faqCategory}>{faq.category}</Text>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.contactCard}
            >
              <View style={styles.contactHeader}>
                <Mail size={24} color={colors.primary} strokeWidth={1.5} />
                <Text style={styles.contactTitle}>Get in Touch</Text>
              </View>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Mail size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.contactText}>support@memorysphere.app</Text>
                </View>
                <View style={styles.contactItem}>
                  <Phone size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.contactText}>+1 (555) 123-4567</Text>
                </View>
                <View style={styles.contactItem}>
                  <Clock size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.contactText}>Mon-Fri, 9 AM - 6 PM EST</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.bottomSpacing} />
        </ResponsiveContainer>
      </ScrollView>

      {/* Chat FAB */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => setShowChatbot(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.chatFabGradient}
        >
          <Bot size={28} color={colors.background} strokeWidth={1.5} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Chatbot Modal */}
      <Modal
        visible={showChatbot}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={styles.chatModal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <LinearGradient
                colors={[colors.primary + '20', colors.primary + '10']}
                style={styles.chatBotAvatar}
              >
                <Bot size={20} color={colors.primary} strokeWidth={1.5} />
              </LinearGradient>
              <View>
                <Text style={styles.chatHeaderTitle}>MemorySphere Assistant</Text>
                <Text style={styles.chatHeaderSubtitle}>Always here to help</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatCloseButton}
              onPress={() => setShowChatbot(false)}
            >
              <X size={24} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatMessages}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.length === 0 ? (
              <View style={styles.emptyChat}>
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '10']}
                  style={styles.emptyChatIcon}
                >
                  <Sparkles size={40} color={colors.primary} strokeWidth={1.5} />
                </LinearGradient>
                <Text style={styles.emptyChatTitle}>Hi there! 👋</Text>
                <Text style={styles.emptyChatSubtitle}>
                  I'm your MemorySphere assistant. Ask me anything about the app, your account, or features.
                </Text>
                <View style={styles.quickQuestions}>
                  {quickQuestions.map((question, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickQuestion}
                      onPress={() => handleQuickQuestion(question)}
                    >
                      <Text style={styles.quickQuestionText}>{question}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              chatMessages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.isBot ? styles.botMessage : styles.userMessage,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.isBot ? styles.botBubble : styles.userBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.isBot ? styles.botMessageText : styles.userMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        message.isBot ? styles.botMessageText : styles.userMessageText,
                      ]}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {message.suggestions && (
                    <View style={styles.suggestions}>
                      {message.suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionChip}
                          onPress={() => handleSuggestionPress(suggestion)}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Chat Input */}
          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatInputField}
              placeholder="Type your message..."
              placeholderTextColor={colors.textLight}
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!chatInput.trim()}
            >
              <LinearGradient
                colors={chatInput.trim() ? [colors.primary, colors.primaryLight] : [colors.border, colors.surface]}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color={chatInput.trim() ? colors.background : colors.textLight} strokeWidth={1.5} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}