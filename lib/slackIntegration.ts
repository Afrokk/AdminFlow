import { WebClient } from '@slack/web-api';

const isDemoMode = process.env.SLACK_BOT_TOKEN?.startsWith('xoxb-placeholder');
const slack = isDemoMode ? null : new WebClient(process.env.SLACK_BOT_TOKEN);


export async function checkUserInWorkspace(email: string): Promise<boolean> {
  if (isDemoMode) {
    console.log(`[DEMO] Checking if user with email ${email} exists in Slack workspace`);
    // Simulate some users existing in Slack
    return ['admin@demo.com', 'user@demo.com', 'test@example.com'].includes(email);
  }
  
  try {
    const response = await slack.users.lookupByEmail({
      email,
    });
    
    return Boolean(response.user && !response.user.deleted);
  } catch (error) {
    return false;
  }
}

 * Invite a user to the Slack workspace
 * @param email User's email address
 * @param firstName User's first name (optional)
 * @param lastName User's last name (optional)
 */
export async function inviteUserToWorkspace(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<boolean> {
  if (isDemoMode) {
    console.log(`[DEMO] Inviting user ${email} to Slack workspace`);
    if (firstName && lastName) {
      console.log(`[DEMO] User full name: ${firstName} ${lastName}`);
    }
    return true;
  }
  
  try {
    // Use admin.users.invite API to invite user
    // Note: This requires admin scope and a paid Slack workspace
    await slack.admin.users.invite({
      email,
      channel_ids: process.env.SLACK_DEFAULT_CHANNELS?.split(',') || [],
      team_id: process.env.SLACK_TEAM_ID,
      real_name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to invite user ${email} to Slack workspace:`, error);
    return false;
  }
}

export async function getWorkspaceUsers(): Promise<Array<{ id: string; email: string; real_name: string; }>> {
  if (isDemoMode) {
    console.log('[DEMO] Getting all users from Slack workspace');
    return [
      { id: 'U123456', email: 'admin@demo.com', real_name: 'Admin User' },
      { id: 'U234567', email: 'user@demo.com', real_name: 'Regular User' },
      { id: 'U345678', email: 'test@example.com', real_name: 'Test User' }
    ];
  }
  
  try {
    const result: Array<{ id: string; email: string; real_name: string; }> = [];
    let cursor: string | undefined;
    
    do {
      const response = await slack.users.list({
        cursor,
        limit: 100,
      });
    
      response.members?.forEach(member => {
        if (
          member.id && 
          member.profile?.email &&
          !member.deleted && 
          !member.is_bot && 
          member.id !== 'USLACKBOT'
        ) {
          result.push({
            id: member.id,
            email: member.profile.email,
            real_name: member.profile.real_name || member.name || '',
          });
        }
      });
      
      cursor = response.response_metadata?.next_cursor;
    } while (cursor);
    
    return result;
  } catch (error) {
    console.error('Failed to get Slack workspace users:', error);
    return [];
  }
}

export async function removeUserFromWorkspace(email: string): Promise<boolean> {
  if (isDemoMode) {
    console.log(`[DEMO] Removing user ${email} from Slack workspace`);
    return true;
  }
  
  try {
    const userLookup = await slack.users.lookupByEmail({
      email,
    });
    
    if (!userLookup.user || !userLookup.user.id) {
      return false;
    }
    
    await slack.admin.users.remove({
      team_id: process.env.SLACK_TEAM_ID,
      user_id: userLookup.user.id,
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to remove user ${email} from Slack workspace:`, error);
    return false;
  }
}

export async function syncUsersWithSlack(
  users: Array<{ email: string; isActive: boolean; name: string }>
): Promise<{ invited: string[]; removed: string[] }> {
  if (isDemoMode) {
    console.log(`[DEMO] Syncing ${users.length} users with Slack workspace`);
    const activeUsers = users.filter(user => user.isActive);
    return { 
      invited: activeUsers.slice(0, 2).map(u => u.email), 
      removed: [] 
    };
  }
  
  const invited: string[] = [];
  const removed: string[] = [];
  
  try {
    const slackUsers = await getWorkspaceUsers();
    const slackEmails = new Set(slackUsers.map(user => user.email.toLowerCase()));  
    const activeEmails = new Set(
      users
        .filter(user => user.isActive)
        .map(user => user.email.toLowerCase())
    );
    
    const inactiveEmails = new Set(
      users
        .filter(user => !user.isActive)
        .map(user => user.email.toLowerCase())
    );
    
    for (const user of users.filter(u => u.isActive)) {
      const email = user.email.toLowerCase();
      if (!slackEmails.has(email)) {
        const nameParts = user.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;
        
        const success = await inviteUserToWorkspace(email, firstName, lastName);
        if (success) {
          invited.push(email);
        }
      }
    }
  
    for (const slackUser of slackUsers) {
      const email = slackUser.email.toLowerCase();
      if (inactiveEmails.has(email) || !activeEmails.has(email)) {
        const success = await removeUserFromWorkspace(email);
        if (success) {
          removed.push(email);
        }
      }
    }
    
    return { invited, removed };
  } catch (error) {
    console.error('Error syncing users with Slack:', error);
    return { invited, removed };
  }
} 
