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
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { getSupabase, Memory, Task } from '@/lib/supabase';
import { Brain, MessageCircle, SquareCheck as CheckSquare, Sparkles, Calendar, Target, TrendingUp, Plus, ArrowRight, Lock } from 'lucide-react-native';

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
    flexDirection: layout.isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: layout.isMobile ? 'center' : 'flex-start',
    marginBottom: 20,
    gap: layout.isMobile ? 16 : 0,
  },
  headerText: {
    flex: 1,
    alignItems: layout.isMobile ? 'center' : 'flex-start',
  },
  greeting: {
    fontSize: layout.fontSize.xlarge,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: layout.isMobile ? 'center' : 'left',
  },
  subtitle: {
    fontSize: layout.fontSize.medium,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
    lineHeight: 22,
    textAlign: layout.isMobile ? 'center' : 'left',
  },
  brainIconContainer: {
    marginLeft: layout.isMobile ? 0 : 16,
  },
  brainIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trialBanner: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  trialBannerGradient: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: layout.isMobile ? 8 : 0,
  },
  trialText: {
    color: colors.background,
    fontSize: layout.fontSize.small,
    fontWeight: '600',
    marginLeft: layout.isMobile ? 0 : 8,
    flex: 1,
    textAlign: layout.isMobile ? 'center' : 'left',
  },
  upgradeNowButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  upgradeNowText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  warningBanner: {
    alignSelf: 'stretch',
  },
  warningBannerGradient: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: layout.isMobile ? 8 : 0,
  },
  warningText: {
    color: colors.background,
    fontSize: layout.fontSize.small,
    fontWeight: '600',
    marginLeft: layout.isMobile ? 0 : 8,
    flex: 1,
    textAlign: layout.isMobile ? 'center' : 'left',
  },
  section: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: layout.fontSize.large,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 16,
    opacity: 0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: layout.fontSize.small,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  quickActions: {
    gap: 16,
  },
  actionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  actionGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.isMobile ? 120 : 140,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: colors.background,
    fontSize: layout.fontSize.medium,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: layout.fontSize.small,
    fontWeight: '500',
    textAlign: 'center',
  },
  memoryCard: {
    borderRadius: 20,
    padding: 24,
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
  memoryContent: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  tasksList: {
    gap: 12,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 20,
    padding: layout.isMobile ? 24 : 32,
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
    width: layout.isMobile ? 56 : 64,
    height: layout.isMobile ? 56 : 64,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: layout.fontSize.small,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
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
  statsContainer: {
    gap: 16,
  },
  statCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: layout.isMobile ? 100 : 120,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: layout.isMobile ? 24 : 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { status } = useSubscription();
  const layout = useResponsiveLayout();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Redirect to locked screen if access is blocked
  useEffect(() => {
    if (!status.hasAccess && status.accessBlocked && !loading) {
      router.replace('/locked');
    }
  }, [status.hasAccess, status.accessBlocked, loading]);

  const loadData = async () => {
    // Only load data if user has access
    if (!status.hasAccess || status.accessBlocked) {
      setLoading(false);
      return;
    }

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
              <Text style={styles.blockedTitle}>Access Restricted</Text>
              <Text style={styles.blockedSubtitle}>
                {status.isExpired 
                  ? 'Your trial has expired. Subscribe to continue using MemorySphere.'
                  : 'You need an active subscription to access this feature.'
                }
              </Text>
              <TouchableOpacity
                style={styles.blockedButton}
                onPress={() => router.push('/(tabs)/subscription')}
              >
                <Text style={styles.blockedButtonText}>View Subscription Plans</Text>
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
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={colors.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ResponsiveContainer>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.first_name} 👋
              </Text>
              <Text style={styles.subtitle}>
                Ready to expand your cognitive abilities?
              </Text>
            </View>
            <View style={styles.brainIconContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                style={styles.brainIcon}
              >
                <Brain size={28} color={colors.background} strokeWidth={1.5} />
              </LinearGradient>
            </View>
          </View>

          {/* Trial Banner */}
          {status.isTrialing && (
            <View style={styles.trialBanner}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.trialBannerGradient}
              >
                <Sparkles size={16} color={colors.background} />
                <Text style={styles.trialText}>
                  {status.trialDaysLeft} days left in your free trial
                </Text>
                {status.trialDaysLeft <= 1 && (
                  <TouchableOpacity
                    style={styles.upgradeNowButton}
                    onPress={() => router.push('/(tabs)/subscription')}
                  >
                    <Text style={styles.upgradeNowText}>Upgrade Now</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Expiration Warning */}
          {status.trialDaysLeft <= 1 && status.isTrialing && (
            <View style={styles.warningBanner}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
                style={styles.warningBannerGradient}
              >
                <Lock size={16} color={colors.background} />
                <Text style={styles.warningText}>
                  Trial expires soon! Subscribe to keep your data and continue using MemorySphere.
                </Text>
              </LinearGradient>
            </View>
          )}
        </ResponsiveContainer>
      </LinearGradient>

      <ResponsiveContainer>
        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.sectionDivider} />
          </View>
          <ResponsiveGrid minItemWidth={250} gap={16}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/memory')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionIconContainer}>
                  <MessageCircle size={24} color={colors.background} strokeWidth={1.5} />
                </View>
                <Text style={styles.actionText}>Ask MemorySphere</Text>
                <Text style={styles.actionSubtext}>Chat with your AI twin</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/tasks')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondaryLight]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionIconContainer}>
                  <CheckSquare size={24} color={colors.background} strokeWidth={1.5} />
                </View>
                <Text style={styles.actionText}>Add Task</Text>
                <Text style={styles.actionSubtext}>Smart to-do management</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ResponsiveGrid>
        </View>

        {/* Today's Smart Memory */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Smart Memory</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/memory')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={16} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {memories.length > 0 ? (
            <LinearGradient
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
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIconContainer}>
                <Brain size={layout.isMobile ? 24 : 32} color={colors.textLight} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyText}>No memories yet</Text>
              <Text style={styles.emptySubtext}>
                Start by adding your first memory or conversation
              </Text>
              <TouchableOpacity 
                style={styles.emptyAction}
                onPress={() => router.push('/(tabs)/memory')}
              >
                <Plus size={16} color={colors.primary} strokeWidth={2} />
                <Text style={styles.emptyActionText}>Add Memory</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>

        {/* Top Tasks for Today */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Tasks for Today</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/tasks')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ArrowRight size={16} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {tasks.length > 0 ? (
            <View style={styles.tasksList}>
              {tasks.slice(0, 3).map((task) => (
                <LinearGradient
                  key={task.id}
                  colors={colors.cardGradient}
                  style={styles.taskCard}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskLeft}>
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                      <Text style={styles.taskTitle}>{task.title}</Text>
                    </View>
                  </View>
                  {task.due_date && (
                    <View style={styles.taskMeta}>
                      <Calendar size={14} color={colors.textSecondary} strokeWidth={1.5} />
                      <Text style={styles.taskDate}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              ))}
            </View>
          ) : (
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIconContainer}>
                <CheckSquare size={layout.isMobile ? 24 : 32} color={colors.textLight} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first task to get started
              </Text>
              <TouchableOpacity 
                style={styles.emptyAction}
                onPress={() => router.push('/(tabs)/tasks')}
              >
                <Plus size={16} color={colors.primary} strokeWidth={2} />
                <Text style={styles.emptyActionText}>Add Task</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.sectionDivider} />
          </View>
          <ResponsiveGrid minItemWidth={120} gap={16}>
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Brain size={24} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.statNumber}>{memories.length}</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Target size={24} color={colors.secondary} strokeWidth={1.5} />
              </View>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Active Tasks</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={colors.success} strokeWidth={1.5} />
              </View>
              <Text style={styles.statNumber}>
                {tasks.filter(t => t.completed).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </LinearGradient>
          </ResponsiveGrid>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ResponsiveContainer>
    </ScrollView>
  );
}