import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { getSupabase, Memory } from '@/lib/supabase';
import { 
  Brain, 
  Search, 
  Plus, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Heart,
  User,
  Sparkles,
  Send,
  X,
  Lock,
} from 'lucide-react-native';

const createStyles = (colors: any, layout: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  blockedContainer: {
    flex: 1,
  },
  blockedBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedContent: {
    alignItems: 'center',
    padding: layout.padding,
    maxWidth: 400,
  },
  blockedIconContainer: {
    width: layout.isMobile ? 100 : 120,
    height: layout.isMobile ? 100 : 120,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  blockedTitle: {
    fontSize: layout.fontSize.xlarge,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 16,
  },
  blockedSubtitle: {
    fontSize: layout.fontSize.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  blockedButton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: layout.isMobile ? 24 : 32,
    paddingVertical: 16,
  },
  blockedButtonText: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: layout.fontSize.medium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: layout.fontSize.xlarge,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: layout.isMobile ? 'center' : 'left',
  },
  headerSubtitle: {
    fontSize: layout.fontSize.medium,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
    lineHeight: 22,
    textAlign: layout.isMobile ? 'center' : 'left',
  },
  chatContainer: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: layout.isMobile ? '100%' : 'auto',
  },
chatInput: {
  flex: 1,
    height: 48,
    color: colors.background,
    fontSize: layout.fontSize.medium,
    marginLeft: 12,
    fontWeight: '500',
},

  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: layout.isMobile ? 12 : 0,
  },
  sendButtonGradient: {
    width: layout.isMobile ? '100%' : 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: layout.isMobile ? 120 : 48,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  controls: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: layout.isMobile ? '100%' : 'auto',
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: layout.fontSize.medium,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: layout.isMobile ? '100%' : 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: layout.isMobile ? 120 : 48,
    flexDirection: layout.isMobile ? 'row' : 'column',
    gap: layout.isMobile ? 8 : 0,
  },
  addButtonText: {
    color: colors.background,
    fontSize: layout.fontSize.small,
    fontWeight: '600',
  },
  memoriesList: {
    flex: 1,
  },
  memoryCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  memoryInfo: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  memoryDate: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emotionIcon: {
    fontSize: 20,
  },
  memoryContent: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  memoryMeta: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    alignItems: layout.isMobile ? 'flex-start' : 'center',
    marginBottom: 16,
    gap: layout.isMobile ? 8 : 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: layout.fontSize.small,
    fontWeight: '600',
  },
  emptyContainer: {
    borderRadius: 20,
    padding: layout.isMobile ? 32 : 40,
    alignItems: 'center',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIconContainer: {
    width: layout.isMobile ? 64 : 80,
    height: layout.isMobile ? 64 : 80,
    backgroundColor: colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: layout.fontSize.large,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: layout.fontSize.small,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyActionText: {
    fontSize: layout.fontSize.small,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: layout.padding,
    paddingBottom: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: layout.fontSize.large,
    fontWeight: '700',
    color: colors.text,
  },
  modalSaveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveText: {
    fontSize: layout.fontSize.medium,
    color: colors.background,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: layout.padding,
  },
  inputGroup: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  textInput: {
    fontSize: layout.fontSize.medium,
    color: colors.text,
    fontWeight: '500',
  },
  textArea: {
    height: layout.isMobile ? 80 : 100,
    textAlignVertical: 'top',
  },
});

