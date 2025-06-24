import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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
} from 'lucide-react-native';

export default function MemoryScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add Memory Form
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    person: '',
    location: '',
    emotion: '',
  });

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = () => {
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
      Alert.alert(
        'AI Memory Assistant',
        `I found ${relevantMemories.length} relevant memories about "${chatInput}". Here's what I remember:\n\n${relevantMemories[0].title}: ${relevantMemories[0].content.substring(0, 100)}...`,
        [{ text: 'View Details', onPress: () => {} }, { text: 'OK' }]
      );
    } else {
      Alert.alert(
        'AI Memory Assistant',
        "I don't have any memories matching that query yet. Try adding more memories to expand my knowledge about your experiences."
      );
    }

    setChatInput('');
  };

  const addMemory = async () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
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
      Alert.alert('Success', 'Memory added successfully!');
    } catch (error) {
      console.error('Error adding memory:', error);
      Alert.alert('Error', 'Failed to add memory');
    }
  };

  const handleDeleteMemory = (id: string) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const supabase = getSupabase();
            const { error } = await supabase.from('memories').delete().eq('id', id);
            if (error) {
              console.error('Error deleting memory:', error.message);
              Alert.alert('Error', 'Failed to delete memory.');
            } else {
              Alert.alert('Deleted', 'Memory deleted.');
              loadMemories();
            }
          },
        },
      ]
    );
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
    switch (emotion?.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'excited': return '🎉';
      case 'worried': return '😟';
      case 'angry': return '😠';
      case 'calm': return '😌';
      default: return '💭';
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Brain size={48} color={colors.primary} />
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
      >
        <Text style={styles.headerTitle}>AI Memory Assistant</Text>
        <Text style={styles.headerSubtitle}>Ask me anything about your memories</Text>
              
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Search and Add */}
        <View style={styles.controls}>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tell mzzzz"
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Memories List */}
        <ScrollView style={styles.memoriesList} showsVerticalScrollIndicator={false}>
          {filteredMemories.length > 0 ? (
            filteredMemories.map((memory) => (
              <View key={memory.id} style={styles.memoryCard}>
                <View style={styles.memoryHeader}>
                  <View style={styles.memoryIcon}>
                    <Brain size={20} color={colors.primary} />
                  </View>
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
                      <User size={14} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{memory.person}</Text>
                    </View>
                  )}
                  {memory.location && (
                    <View style={styles.metaItem}>
                      <MapPin size={14} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{memory.location}</Text>
                    </View>
                  )}
                </View>

                {/* Tags */}
                {memory.tags.length > 0 && (
                  <View style={styles.tags}>
                    {memory.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteMemory(memory.id)}
                  style={{ alignSelf: 'flex-end', marginTop: 8 }}
                >
                  <Text style={{ color: colors.danger || '#e53935', fontSize: 12 }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Brain size={64} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No memories found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try a different search term' : 'Start by adding your first memory'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Memory Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Memory</Text>
            <TouchableOpacity onPress={addMemory}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Meeting with team about project X"
                placeholderTextColor={colors.textLight}
                value={newMemory.title}
                onChangeText={(text) => setNewMemory({ ...newMemory, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Person</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Who was involved?"
                placeholderTextColor={colors.textLight}
                value={newMemory.person}
                onChangeText={(text) => setNewMemory({ ...newMemory, person: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Where did this happen?"
                placeholderTextColor={colors.textLight}
                value={newMemory.location}
                onChangeText={(text) => setNewMemory({ ...newMemory, location: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Emotion</Text>
              <TextInput
                style={styles.textInput}
                placeholder="How did you feel? (happy, excited, worried, etc.)"
                placeholderTextColor={colors.textLight}
                value={newMemory.emotion}
                onChangeText={(text) => setNewMemory({ ...newMemory, emotion: text })}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  chatContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 4,
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    color: colors.background,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoriesList: {
    flex: 1,
  },
  memoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memoryIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memoryInfo: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  memoryDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emotionIcon: {
    fontSize: 20,
  },
  memoryContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  memoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primary + '15',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
});
