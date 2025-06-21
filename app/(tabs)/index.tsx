import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getSupabase, Memory, Task } from '@/lib/supabase';
import { Brain, MessageCircle, SquareCheck as CheckSquare, Sparkles, Calendar, Target, TrendingUp } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { status } = useSubscription();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Remove the redirect logic from here since it's handled in index.tsx
  // This allows the home screen to render properly for users with access

  const loadData = async () => {
    try {
      const supabase = getSupabase();
      
      // Load recent memories
      const { data: memoriesData } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Load pending tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setMemories(memoriesData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Brain size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading your cognitive twin...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={colors.gradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.first_name} 👋
            </Text>
            <Text style={styles.subtitle}>
              Ready to expand your cognitive abilities?
            </Text>
          </View>
          <View style={styles.brainIcon}>
            <Brain size={32} color={colors.background} strokeWidth={2} />
          </View>
        </View>

        {/* Trial Banner */}
        {status.isTrialing && (
          <View style={styles.trialBanner}>
            <Sparkles size={16} color={colors.accent} />
            <Text style={styles.trialText}>
              {status.trialDaysLeft} days left in your free trial
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/memory')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.actionGradient}
            >
              <MessageCircle size={24} color={colors.background} />
              <Text style={styles.actionText}>Ask MemorySphere</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondaryLight]}
              style={styles.actionGradient}
            >
              <CheckSquare size={24} color={colors.background} />
              <Text style={styles.actionText}>Add Task</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Smart Memory */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Smart Memory</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/memory')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {memories.length > 0 ? (
          <View style={styles.memoryCard}>
            <View style={styles.memoryHeader}>
              <View style={styles.memoryIcon}>
                <Brain size={20} color={colors.primary} />
              </View>
              <View style={styles.memoryInfo}>
                <Text style={styles.memoryTitle}>{memories[0].title}</Text>
                <Text style={styles.memoryDate}>
                  {new Date(memories[0].created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text style={styles.memoryContent} numberOfLines={3}>
              {memories[0].content}
            </Text>
            {memories[0].tags.length > 0 && (
              <View style={styles.tags}>
                {memories[0].tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Brain size={32} color={colors.textLight} />
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>
              Start by adding your first memory or conversation
            </Text>
          </View>
        )}
      </View>

      {/* Top Tasks for Today */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Tasks for Today</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {tasks.length > 0 ? (
          <View style={styles.tasksList}>
            {tasks.slice(0, 3).map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                {task.due_date && (
                  <View style={styles.taskMeta}>
                    <Calendar size={14} color={colors.textSecondary} />
                    <Text style={styles.taskDate}>
                      {new Date(task.due_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <CheckSquare size={32} color={colors.textLight} />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first task to get started
            </Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Brain size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color={colors.secondary} />
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={colors.success} />
            <Text style={styles.statNumber}>
              {tasks.filter(t => t.completed).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  brainIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  trialText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  memoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
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
  memoryContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
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
  tasksList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});