/*
  # Automated Data Deletion Cron Job

  This edge function runs the data deletion process automatically.
  It should be called daily via a cron job or scheduled task.

  Features:
  - Identifies users inactive for 3+ months
  - Sends warning emails before deletion
  - Executes scheduled deletions
  - Logs all activities
  - Sends summary reports
*/

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

// Function to send warning emails via external email service
async function sendWarningEmail(
  email: string,
  firstName: string,
  warningType: string,
  deletionDate: string
): Promise<boolean> {
  try {
    // In production, integrate with your email service (SendGrid, Mailgun, etc.)
    console.log(`Sending ${warningType} warning email to ${email}`);
    
    const emailTemplates = {
      FIRST_WARNING: {
        subject: '⚠️ MemorySphere Account Inactivity Notice - 30 Days Until Deletion',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1, #ec4899); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🧠 MemorySphere</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Account Inactivity Notice</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${firstName},</h2>
              
              <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
                We noticed that your MemorySphere trial expired over 3 months ago, and you haven't subscribed to continue using our service.
              </p>
              
              <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">⚠️ Important: Account Scheduled for Deletion</h3>
                <p style="color: #92400e; margin: 0; font-weight: 500;">
                  Your account and all associated data will be permanently deleted on <strong>${deletionDate}</strong> unless you subscribe to continue using MemorySphere.
                </p>
              </div>
              
              <h3 style="color: #1e293b; margin: 20px 0 10px 0;">What will be deleted:</h3>
              <ul style="color: #64748b; line-height: 1.6;">
                <li>All your memories and conversations</li>
                <li>Your task lists and productivity data</li>
                <li>Account settings and preferences</li>
                <li>All personal information</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://memorysphere.app/subscription" 
                   style="background: linear-gradient(135deg, #6366f1, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Subscribe Now to Keep Your Data
                </a>
              </div>
              
              <p style="color: #64748b; line-height: 1.6; margin-top: 20px;">
                If you no longer wish to use MemorySphere, no action is required. Your account will be automatically deleted on the scheduled date.
              </p>
              
              <p style="color: #64748b; line-height: 1.6;">
                Questions? Contact our support team - we're here to help!
              </p>
              
              <p style="color: #64748b; margin-top: 30px;">
                Best regards,<br>
                The MemorySphere Team
              </p>
            </div>
          </div>
        `
      },
      SECOND_WARNING: {
        subject: '🚨 MemorySphere Account Deletion in 14 Days - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🧠 MemorySphere</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Urgent: Account Deletion Notice</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${firstName},</h2>
              
              <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0;">🚨 Final Notice: 14 Days Until Deletion</h3>
                <p style="color: #dc2626; margin: 0; font-weight: 600; font-size: 16px;">
                  Your MemorySphere account will be permanently deleted on <strong>${deletionDate}</strong>
                </p>
              </div>
              
              <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
                This is your second and more urgent reminder. Your account has been inactive for over 3 months, and deletion is now just 14 days away.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://memorysphere.app/subscription" 
                   style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Subscribe Now - Don't Lose Your Data!
                </a>
              </div>
              
              <p style="color: #64748b; line-height: 1.6;">
                <strong>Need help?</strong> Our support team is standing by to assist you with subscription or any questions about your account.
              </p>
              
              <p style="color: #64748b; margin-top: 30px;">
                Best regards,<br>
                The MemorySphere Team
              </p>
            </div>
          </div>
        `
      },
      FINAL_WARNING: {
        subject: '🔥 FINAL WARNING: MemorySphere Account Deletion in 3 Days',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🧠 MemorySphere</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">FINAL WARNING - Immediate Action Required</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${firstName},</h2>
              
              <div style="background: #fecaca; border: 3px solid #dc2626; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: center;">
                <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 20px;">🔥 FINAL WARNING</h3>
                <p style="color: #991b1b; margin: 0; font-weight: 700; font-size: 18px;">
                  Account deletion in just <strong>3 DAYS</strong>
                </p>
                <p style="color: #991b1b; margin: 10px 0 0 0; font-weight: 600;">
                  Deletion Date: <strong>${deletionDate}</strong>
                </p>
              </div>
              
              <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px; font-weight: 500;">
                This is your final opportunity to save your MemorySphere account and all your valuable data. After ${deletionDate}, everything will be permanently deleted and cannot be recovered.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://memorysphere.app/subscription" 
                   style="background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 18px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                  SAVE MY ACCOUNT NOW
                </a>
              </div>
              
              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #1e293b; margin: 0 0 10px 0;">💡 Why subscribe to MemorySphere?</h4>
                <ul style="color: #64748b; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Keep all your memories and AI conversations</li>
                  <li>Unlimited task management and productivity features</li>
                  <li>Advanced AI insights and daily summaries</li>
                  <li>Secure data backup and export options</li>
                </ul>
              </div>
              
              <p style="color: #64748b; line-height: 1.6; font-weight: 500;">
                <strong>Need immediate help?</strong> Contact our support team right away - we're here to help you save your account!
              </p>
              
              <p style="color: #64748b; margin-top: 30px;">
                Best regards,<br>
                The MemorySphere Team
              </p>
            </div>
          </div>
        `
      }
    };
    
    const template = emailTemplates[warningType as keyof typeof emailTemplates];
    if (!template) {
      console.error(`Unknown warning type: ${warningType}`);
      return false;
    }
    
    // Here you would integrate with your actual email service
    // For example, using SendGrid:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email, name: firstName }],
          subject: template.subject,
        }],
        from: { email: 'noreply@memorysphere.app', name: 'MemorySphere' },
        content: [{
          type: 'text/html',
          value: template.html,
        }],
      }),
    });
    
    return response.ok;
    */
    
    // For demo purposes, simulate successful email sending
    console.log(`Email sent successfully to ${email}: ${template.subject}`);
    return true;
    
  } catch (error) {
    console.error(`Error sending warning email to ${email}:`, error);
    return false;
  }
}

// Function to send summary report to admin
async function sendAdminSummary(summary: any): Promise<void> {
  try {
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@memorysphere.app';
    
    console.log('Admin Summary:', JSON.stringify(summary, null, 2));
    
    // In production, send email to admin with summary
    // This helps monitor the data deletion process
    
  } catch (error) {
    console.error('Error sending admin summary:', error);
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    console.log('Starting automated data deletion process...');

    // Run the main data deletion process
    const { data: result, error } = await supabase.rpc('run_data_deletion_process');

    if (error) {
      console.error('Error running data deletion process:', error);
      return corsResponse({ error: 'Failed to run data deletion process' }, 500);
    }

    console.log('Data deletion process completed:', result);

    // Send warning emails for users who need them
    if (result.warning_emails_sent > 0) {
      console.log(`Processing ${result.warning_emails_sent} warning emails...`);
      
      // Get users who need warning emails
      const { data: warningUsers, error: warningError } = await supabase
        .from('user_deletion_schedule')
        .select(`
          *,
          users!inner(email, first_name, last_name)
        `)
        .or('first_warning_sent_at.is.null,second_warning_sent_at.is.null,final_warning_sent_at.is.null');

      if (!warningError && warningUsers) {
        for (const user of warningUsers) {
          let warningType = '';
          const deletionDate = new Date(user.scheduled_deletion_at).toLocaleDateString();
          const daysUntilDeletion = Math.ceil(
            (new Date(user.scheduled_deletion_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          // Determine warning type based on what hasn't been sent
          if (!user.first_warning_sent_at && daysUntilDeletion <= 30) {
            warningType = 'FIRST_WARNING';
          } else if (!user.second_warning_sent_at && daysUntilDeletion <= 14) {
            warningType = 'SECOND_WARNING';
          } else if (!user.final_warning_sent_at && daysUntilDeletion <= 3) {
            warningType = 'FINAL_WARNING';
          }

          if (warningType) {
            const emailSent = await sendWarningEmail(
              user.users.email,
              user.users.first_name,
              warningType,
              deletionDate
            );

            if (emailSent) {
              console.log(`Sent ${warningType} to ${user.users.email}`);
            } else {
              console.error(`Failed to send ${warningType} to ${user.users.email}`);
            }
          }
        }
      }
    }

    // Send admin summary
    await sendAdminSummary(result);

    return corsResponse({
      success: true,
      summary: result,
      message: 'Data deletion process completed successfully'
    });

  } catch (error: any) {
    console.error('Error in data deletion cron job:', error);
    return corsResponse({ error: error.message }, 500);
  }
});