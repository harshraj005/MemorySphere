import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getSupabase } from '@/lib/supabase';
import { User, Settings, Download, Shield, CircleHelp as HelpCircle, LogOut, Moon, Sun, Crown, Mail, Calendar, Trash2, ChevronRight, X } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, theme, themePreference, setThemePreference } = useTheme();
  const { status } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be prepared and sent to your email address. This may take a few minutes.',
      [
        { text: 'Cancel' },
        { text: 'Export', onPress: () => console.log('Export data') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation.toUpperCase() !== 'DELETE') {
      Alert.alert('Error', 'Please type "DELETE" to confirm account deletion.');
      return;
    }

    setDeleting(true);

    try {
      const supabase = getSupabase();
      
      // Call the database function to delete the user account completely
      const { error } = await supabase.rpc('delete_my_account');

      if (error) {
        console.error('Error deleting account:', error);
        Alert.alert(
          'Error',
          'Failed to delete account. Please try again or contact support.'
        );
        return;
      }

      // Sign out the user (this will handle the auth cleanup on the client side)
      await signOut();
      
      Alert.alert(
        'Account Deleted',
        'Your account and all associated data have been permanently deleted. You have been signed out.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );

    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Error',
        'Failed to delete account. Please try again or contact support.'
      );
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    }
  };

  const getThemeIcon = () => {
    if (themePreference === 'system') {
      return theme === 'dark' ? Moon : Sun;
    }
    return themePreference === 'dark' ? Moon : Sun;
  };

  const getThemeText = () => {
    switch (themePreference) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'System';
    }
  };

  const handleThemeChange = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(themePreference);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemePreference(themes[nextIndex]);
  };

  const styles = createStyles(colors);

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={colors.gradient}
          style={styles.header}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <User size={32} color={colors.background} strokeWidth={2} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {status.isActive && (
                <View style={styles.premiumBadge}>
                  <Crown size={12} color={colors.accent} />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsList}>
            {/* Theme */}
            <TouchableOpacity style={styles.settingItem} onPress={handleThemeChange}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  {React.createElement(getThemeIcon(), { size: 20, color: colors.primary })}
                </View>
                <View>
                  <Text style={styles.settingTitle}>Theme</Text>
                  <Text style={styles.settingSubtitle}>{getThemeText()}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            {/* Subscription */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Crown size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Subscription</Text>
                  <Text style={styles.settingSubtitle}>
                    {status.isActive ? 'Premium Active' : 
                     status.isTrialing ? `${status.trialDaysLeft} days left` : 'Free Plan'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            {/* Export Data */}
            <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Download size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Export Data</Text>
                  <Text style={styles.settingSubtitle}>Download all your memories and tasks</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            {/* Privacy */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Privacy & Security</Text>
                  <Text style={styles.settingSubtitle}>Manage your data privacy</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            {/* Help */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <HelpCircle size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingSubtitle}>Get help and contact support</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <LogOut size={20} color={colors.error} />
                </View>
                <Text style={[styles.settingTitle, { color: colors.error }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Trash2 size={20} color={colors.error} />
                </View>
                <Text style={[styles.settingTitle, { color: colors.error }]}>Delete Account</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>MemorySphere</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Your AI-powered cognitive twin for memories and productivity
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.warningContainer}>
              <Trash2 size={48} color={colors.error} />
              <Text style={styles.warningTitle}>Permanently Delete Account</Text>
              <Text style={styles.warningText}>
                This action cannot be undone. All your memories, tasks, and data will be permanently deleted from our servers.
              </Text>
              <Text style={styles.warningNote}>
                Note: Your account will be completely removed and you'll need to create a new account to use the app again.
              </Text>
            </View>

            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationLabel}>
                Type "DELETE" to confirm account deletion:
              </Text>
              <TextInput
                style={styles.confirmationInput}
                placeholder="DELETE"
                placeholderTextColor={colors.textLight}
                value={deleteConfirmation}
                onChangeText={setDeleteConfirmation}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  (deleteConfirmation.toUpperCase() !== 'DELETE' || deleting) && styles.deleteButtonDisabled
                ]}
                onPress={confirmDeleteAccount}
                disabled={deleteConfirmation.toUpperCase() !== 'DELETE' || deleting}
              >
                <Text style={styles.deleteButtonText}>
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  premiumText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  settingsList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
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
  modalContent: {
    flex: 1,
    padding: 24,
  },
  warningContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  warningNote: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  confirmationContainer: {
    marginBottom: 32,
  },
  confirmationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  confirmationInput: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.error,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  deleteButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.error,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});