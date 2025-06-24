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
import { getSupabase, Task } from '@/lib/supabase';
import { SquareCheck as CheckSquare, Plus, Calendar, Clock, CircleAlert as AlertCircle, Target, Trash2, CreditCard as Edit3, Sparkles } from 'lucide-react-native';

export default function TasksScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
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
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
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
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
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
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const supabase = getSupabase();
              const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

              if (error) throw error;
              loadTasks();
            } catch (error) {
              console.error('Error deleting task:', error);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle size={16} color={colors.error} />;
      case 'medium': return <Clock size={16} color={colors.warning} />;
      case 'low': return <Target size={16} color={colors.success} />;
      default: return null;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CheckSquare size={48} color={colors.primary} />
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
      >
        <Text style={styles.headerTitle}>AI To-Do List</Text>
        <Text style={styles.headerSubtitle}>Smart task management with natural language</Text>
        
        {/* AI Task Input */}
        <View style={styles.aiContainer}>
          <View style={styles.aiInputContainer}>
            <Sparkles size={20} color="rgba(255, 255, 255, 0.7)" />
            <TextInput
              style={styles.aiInput}
              placeholder="Remind me to call John tomorrow"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={aiInput}
              onChangeText={setAiInput}
              onSubmitEditing={handleAITaskParsing}
            />
          </View>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={handleAITaskParsing}
            disabled={!aiInput.trim()}
          >
            <Plus size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {pendingTasks.filter(t => t.due_date && isOverdue(t.due_date)).length}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        {/* Tasks List */}
        <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Tasks</Text>
              {pendingTasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <TouchableOpacity
                    style={styles.taskCheckbox}
                    onPress={() => toggleTask(task.id, task.completed)}
                  >
                    <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                      {task.completed && <CheckSquare size={16} color={colors.background} />}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      <View style={styles.taskActions}>
                        {getPriorityIcon(task.priority)}
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => deleteTask(task.id)}
                        >
                          <Trash2 size={16} color={colors.textLight} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {task.description && (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    )}

                    <View style={styles.taskMeta}>
                      {task.due_date && (
                        <View style={styles.metaItem}>
                          <Calendar size={14} color={isOverdue(task.due_date) ? colors.error : colors.textSecondary} />
                          <Text style={[
                            styles.metaText,
                            isOverdue(task.due_date) && styles.overdueText
                          ]}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.metaItem}>
                        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                        <Text style={styles.metaText}>{task.priority} priority</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Completed Tasks</Text>
              {completedTasks.map((task) => (
                <View key={task.id} style={[styles.taskCard, styles.completedTaskCard]}>
                  <TouchableOpacity
                    style={styles.taskCheckbox}
                    onPress={() => toggleTask(task.id, task.completed)}
                  >
                    <View style={[styles.checkbox, styles.checkboxChecked]}>
                      <CheckSquare size={16} color={colors.background} />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.taskContent}>
                    <View style={styles.taskHeader}>
                      <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => deleteTask(task.id)}
                      >
                        <Trash2 size={16} color={colors.textLight} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <View style={styles.emptyContainer}>
              <CheckSquare size={64} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Use AI to add your first task with natural language
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Manual Add Button */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Add Task Modal */}
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
            <Text style={styles.modalTitle}>Add Task</Text>
            <TouchableOpacity onPress={addTask}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.textLight}
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      newTask.priority === priority && styles.priorityButtonActive,
                      { borderColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setNewTask({ ...newTask, priority: priority as any })}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      newTask.priority === priority && { color: getPriorityColor(priority) }
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Due Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textLight}
                value={newTask.due_date}
                onChangeText={(text) => setNewTask({ ...newTask, due_date: text })}
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
  aiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  aiInput: {
    flex: 1,
    height: 48,
    color: colors.background,
    fontSize: 16,
    marginLeft: 12,
  },
  aiButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tasksList: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedTaskCard: {
    opacity: 0.7,
  },
  taskCheckbox: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  overdueText: {
    color: colors.error,
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
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
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    height: 80,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  priorityButtonActive: {
    backgroundColor: colors.surface,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});