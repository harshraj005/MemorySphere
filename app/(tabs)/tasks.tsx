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
import { getSupabase, Task } from '@/lib/supabase';
import {
  SquareCheck as CheckSquare,
  Plus,
  Calendar,
  Clock,
  CircleAlert as AlertCircle,
  Target,
  Trash2,
  Sparkles,
  X,
  Check,
  Lock,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  aiContainer: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: layout.isMobile ? '100%' : 'auto',
  },
  aiInput: {
    flex: 1,
    height: 48,
    color: colors.background,
    fontSize: layout.fontSize.medium,
    marginLeft: 12,
    fontWeight: '500',
  },
  aiButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: layout.isMobile ? 12 : 0,
  },
  aiButtonGradient: {
    width: layout.isMobile ? '100%' : 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: layout.isMobile ? 120 : 48,
    flexDirection: layout.isMobile ? 'row' : 'column',
    gap: layout.isMobile ? 8 : 0,
  },
  aiButtonText: {
    color: colors.background,
    fontSize: layout.fontSize.small,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  stats: {
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
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
  statNumber: {
    fontSize: layout.isMobile ? 24 : 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tasksList: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: layout.fontSize.large,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text,
    letterSpacing: -0.3,
  },
  taskCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedTaskCard: {
    opacity: 0.7,
  },
  taskCheckbox: {
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: layout.isMobile ? 'flex-start' : 'center',
    marginBottom: 8,
    gap: layout.isMobile ? 8 : 0,
  },
  taskTitle: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 6,
  },
  taskDescription: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    alignItems: layout.isMobile ? 'flex-start' : 'center',
    gap: layout.isMobile ? 8 : 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: layout.fontSize.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  overdueText: {
    color: colors.error,
    fontWeight: '600',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  fabButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
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
  priorityButtons: {
    flexDirection: layout.isMobile ? 'column' : 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  priorityButtonActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  priorityButtonText: {
    fontSize: layout.fontSize.medium,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  datePickerText: {
    fontSize: layout.fontSize.medium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  errorText: {
    color: colors.primary,
    fontSize: layout.fontSize.small,
    fontWeight: '500',
  },
});

export default function TasksScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { status } = useSubscription();
  const layout = useResponsiveLayout();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Redirect to locked screen if access is blocked
  useEffect(() => {
    if (!status.hasAccess && status.accessBlocked && !loading) {
      router.replace('/locked');
    }
  }, [status.hasAccess, status.accessBlocked, loading]);

  const loadTasks = async () => {
    // Only load data if user has access
    if (!status.hasAccess || status.accessBlocked) {
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestionMap: Record<string, string[]> = {
    submit: ['Review before submission', 'Email document'],
    meeting: ['Prepare agenda', 'Send meeting invite'],
    call: ['Note down points to discuss', 'Send follow-up email'],
    buy: ['Check offers online', 'Compare prices before buying'],
    workout: ['Stretch beforehand', 'Log workout stats'],
  };

  const handleAITaskParsing = () => {
    if (!status.hasAccess || status.accessBlocked) {
      setError('AI task parsing requires an active subscription. Please upgrade to continue.');
      return;
    }

    if (!aiInput.trim()) return;

    const input = aiInput.toLowerCase();
    const task = { ...newTask };

    const triggerWords = ['remind me to', 'i need to', "don't forget to", 'task:', 'todo:'];
    let title = aiInput;

    for (const trigger of triggerWords) {
      if (input.includes(trigger)) {
        title = aiInput.substring(input.indexOf(trigger) + trigger.length).trim();
        break;
      }
    }

    if (input.includes('urgent') || input.includes('important') || input.includes('asap')) {
      task.priority = 'high';
    } else if (input.includes('low priority') || input.includes('when you have time')) {
      task.priority = 'low';
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (input.includes('tomorrow')) {
      task.due_date = tomorrow.toISOString().split('T')[0];
    } else if (input.includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      task.due_date = nextWeek.toISOString().split('T')[0];
    } else if (input.includes('today')) {
      task.due_date = new Date().toISOString().split('T')[0];
    }

    setNewTask({
      ...task,
      title: title.charAt(0).toUpperCase() + title.slice(1),
    });
    setAiInput('');
    setShowAddModal(true);
  };

  const addTask = async () => {
    if (!status.hasAccess || status.accessBlocked) {
      setError('Adding tasks requires an active subscription. Please upgrade to continue.');
      return;
    }

    if (!newTask.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id: user!.id,
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
        });

      if (error) throw error;

      const suggestions: string[] = [];
      const lowerTitle = newTask.title.toLowerCase();
      Object.keys(suggestionMap).forEach((key) => {
        if (lowerTitle.includes(key)) {
          suggestions.push(...suggestionMap[key]);
        }
      });

      for (const suggestion of suggestions.slice(0, 2)) {
        await supabase.from('tasks').insert({
          user_id: user!.id,
          title: suggestion,
          priority: 'low',
          description: '(Suggested)',
        });
      }

      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowAddModal(false);
      loadTasks();
      setError('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!status.hasAccess || status.accessBlocked) {
      setError('Managing tasks requires an active subscription. Please upgrade to continue.');
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!status.hasAccess || status.accessBlocked) {
      setError('Managing tasks requires an active subscription. Please upgrade to continue.');
      return;
    }

    setError('Are you sure you want to delete this task?');
    setTimeout(async () => {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;
        loadTasks();
        setError('Task deleted successfully.');
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task.');
      }
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={16} color={colors.error} strokeWidth={1.5} />;
      case 'medium':
        return <Clock size={16} color={colors.warning} strokeWidth={1.5} />;
      case 'low':
        return <Target size={16} color={colors.success} strokeWidth={1.5} />;
      default:
        return null;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

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
              <Text style={styles.blockedTitle}>Task Management Restricted</Text>
              <Text style={styles.blockedSubtitle}>
                {status.isExpired 
                  ? 'Your trial has expired. Subscribe to access AI-powered task management and continue organizing your productivity.'
                  : 'Smart task management with AI parsing requires an active subscription to help you stay organized.'
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
          <CheckSquare size={48} color={colors.background} strokeWidth={1.5} />
        </LinearGradient>
        <Text style={styles.loadingText}>Loading your tasks...</Text>
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
            <Text style={styles.headerTitle}>AI To-Do List</Text>
            <Text style={styles.headerSubtitle}>Smart task management with natural language</Text>
          </View>

          {/* AI Task Input */}
          <View style={styles.aiContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.aiInputContainer}
            >
              <Sparkles size={20} color="rgba(255, 255, 255, 0.8)" strokeWidth={1.5} />
              <TextInput
                style={styles.aiInput}
                placeholder="Remind me to call John tomorrow"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={aiInput}
                onChangeText={setAiInput}
                onSubmitEditing={handleAITaskParsing}
              />
            </LinearGradient>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleAITaskParsing}
              disabled={!aiInput.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={aiInput.trim() ? ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.aiButtonGradient}
              >
                <Plus size={20} color={colors.background} strokeWidth={2} />
                {layout.isMobile && <Text style={styles.aiButtonText}>Add Task</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>
      </LinearGradient>

      {/* Content */}
      <ResponsiveContainer style={styles.content}>
        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats */}
        <ResponsiveGrid minItemWidth={100} gap={12} style={styles.stats}>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </LinearGradient>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>
              {pendingTasks.filter((t) => t.due_date && isOverdue(t.due_date)).length}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </LinearGradient>
        </ResponsiveGrid>

        {/* Tasks List */}
        <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Tasks</Text>
              {pendingTasks.map((task) => (
                <LinearGradient
                  key={task.id}
                  colors={colors.cardGradient}
                  style={styles.taskCard}
                >
                  <TouchableOpacity
                    style={styles.taskCheckbox}
                    onPress={() => toggleTask(task.id, task.completed)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={task.completed ? [colors.primary, colors.primaryLight] : ['transparent', 'transparent']}
                      style={[styles.checkbox, task.completed && styles.checkboxChecked]}
                    >
                      {task.completed && <Check size={16} color={colors.background} strokeWidth={2} />}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <Text
                        style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}
                      >
                        {task.title}
                      </Text>
                      <View style={styles.taskActions}>
                        {getPriorityIcon(task.priority)}
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => deleteTask(task.id)}
                        >
                          <Trash2 size={16} color={colors.textLight} strokeWidth={1.5} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {task.description && (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    )}

                    <View style={styles.taskMeta}>
                      {task.due_date && (
                        <View style={styles.metaItem}>
                          <Calendar
                            size={14}
                            color={isOverdue(task.due_date) ? colors.error : colors.textSecondary}
                            strokeWidth={1.5}
                          />
                          <Text
                            style={[styles.metaText, isOverdue(task.due_date) && styles.overdueText]}
                          >
                            {new Date(task.due_date).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.metaItem}>
                        <View
                          style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]}
                        />
                        <Text style={styles.metaText}>{task.priority} priority</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Completed Tasks</Text>
              {completedTasks.map((task) => (
                <LinearGradient
                  key={task.id}
                  colors={colors.cardGradient}
                  style={[styles.taskCard, styles.completedTaskCard]}
                >
                  <TouchableOpacity
                    style={styles.taskCheckbox}
                    onPress={() => toggleTask(task.id, task.completed)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryLight]}
                      style={[styles.checkbox, styles.checkboxChecked]}
                    >
                      <Check size={16} color={colors.background} strokeWidth={2} />
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>{task.title}</Text>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => deleteTask(task.id)}
                      >
                        <Trash2 size={16} color={colors.textLight} strokeWidth={1.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              ))}
            </View>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.emptyContainer}
            >
              <View style={styles.emptyIconContainer}>
                <CheckSquare size={layout.isMobile ? 48 : 64} color={colors.textLight} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Use AI to add your first task with natural language
              </Text>
              <TouchableOpacity 
                style={styles.emptyAction}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={16} color={colors.primary} strokeWidth={2} />
                <Text style={styles.emptyActionText}>Add Task</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </ScrollView>

        {/* Manual Add Button */}
        {!layout.isMobile && (
          <TouchableOpacity 
            style={styles.fabButton} 
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.fabGradient}
            >
              <Plus size={24} color={colors.background} strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ResponsiveContainer>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
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
            <Text style={styles.modalTitle}>Add Task</Text>
            <TouchableOpacity 
              onPress={addTask}
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
              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textLight}
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              />
            </LinearGradient>

            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Add any additional details..."
                placeholderTextColor={colors.textLight}
                value={newTask.description}
                onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                multiline
                numberOfLines={3}
              />
            </LinearGradient>

            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newTask.priority === priority && styles.priorityButtonActive,
                      { borderColor: getPriorityColor(priority) },
                    ]}
                    onPress={() => setNewTask({ ...newTask, priority: priority as any })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        newTask.priority === priority && { color: getPriorityColor(priority) },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>

            {/* Due Date Picker */}
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.inputGroup}
            >
              <Text style={styles.inputLabel}>Due Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Calendar size={16} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={styles.datePickerText}>
                  {newTask.due_date
                    ? new Date(newTask.due_date).toDateString()
                    : 'Pick a date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={newTask.due_date ? new Date(newTask.due_date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      const formattedDate = selectedDate.toISOString().split('T')[0];
                      setNewTask({ ...newTask, due_date: formattedDate });
                    }
                  }}
                />
              )}
            </LinearGradient>
          </ScrollView>
        </LinearGradient>
      </Modal>
    </View>
  );
}