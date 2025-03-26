import { Octokit } from "octokit";

// Check if we're in demo mode
const isDemoMode = process.env.GITHUB_PAT?.startsWith('placeholder');

// Initialize Octokit with GitHub token
const octokit = isDemoMode ? null : new Octokit({
  auth: process.env.GITHUB_PAT,
});

const ORGANIZATION = process.env.GITHUB_ORGANIZATION || '';

/**
 * Check if a user exists in the GitHub organization
 */
export async function checkUserInOrganization(username: string): Promise<boolean> {
  if (isDemoMode) {
    console.log(`[DEMO] Checking if user ${username} is in organization ${ORGANIZATION}`);
    // Simulate some users existing in the org
    return ['demo-user', 'test-user', 'admin-user'].includes(username);
  }
  
  try {
    const response = await octokit.rest.orgs.checkMembershipForUser({
      org: ORGANIZATION,
      username,
    });
    
    return response.status === 204; // 204 No Content means the user is a member
  } catch (error) {
    // 404 means user is not a member or the membership is private
    return false;
  }
}

/**
 * Add a user to the GitHub organization
 */
export async function addUserToOrganization(username: string, role: 'admin' | 'member' = 'member'): Promise<boolean> {
  if (isDemoMode) {
    console.log(`[DEMO] Adding user ${username} to organization ${ORGANIZATION} with role ${role}`);
    return true;
  }
  
  try {
    await octokit.rest.orgs.setMembershipForUser({
      org: ORGANIZATION,
      username,
      role,
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to add user ${username} to organization:`, error);
    return false;
  }
}

/**
 * Remove a user from the GitHub organization
 */
export async function removeUserFromOrganization(username: string): Promise<boolean> {
  if (isDemoMode) {
    console.log(`[DEMO] Removing user ${username} from organization ${ORGANIZATION}`);
    return true;
  }
  
  try {
    await octokit.rest.orgs.removeMembershipForUser({
      org: ORGANIZATION,
      username,
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to remove user ${username} from organization:`, error);
    return false;
  }
}

/**
 * Get all members of the GitHub organization
 */
export async function getOrganizationMembers(): Promise<Array<{ username: string; role: string }>> {
  if (isDemoMode) {
    console.log(`[DEMO] Getting all members of organization ${ORGANIZATION}`);
    // Return demo data
    return [
      { username: 'demo-user', role: 'member' },
      { username: 'test-user', role: 'member' },
      { username: 'admin-user', role: 'admin' }
    ];
  }
  
  try {
    // Get all members (paginate through all results)
    const membersResponse = await octokit.rest.orgs.listMembers({
      org: ORGANIZATION,
      per_page: 100,
    });
    
    // Get all admins
    const adminsResponse = await octokit.rest.orgs.listMembers({
      org: ORGANIZATION,
      role: 'admin',
      per_page: 100,
    });
    
    // Map of admin usernames for quick lookup
    const adminUsernames = new Set(adminsResponse.data.map(admin => admin.login));
    
    // Combine the results
    return membersResponse.data.map(member => ({
      username: member.login,
      role: adminUsernames.has(member.login) ? 'admin' : 'member',
    }));
  } catch (error) {
    console.error('Failed to get organization members:', error);
    return [];
  }
}

/**
 * Sync the database users with the GitHub organization
 * This is useful for ensuring that all active users are members of the GitHub organization
 */
export async function syncUsersWithGitHub(
  users: Array<{ githubId: string; isActive: boolean }>
): Promise<{ added: string[]; removed: string[] }> {
  if (isDemoMode) {
    console.log(`[DEMO] Syncing ${users.length} users with GitHub organization ${ORGANIZATION}`);
    
    // Return demo response
    const activeUsers = users.filter(user => user.isActive && user.githubId);
    return { 
      added: activeUsers.slice(0, 2).map(u => u.githubId), 
      removed: [] 
    };
  }
  
  const added: string[] = [];
  const removed: string[] = [];
  
  try {
    // Get current organization members
    const orgMembers = await getOrganizationMembers();
    const orgMemberUsernames = new Set(orgMembers.map(member => member.username));
    
    // Filter users with GitHub IDs
    const usersWithGitHub = users.filter(user => user.githubId);
    
    // Users that should be in the organization (active users with GitHub IDs)
    const activeGitHubIds = new Set(
      usersWithGitHub
        .filter(user => user.isActive)
        .map(user => user.githubId)
    );
    
    // Add users who should be in the org but aren't
    for (const githubId of activeGitHubIds) {
      if (!orgMemberUsernames.has(githubId)) {
        const success = await addUserToOrganization(githubId);
        if (success) {
          added.push(githubId);
        }
      }
    }
    
    // Remove users who are in the org but shouldn't be
    for (const orgMember of orgMembers) {
      if (!activeGitHubIds.has(orgMember.username)) {
        const success = await removeUserFromOrganization(orgMember.username);
        if (success) {
          removed.push(orgMember.username);
        }
      }
    }
    
    return { added, removed };
  } catch (error) {
    console.error('Error syncing users with GitHub:', error);
    return { added, removed };
  }
} 
