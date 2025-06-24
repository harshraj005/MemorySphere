import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getSupabase } from '@/lib/supabase';
import { 
  Shield, 
  ChevronLeft, 
  Database, 
  MapPin, 
  Bell, 
  Key,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react-native';

interface PrivacySettings {
  dataSharing: boolean;
  locationAccess: boolean;
  notifications: boolean;
}

export default function PrivacySecurityScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: false,
    locationAccess: false,
    notifications: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    // In a real app, you'd load these from your database
    // For now, we'll use localStorage/AsyncStorage simulation
    try {
      // Simulate loading settings - in production, load from your backend
      setSettings({
        dataSharing: false,
        locationAccess: false,
        notifications: true,
      });
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    setLoading(true);
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // In a real app, you'd save these to your database
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Updated ${key} to ${value}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
      // Revert the change on error
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will receive an email with instructions to reset your password.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: async () => {
            try {
              const supabase = getSupabase();
              const { error } = await supabase.auth.resetPasswordForEmail(
                user?.email || '',
                {
                  redirectTo: 'https://your-app.com/reset-password',
                }
              );
              
              if (error) throw error;
              
              Alert.alert(
                'Email Sent',
                'Check your email for password reset instructions.'
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to send reset email');
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.background} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Shield size={24} color={colors.background} />
            <Text style={styles.headerTitle}>Privacy & Security</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Manage your data privacy and security settings
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.settingsList}>
            {/* Data Sharing */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Database size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Data Sharing</Text>
                  <Text style={styles.settingDescription}>
                    Allow anonymous usage analytics to improve the app
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.dataSharing}
                onValueChange={(value) => updateSetting('dataSharing', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings.dataSharing ? colors.primary : colors.textLight}
                disabled={loading}
              />
            </View>

            {/* Location Access */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Location Access</Text>
                  <Text style={styles.settingDescription}>
                    Allow location-based memory suggestions and reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.locationAccess}
                onValueChange={(value) => updateSetting('locationAccess', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings.locationAccess ? colors.primary : colors.textLight}
                disabled={loading}
              />
            </View>

            {/* Notifications */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Bell size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive reminders and updates about your memories and tasks
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings.notifications ? colors.primary : colors.textLight}
                disabled={loading}
              />
            </View>
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <View style={styles.settingsList}>
            {/* Change Password */}
            <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Key size={20} color={colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Change Password</Text>
                  <Text style={styles.settingDescription}>
                    Update your account password for better security
                  </Text>
                </View>
              </View>
              <View style={styles.actionIndicator}>
                <Text style={styles.actionText}>Update</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Protection Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Protection</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Lock size={20} color={colors.success} />
              <Text style={styles.infoTitle}>Your Data is Protected</Text>
            </View>
            <Text style={styles.infoText}>
              All your memories and personal data are encrypted and stored securely. 
              We never share your personal information with third parties without your consent.
            </Text>
            <View style={styles.infoFeatures}>
              <View style={styles.infoFeature}>
                <Eye size={16} color={colors.textSecondary} />
                <Text style={styles.infoFeatureText}>End-to-end encryption</Text>
              </View>
              <View style={styles.infoFeature}>
                <Shield size={16} color={colors.textSecondary} />
                <Text style={styles.infoFeatureText}>Secure cloud storage</Text>
              </View>
              <View style={styles.infoFeature}>
                <EyeOff size={16} color={colors.textSecondary} />
                <Text style={styles.infoFeatureText}>No data selling</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.background,
  },
  headerSpacer: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoFeatures: {
    gap: 8,
  },
  infoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoFeatureText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
  },
  footerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});