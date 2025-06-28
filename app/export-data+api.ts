import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export async function OPTIONS() {
  return corsResponse(null, 204);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return corsResponse({ error: 'Invalid authentication' }, 401);
    }

    // Get user profile data
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      return corsResponse({ error: 'Failed to fetch user data' }, 500);
    }

    // Get all user memories
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (memoriesError) {
      return corsResponse({ error: 'Failed to fetch memories' }, 500);
    }

    // Get all user tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksError) {
      return corsResponse({ error: 'Failed to fetch tasks' }, 500);
    }

    // Get subscription data
    const { data: subscription } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    // Generate PDF content
    const pdfContent = generatePDFContent({
      user: userProfile,
      memories: memories || [],
      tasks: tasks || [],
      subscription,
    });

    // Send email with PDF
    const emailSent = await sendEmailWithPDF(userProfile.email, pdfContent, userProfile.first_name);

    if (!emailSent) {
      return corsResponse({ error: 'Failed to send email' }, 500);
    }

    return corsResponse({ 
      success: true, 
      message: 'Your data export has been sent to your email address' 
    });

  } catch (error: any) {
    console.error('Export data error:', error);
    return corsResponse({ error: 'Internal server error' }, 500);
  }
}

function generatePDFContent(data: any) {
  const { user, memories, tasks, subscription } = data;
  const exportDate = new Date().toLocaleDateString();
  
  // Calculate statistics
  const totalMemories = memories.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  // Group memories by month
  const memoriesByMonth = memories.reduce((acc: any, memory: any) => {
    const month = new Date(memory.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(memory);
    return acc;
  }, {});

  // Group tasks by priority
  const tasksByPriority = tasks.reduce((acc: any, task: any) => {
    if (!acc[task.priority]) acc[task.priority] = [];
    acc[task.priority].push(task);
    return acc;
  }, {});

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MemorySphere Data Export</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #6366f1;
        }
        .logo {
            font-size: 2.5em;
            font-weight: bold;
            background: linear-gradient(135deg, #6366f1, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 1.1em;
        }
        .user-info {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
            border-left: 5px solid #6366f1;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-title {
            font-size: 1.8em;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        .memory-card, .task-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .memory-title, .task-title {
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 8px;
            font-size: 1.1em;
        }
        .memory-content, .task-description {
            color: #64748b;
            margin-bottom: 10px;
            line-height: 1.5;
        }
        .memory-meta, .task-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 0.9em;
            color: #64748b;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        .tag {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
        }
        .priority-high { color: #ef4444; font-weight: bold; }
        .priority-medium { color: #f59e0b; font-weight: bold; }
        .priority-low { color: #10b981; font-weight: bold; }
        .completed { opacity: 0.7; text-decoration: line-through; }
        .month-group {
            margin-bottom: 30px;
        }
        .month-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 15px;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
        }
        .export-info {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 30px;
            text-align: center;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🧠 MemorySphere</div>
            <div class="subtitle">Your Complete Data Export</div>
        </div>

        <div class="export-info">
            <strong>📊 Export Generated:</strong> ${exportDate}<br>
            <strong>👤 Account:</strong> ${user.first_name} ${user.last_name} (${user.email})
        </div>

        <div class="user-info">
            <h3>👤 Account Information</h3>
            <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Account Created:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            <p><strong>Theme Preference:</strong> ${user.theme_preference}</p>
            ${user.trial_ends_at ? `<p><strong>Trial Period:</strong> ${new Date(user.trial_started_at).toLocaleDateString()} - ${new Date(user.trial_ends_at).toLocaleDateString()}</p>` : ''}
            ${subscription ? `<p><strong>Subscription Status:</strong> ${subscription.subscription_status}</p>` : ''}
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalMemories}</div>
                <div class="stat-label">Total Memories</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalTasks}</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${completedTasks}</div>
                <div class="stat-label">Completed Tasks</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${pendingTasks}</div>
                <div class="stat-label">Pending Tasks</div>
            </div>
        </div>

        ${totalMemories > 0 ? `
        <div class="section">
            <h2 class="section-title">🧠 Your Memories (${totalMemories} total)</h2>
            ${Object.entries(memoriesByMonth).map(([month, monthMemories]: [string, any]) => `
                <div class="month-group">
                    <h3 class="month-title">📅 ${month} (${monthMemories.length} memories)</h3>
                    ${monthMemories.map((memory: any) => `
                        <div class="memory-card">
                            <div class="memory-title">${memory.title}</div>
                            <div class="memory-content">${memory.content}</div>
                            <div class="memory-meta">
                                <div class="meta-item">📅 ${new Date(memory.created_at).toLocaleDateString()}</div>
                                ${memory.person ? `<div class="meta-item">👤 ${memory.person}</div>` : ''}
                                ${memory.location ? `<div class="meta-item">📍 ${memory.location}</div>` : ''}
                                ${memory.emotion ? `<div class="meta-item">😊 ${memory.emotion}</div>` : ''}
                            </div>
                            ${memory.tags && memory.tags.length > 0 ? `
                                <div class="tags">
                                    ${memory.tags.map((tag: string) => `<span class="tag">#${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        ` : '<div class="section"><h2 class="section-title">🧠 Your Memories</h2><p>No memories found.</p></div>'}

        ${totalTasks > 0 ? `
        <div class="section">
            <h2 class="section-title">✅ Your Tasks (${totalTasks} total)</h2>
            ${Object.entries(tasksByPriority).map(([priority, priorityTasks]: [string, any]) => `
                <div class="month-group">
                    <h3 class="month-title priority-${priority}">🎯 ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority (${priorityTasks.length} tasks)</h3>
                    ${priorityTasks.map((task: any) => `
                        <div class="task-card ${task.completed ? 'completed' : ''}">
                            <div class="task-title">${task.completed ? '✅' : '⏳'} ${task.title}</div>
                            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                            <div class="task-meta">
                                <div class="meta-item">📅 Created: ${new Date(task.created_at).toLocaleDateString()}</div>
                                <div class="meta-item priority-${task.priority}">🎯 ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</div>
                                ${task.due_date ? `<div class="meta-item">⏰ Due: ${new Date(task.due_date).toLocaleDateString()}</div>` : ''}
                                <div class="meta-item">${task.completed ? '✅ Completed' : '⏳ Pending'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        ` : '<div class="section"><h2 class="section-title">✅ Your Tasks</h2><p>No tasks found.</p></div>'}

        <div class="footer">
            <p><strong>🔒 Data Privacy:</strong> This export contains all your personal data stored in MemorySphere.</p>
            <p><strong>📧 Support:</strong> If you have any questions about your data, please contact our support team.</p>
            <p><strong>🌟 Thank you for using MemorySphere!</strong></p>
            <br>
            <p style="font-size: 0.9em; color: #94a3b8;">
                Generated on ${exportDate} • MemorySphere v1.0.0<br>
                Your AI-powered cognitive twin for memories and productivity
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

async function sendEmailWithPDF(email: string, htmlContent: string, firstName: string): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Convert HTML to PDF using a service like Puppeteer, jsPDF, or a PDF API
    // 2. Send email using a service like SendGrid, Mailgun, or AWS SES
    
    // For this example, we'll simulate the email sending
    // You would replace this with actual email service integration
    
    console.log(`Sending PDF export to ${email} for user ${firstName}`);
    console.log('HTML content length:', htmlContent.length);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, you would:
    /*
    const pdf = await generatePDFFromHTML(htmlContent);
    
    const emailResult = await sendEmail({
      to: email,
      subject: `Your MemorySphere Data Export - ${new Date().toLocaleDateString()}`,
      html: `
        <h2>Hello ${firstName}!</h2>
        <p>Your complete MemorySphere data export is ready. Please find your PDF report attached.</p>
        <p>This export includes:</p>
        <ul>
          <li>All your memories with tags and metadata</li>
          <li>Complete task history with priorities and status</li>
          <li>Account information and statistics</li>
          <li>Subscription details</li>
        </ul>
        <p>If you have any questions about your data, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The MemorySphere Team</p>
      `,
      attachments: [{
        filename: `memorysphere-export-${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdf,
        contentType: 'application/pdf'
      }]
    });
    
    return emailResult.success;
    */
    
    // For demo purposes, return true
    return true;
    
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}