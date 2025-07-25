import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getSupabase } from '@/lib/supabase';
import { User, Settings, Shield, CircleHelp as HelpCircle, LogOut, Moon, Sun, Crown, Calendar, Trash2, ChevronRight, X } from 'lucide-react-native';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '400',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
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
  },
  statIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsList: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  appInfo: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  appDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 32,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  warningContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.error + '15',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.error,
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmationLabel: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: colors.textSecondary,
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, theme, themePreference, setThemePreference } = useTheme();
  const { status } = useSubscription();
  const { width } = useWindowDimensions();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = createStyles(colors);

  const handleSignOut = () => {
    setError('Are you sure you want to sign out?');
    setTimeout(() => {
      signOut();
      router.replace('/(auth)/login');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation.toUpperCase() !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const supabase = getSupabase();
      
      // Call the database function to delete the user account completely
      const { error } = await supabase.rpc('delete_my_account');

      if (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account. Please try again or contact support.');
        return;
      }

      // Sign out the user (this will handle the auth cleanup on the client side)
      await signOut();
      
      setError('Account deleted successfully. You have been signed out.');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);

    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again or contact support.');
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

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={colors.gradient}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileInfo}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
              style={styles.avatar}
            >
              <User size={32} color={colors.background} strokeWidth={1.5} />
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {status.isActive && (
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.premiumBadge}
                >
                  <Crown size={12} color={colors.background} strokeWidth={1.5} />
                  <Text style={styles.premiumText}>Premium</Text>
                </LinearGradient>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Error Display */}
        {error && (
          <View style={styles.section}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Stats</Text>
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <User size={20} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Memories</Text>
            </LinearGradient>
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Settings size={20} color={colors.secondary} strokeWidth={1.5} />
              </View>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </LinearGradient>
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Calendar size={20} color={colors.success} strokeWidth={1.5} />
              </View>
              <Text style={styles.statNumber}>
                {user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.settingsList}
          >
            {/* Theme */}
            <TouchableOpacity style={styles.settingItem} onPress={handleThemeChange}>
              <View style={styles.settingLeft}>
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '10']}
                  style={styles.settingIcon}
                >
                  {React.createElement(getThemeIcon(), { size: 20, color: colors.primary, strokeWidth: 1.5 })}
                </LinearGradient>
                <View>
                  <Text style={styles.settingTitle}>Theme</Text>
                  <Text style={styles.settingSubtitle}>{getThemeText()}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Subscription */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <View style={styles.settingLeft}>
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '10']}
                  style={styles.settingIcon}
                >
                  <Crown size={20} color={colors.primary} strokeWidth={1.5} />
                </LinearGradient>
                <View>
                  <Text style={styles.settingTitle}>Subscription</Text>
                  <Text style={styles.settingSubtitle}>
                    {status.isActive ? 'Premium Active' : 
                     status.isTrialing ? `${status.trialDaysLeft} days left` : 'Free Plan'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Privacy & Security */}
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => router.push('/(tabs)/privacy')}
            >
              <View style={styles.settingLeft}>
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '10']}
                  style={styles.settingIcon}
                >
                  <Shield size={20} color={colors.primary} strokeWidth={1.5} />
                </LinearGradient>
                <View>
                  <Text style={styles.settingTitle}>Privacy & Security</Text>
                  <Text style={styles.settingSubtitle}>Manage your data privacy</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(tabs)/help')}
            >
              <View style={styles.settingLeft}>
                <LinearGradient
                  colors={[colors.primary + '20', colors.primary + '10']}
                  style={styles.settingIcon}
                >
                  <HelpCircle size={20} color={colors.primary} strokeWidth={1.5} />
                </LinearGradient>
                <View>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingSubtitle}>Get help and contact support</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textLight} strokeWidth={1.5} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.settingsList}
          >
            <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
              <View style={styles.settingLeft}>
                <LinearGradient
                  colors={[colors.error + '20', colors.error + '10']}
                  style={styles.settingIcon}
                >
                  <LogOut size={20} color={colors.error} strokeWidth={1.5} />
                </LinearGradient>
                <Text style={[styles.settingTitle, { color: colors.error }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
              <View style={styles.settingLeft}>
                <LinearGradient
                  colors={[colors.error + '20', colors.error + '10']}
                  style={styles.settingIcon}
                >
                  <Trash2 size={20} color={colors.error} strokeWidth={1.5} />
                </LinearGradient>
                <Text style={[styles.settingTitle, { color: colors.error }]}>Delete Account</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.appInfo}
          >
            <Text style={styles.appName}>MemorySphere</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Your AI-powered cognitive twin for memories and productivity
            </Text>
            <Text style={styles.appDescription}>
              Built with ❤️ using Bolt.new AI
            </Text>
          </LinearGradient>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <LinearGradient
          colors={colors.gradientSubtle}
          style={styles.modal}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowDeleteModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            <LinearGradient
              colors={colors.cardGradient}
              style={styles.warningContainer}
            >
              <View style={styles.warningIconContainer}>
                <Trash2 size={48} color={colors.error} strokeWidth={1.5} />
              </View>
              <Text style={styles.warningTitle}>Permanently Delete Account</Text>
              <Text style={styles.warningText}>
                This action cannot be undone. All your memories, tasks, and data will be permanently deleted from our servers.
              </Text>
              <Text style={styles.warningNote}>
                Note: Your account will be completely removed and you'll need to create a new account to use the app again.
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={colors.cardGradient}
              style={styles.confirmationContainer}
            >
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
            </LinearGradient>

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
                <LinearGradient
                  colors={deleteConfirmation.toUpperCase() === 'DELETE' && !deleting ? [colors.error, colors.error + 'CC'] : ['#999', '#777']}
                  style={styles.deleteButtonGradient}
                >
                  <Text style={styles.deleteButtonText}>
                    {deleting ? 'Deleting...' : 'Delete Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Modal>
    </>
  );
}