export default function MemoryScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { status } = useSubscription();
  const layout = useResponsiveLayout();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Memory Form
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    person: '',
    location: '',
    emotion: '',
  });

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user]);

  // Redirect to locked screen if access is blocked
  useEffect(() => {
    if (!status.hasAccess && status.accessBlocked && !loading) {
      router.replace('/locked');
    }
  }, [status.hasAccess, status.accessBlocked, loading]);

  const loadMemories = async () => {
    // Only load data if user has access
    if (!status.hasAccess || status.accessBlocked) {
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error loading memories:', error);
      setError('Failed to load memories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = () => {
    if (!status.hasAccess || status.accessBlocked) {
      setError('AI memory queries require an active subscription. Please upgrade to continue.');
      return;
    }

    if (!chatInput.trim()) return;

    // Simulate AI response by searching memories
    const query = chatInput.toLowerCase().trim();
    const relevantMemories = memories.filter(memory =>
      memory.title.toLowerCase().includes(query) ||
      memory.content.toLowerCase().includes(query) ||
      memory.person?.toLowerCase().includes(query) ||
      memory.location?.toLowerCase().includes(query)
    );

    if (relevantMemories.length > 0) {
      setError(`I found ${relevantMemories.length} relevant memories about "${chatInput}". Here's what I remember: ${relevantMemories[0].title}: ${relevantMemories[0].content.substring(0, 100)}...`);
    } else {
      setError("I don't have any memories matching that query yet. Try adding more memories to expand my knowledge about your experiences.");
    }

    setChatInput('');
  };

  const addMemory = async () => {
    if (!status.hasAccess || status.accessBlocked) {
      setError('Adding memories requires an active subscription. Please upgrade to continue.');
      return;
    }

    if (!newMemory.title.trim() || !newMemory.content.trim()) {
      setError('Please fill in title and content');
      return;
    }

    try {
      const supabase = getSupabase();
      
      // Auto-generate tags using simple keyword extraction
      const tags = extractTags(newMemory.content);

      const { error } = await supabase
        .from('memories')
        .insert({
          user_id: user!.id,
          title: newMemory.title,
          content: newMemory.content,
          person: newMemory.person || null,
          location: newMemory.location || null,
          emotion: newMemory.emotion || null,
          tags,
        });

      if (error) throw error;

      setNewMemory({ title: '', content: '', person: '', location: '', emotion: '' });
      setShowAddModal(false);
      loadMemories();
      setError('Memory added successfully!');
    } catch (error) {
      console.error('Error adding memory:', error);
      setError('Failed to add memory');
    }
  };

  const handleDeleteMemory = (id: string) => {
    if (!status.hasAccess || status.accessBlocked) {
      setError('Managing memories requires an active subscription. Please upgrade to continue.');
      return;
    }

    setError('Are you sure you want to delete this memory?');
    setTimeout(async () => {
      const supabase = getSupabase();
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) {
        console.error('Error deleting memory:', error.message);
        setError('Failed to delete memory.');
      } else {
        setError('Memory deleted.');
        loadMemories();
      }
    }, 2000);
  };

  const extractTags = (content: string): string[] => {
    // Simple tag extraction based on common keywords
    const keywords = [
      'meeting', 'call', 'project', 'work', 'deadline', 'presentation',
      'family', 'friend', 'dinner', 'lunch', 'coffee', 'birthday',
      'travel', 'vacation', 'trip', 'flight', 'hotel', 'restaurant',
      'movie', 'book', 'music', 'concert', 'event', 'party',
      'shopping', 'exercise', 'gym', 'run', 'walk', 'sport',
    ];

    const words = content.toLowerCase().split(/\s+/);
    return keywords.filter(keyword => words.includes(keyword));
  };

  const filteredMemories = memories.filter(memory =>
    memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEmotionIcon = (emotion: string) => {
    switch (emotion?.toLowerCase().trim()) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'excited': return '🎉';
      case 'worried': return '😟';
      case 'angry': return '😠';
      case 'calm': return '😌';
      default: return '💭';
    }
  };

  const styles = createStyles(colors, layout);

  // Show access blocked screen if user doesn't have access
  if (status.accessBlocked || !status.hasAccess) {
    return (
      <View style={styles.blockedContainer}>
        <LinearGradient
          colors={colors.gradient}
          style={styles.blockedBackground}
        >
          <ResponsiveContainer>
            <View style={styles.blockedContent}>
              <View style={styles.blockedIconContainer}>
                <Lock size={layout.isMobile ? 48 : 64} color={colors.background} strokeWidth={1.5} />
              </View>
              <Text style={styles.blockedTitle}>Memory Access Restricted</Text>
              <Text style={styles.blockedSubtitle}>
                {status.isExpired 
                  ? 'Your trial has expired. Subscribe to access your AI memory assistant and continue building your cognitive twin.'
                  : 'AI memory features require an active subscription to store and query your personal memories securely.'
                }
              </Text>
              <TouchableOpacity
                style={styles.blockedButton}
                onPress={() => router.push('/(tabs)/subscription')}
              >
                <Text style={styles.blockedButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            </View>
          </ResponsiveContainer>
        </LinearGradient>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={colors.gradient}
          style={styles.loadingGradient}
        >
          <Brain size={48} color={colors.background} strokeWidth={1.5} />
        </LinearGradient>
        <Text style={styles.loadingText}>Loading your memories...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>AI Memory Assistant</Text>
            <Text style={styles.headerSubtitle}>Ask me anything about your memories</Text>
          </View>

          {/* AI Chat Input */}
          <View style={styles.chatContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.chatInputContainer}
            >
              <Sparkles size={20} color="rgba(255, 255, 255, 0.8)" strokeWidth={1.5} />
              <TextInput
                style={styles.chatInput}
                placeholder="Ask about your memories..."
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleAIQuery}
              />
            </LinearGradient>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleAIQuery}
              disabled={!chatInput.trim()}
            >
              <LinearGradient
                colors={chatInput.trim() ? ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color={colors.background} strokeWidth={1.5} />
                {layout.isMobile && <Text style={styles.addButtonText}>Send</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </LinearGradient>

      {/* Content */}
      <ResponsiveContainer style={styles.content}>
        {/* Error Display */}
        {error && (
          <View style={{
            backgroundColor: colors.primary + '15',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}>
            <Text style={{ color: colors.primary, fontSize: layout.fontSize.small, fontWeight: '500' }}>
              {error}
            </Text>
          </View>
        )}

        {/* Search and Add */}
        <View style={styles.controls}>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.searchContainer}
          >
            <Search size={20} color={colors.textLight} strokeWidth={1.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search memories..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </LinearGradient>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.addButtonGradient}
            >
              <Plus size={24} color={colors.background} strokeWidth={2} />
              {layout.isMobile && <Text style={styles.addButtonText}>Add Memory</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Memories List */}
        <ScrollView style={styles.memoriesList} showsVerticalScrollIndicator={false}>
          {filteredMemories.length > 0 ? (
            filteredMemories.map((memory) => (
              <LinearGradient
                key={memory.id}
                colors={colors.cardGradient}
                style={styles.memoryCard}
              >
                <View style={styles.memoryHeader}>
                  <LinearGradient
                    colors={[colors.primary + '20', colors.primary + '10']}
                    style={styles.memoryIcon}
                  >
                    <Brain size={20} color={colors.primary} strokeWidth={1.5} />
                  </LinearGradient>
                  <View style={styles.memoryInfo}>
                    <Text style={styles.memoryTitle}>{memory.title}</Text>
                    <Text style={styles.memoryDate}>
                      {new Date(memory.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {memory.emotion && (
                    <Text style={styles.emotionIcon}>
                      {getEmotionIcon(memory.emotion)}
                    </Text>
                  )}
                </View>

                <Text style={styles.memoryContent}>{memory.content}</Text>

                {/* Metadata */}
                <View style={styles.memoryMeta}>
                  {memory.person && (
                    <View style={styles.metaItem}>
                      <User size={14} color={colors.textSecondary} strokeWidth={1.5} />
                      <Text style={styles.metaText}>{memory.person}</Text>
                    </View>
                  )}
                  {memory.location && (
                    <View style={styles.metaItem}>
                      <MapPin size={14} color={colors.textSecondary} strokeWidth={1.5} />
                      <Text style={styles.metaText}>{memory.location}</Text>
                    </View>
                  )}
                </View>

                {/* Tags */}
                {memory.tags.length > 0 && (
                  <View style={styles.tags}>
                    {memory.tags.map((tag, index) => (
                      <LinearGradient
                        key={index}
                        colors={[colors.primary + '15', colors.primary + '08']}
                        style={styles.tag}
                      >
                        <Text style={styles.tagText}>#{tag}</Text>
                      </LinearGradient>
                    ))}
                  </View>
                )}

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteMemory(memory.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </LinearGradient>
            ))
          ) : (
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.emptyContainer}
            >
              <View style={styles.emptyIconContainer}>
                <Brain size={layout.isMobile ? 48 : 64} color={colors.textLight} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No memories found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try a different search term' : 'Start by adding your first memory'}
              </Text>
              <TouchableOpacity 
                style={styles.emptyAction}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={16} color={colors.primary} strokeWidth={2} />
                <Text style={styles.emptyActionText}>Add Memory</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </ScrollView>
      </ResponsiveContainer>

      {/* Add Memory Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient
          colors={colors.gradientSubtle}
          style={styles.modal}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Memory</Text>
            <TouchableOpacity 
              onPress={addMemory}
              style={styles.modalSaveButton}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.modalSaveGradient}
              >
                <Text style={styles.saveText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Meeting with team about project X"
                placeholderTextColor={colors.textLight}
                value={newMemory.title}
                onChangeText={(text) => setNewMemory({ ...newMemory, title: text })}
              />
            </LinearGradient>

            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Content *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe what happened, what was discussed, or what you want to remember..."
                placeholderTextColor={colors.textLight}
                value={newMemory.content}
                onChangeText={(text) => setNewMemory({ ...newMemory, content: text })}
                multiline
                numberOfLines={4}
              />
            </LinearGradient>

            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Person</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Who was involved?"
                placeholderTextColor={colors.textLight}
                value={newMemory.person}
                onChangeText={(text) => setNewMemory({ ...newMemory, person: text })}
              />
            </LinearGradient>

            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Where did this happen?"
                placeholderTextColor={colors.textLight}
                value={newMemory.location}
                onChangeText={(text) => setNewMemory({ ...newMemory, location: text })}
              />
            </LinearGradient>

            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Emotion</Text>
              <TextInput
                style={styles.textInput}
                placeholder="How did you feel? (happy, excited, worried, etc.)"
                placeholderTextColor={colors.textLight}
                value={newMemory.emotion}
                onChangeText={(text) => setNewMemory({ ...newMemory, emotion: text })}
              />
            </LinearGradient>
          </ScrollView>
        </LinearGradient>
      </Modal>
    </View>
  );
}