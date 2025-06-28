import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useDataDeletionStatus } from '@/hooks/useDataDeletionStatus';
import { Shield, ChevronLeft, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Calendar, Crown, Database, Mail, Trash2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DataRetentionScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { status: subscriptionStatus } = useSubscription();
  const { status: deletionStatus, loading: deletionLoading, cancelDeletion } = useDataDeletionStatus();
  const [cancelling, setCancelling] = useState(false);

  const handleCancelDeletion = async () => {
    Alert.alert(
      'Cancel Account Deletion',
      'To cancel the scheduled deletion, you need to subscribe to MemorySphere. Would you like to view subscription plans?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'View Plans',
          onPress: () => router.push('/(tabs)/subscription')
        }
      ]
    );
  };

  const handleSubscribeToSave = () => {
    router.push('/(tabs)/subscription');
  };

  const getUrgencyLevel = () => {
    if (!deletionStatus.isScheduledForDeletion) return 'safe';
    if (deletionStatus.daysUntilDeletion <= 3) return 'critical';
    if (deletionStatus.daysUntilDeletion <= 14) return 'urgent';
    return 'warning';
  };

  const getUrgencyColor = () => {
    const level = getUrgencyLevel();
    switch (level) {
      case 'critical': return colors.error;
      case 'urgent': return '#f59e0b';
      case 'warning': return colors.warning;
      default: return colors.success;
    }
  };

  const getUrgencyIcon = () => {
    const level = getUrgencyLevel();
    switch (level) {
      case 'critical': return <AlertTriangle size={24} color={colors.error} strokeWidth={2} />;
      case 'urgent': return <Clock size={24} color="#f59e0b" strokeWidth={2} />;
      case 'warning': return <Calendar size={24} color={colors.warning} strokeWidth={2} />;
      default: return <CheckCircle size={24} color={colors.success} strokeWidth={2} />;
    }
  };

  const styles = createStyles(colors);

  if (deletionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Checking data retention status...</Text>
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
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.background} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Shield size={24} color={colors.background} strokeWidth={1.5} />
            <Text style={styles.headerTitle}>Data Retention</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>
          Manage your data retention and deletion policies
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          
          <LinearGradient
            colors={colors.cardGradient}
            style={[styles.statusCard, { borderLeftColor: getUrgencyColor() }]}
          >
            <View style={styles.statusHeader}>
              {getUrgencyIcon()}
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>
                  {deletionStatus.isScheduledForDeletion ? 'Account Scheduled for Deletion' : 'Account Active'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {deletionStatus.isScheduledForDeletion 
                    ? `${deletionStatus.daysUntilDeletion} days remaining`
                    : 'Your data is safe and secure'
                  }
                </Text>
              </View>
            </View>

            {deletionStatus.isScheduledForDeletion && (
              <View style={styles.deletionDetails}>
                <View style={styles.deletionInfo}>
                  <Calendar size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.deletionText}>
                    Scheduled for: {deletionStatus.scheduledDeletionDate?.toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.warningsStatus}>
                  <Text style={styles.warningsTitle}>Email Warnings Sent:</Text>
                  <View style={styles.warningsList}>
                    <View style={styles.warningItem}>
                      <View style={[styles.warningDot, { backgroundColor: deletionStatus.warningsSent.firstWarning ? colors.success : colors.border }]} />
                      <Text style={styles.warningLabel}>30-day notice</Text>
                    </View>
                    <View style={styles.warningItem}>
                      <View style={[styles.warningDot, { backgroundColor: deletionStatus.warningsSent.secondWarning ? colors.warning : colors.border }]} />
                      <Text style={styles.warningLabel}>14-day notice</Text>
                    </View>
                    <View style={styles.warningItem}>
                      <View style={[styles.warningDot, { backgroundColor: deletionStatus.warningsSent.finalWarning ? colors.error : colors.border }]} />
                      <Text style={styles.warningLabel}>3-day final notice</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Action Required */}
        {deletionStatus.isScheduledForDeletion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Required</Text>
            
            <LinearGradient
              colors={[colors.error + '15', colors.error + '08']}
              style={styles.actionCard}
            >
              <View style={styles.actionHeader}>
                <AlertTriangle size={32} color={colors.error} strokeWidth={1.5} />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Save Your Account</Text>
                  <Text style={styles.actionSubtitle}>
                    Subscribe now to prevent data loss and keep all your memories and tasks
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribeToSave}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.subscribeButtonGradient}
                >
                  <Crown size={20} color={colors.background} strokeWidth={1.5} />
                  <Text style={styles.subscribeButtonText}>Subscribe to Save Account</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Data Retention Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention Policy</Text>
          
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.policyCard}
          >
            <View style={styles.policyHeader}>
              <Database size={24} color={colors.primary} strokeWidth={1.5} />
              <Text style={styles.policyTitle}>How We Handle Your Data</Text>
            </View>

            <View style={styles.policySteps}>
              <View style={styles.policyStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Trial Expiration</Text>
                  <Text style={styles.stepDescription}>
                    When your 3-day trial expires, your account remains active but with limited access
                  </Text>
                </View>
              </View>

              <View style={styles.policyStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>3-Month Grace Period</Text>
                  <Text style={styles.stepDescription}>
                    You have 3 months after trial expiration to subscribe and keep your data
                  </Text>
                </View>
              </View>

              <View style={styles.policyStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Deletion Warnings</Text>
                  <Text style={styles.stepDescription}>
                    We send email warnings at 30, 14, and 3 days before deletion
                  </Text>
                </View>
              </View>

              <View style={styles.policyStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Permanent Deletion</Text>
                  <Text style={styles.stepDescription}>
                    After 3 months + 30 days notice, all data is permanently deleted and cannot be recovered
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* What Gets Deleted */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Gets Deleted</Text>
          
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.deletionCard}
          >
            <View style={styles.deletionHeader}>
              <Trash2 size={24} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.deletionTitle}>Complete Data Removal</Text>
            </View>

            <View style={styles.deletionList}>
              <View style={styles.deletionItem}>
                <View style={styles.deletionDot} />
                <Text style={styles.deletionItemText}>All memories and conversations</Text>
              </View>
              <View style={styles.deletionItem}>
                <View style={styles.deletionDot} />
                <Text style={styles.deletionItemText}>Task lists and productivity data</Text>
              </View>
              <View style={styles.deletionItem}>
                <View style={styles.deletionDot} />
                <Text style={styles.deletionItemText}>Account settings and preferences</Text>
              </View>
              <View style={styles.deletionItem}>
                <View style={styles.deletionDot} />
                <Text style={styles.deletionItemText}>Personal information and profile</Text>
              </View>
              <View style={styles.deletionItem}>
                <View style={styles.deletionDot} />
                <Text style={styles.deletionItemText}>Subscription and billing history</Text>
              </View>
            </View>

            <View style={styles.deletionNote}>
              <Text style={styles.deletionNoteText}>
                ⚠️ This action is permanent and cannot be undone. Make sure to export your data before deletion if needed.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <LinearGradient
            colors={colors.cardGradient}
            style={styles.supportCard}
          >
            <View style={styles.supportHeader}>
              <Mail size={24} color={colors.primary} strokeWidth={1.5} />
              <Text style={styles.supportTitle}>Need Help?</Text>
            </View>
            <Text style={styles.supportText}>
              If you have questions about data retention or need assistance with your account, our support team is here to help.
            </Text>
            <TouchableOpacity style={styles.supportButton}>
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
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
    fontSize: 20,
    fontWeight: '700',
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
    fontWeight: '500',
  },
  content: {
    flex: 1,
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
  statusCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deletionDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deletionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deletionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  warningsStatus: {
    marginTop: 8,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  warningsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  warningLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  policyCard: {
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
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  policySteps: {
    gap: 16,
  },
  policyStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deletionCard: {
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
  deletionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  deletionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  deletionList: {
    gap: 12,
    marginBottom: 20,
  },
  deletionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletionDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.textSecondary,
    borderRadius: 3,
    marginRight: 12,
  },
  deletionItemText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deletionNote: {
    backgroundColor: colors.warning + '15',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  deletionNoteText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  supportCard: {
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
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  supportText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomSpacing: {
    height: 32,
  },
});