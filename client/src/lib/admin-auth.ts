/**
 * Highly Secure Admin Authentication Utility
 * 
 * This utility provides centralized admin authorization checks
 * to ensure maximum security for admin-only features.
 */

// Authorized admin emails - ONLY these users can access admin features
export const AUTHORIZED_ADMIN_EMAILS = [
  "nikelesh2006@gmail.com",
  "codecraft2k@gmail.com", 
  "planetmini.care@gmail.com"
] as const;

/**
 * Check if a user email is authorized for admin access
 * @param email - User email to check
 * @returns boolean - True if authorized, false otherwise
 */
export function isAdminAuthorized(email?: string): boolean {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail as any);
}

/**
 * Check if a user object is authorized for admin access
 * @param user - User object with email property
 * @returns boolean - True if authorized, false otherwise
 */
export function isUserAdminAuthorized(user?: { email?: string }): boolean {
  if (!user?.email) return false;
  return isAdminAuthorized(user.email);
}

/**
 * Log unauthorized admin access attempts for security monitoring
 * @param email - Email that attempted unauthorized access
 * @param action - Action being attempted
 */
export function logUnauthorizedAccess(email: string, action: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    email: email.toLowerCase(),
    action,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    ip: typeof window !== 'undefined' ? 'client-side' : 'server-side'
  };
  
  // Log to console in development, in production this should go to a secure logging service
  console.warn('🚨 UNAUTHORIZED ADMIN ACCESS ATTEMPT:', logEntry);
  
  // In production, you might want to:
  // - Send to a security monitoring service
  // - Send email alerts to actual admins
  // - Block repeated attempts
}

/**
 * Server-side admin validation (for API routes)
 * This function should be used in server-side code to validate admin requests
 */
export function validateServerAdminRequest(email?: string): { 
  isValid: boolean; 
  reason?: string; 
} {
  if (!email) {
    return { isValid: false, reason: 'No email provided' };
  }
  
  if (!isAdminAuthorized(email)) {
    return { isValid: false, reason: 'Email not authorized for admin access' };
  }
  
  return { isValid: true };
}
