/**
 * Role Badge Utilities
 * Centralized role color scheme and display utilities
 */

export type DeveloperRoleCode = 'SA' | 'TW' | 'BE' | 'FE' | 'QA' | 'DM';

export interface RoleBadgeConfig {
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

/**
 * Get color scheme for developer role badge
 * Color scheme:
 * - SA (System Analyst): Purple
 * - TW (Technical Writer): Blue
 * - BE (Backend Developer): Green
 * - FE (Frontend Developer): Yellow
 * - QA (Quality Assurance): Red
 * - DM (Data Management): Indigo
 */
export function getRoleBadgeColor(roleCode: string): RoleBadgeConfig {
  const normalizedCode = roleCode.toUpperCase();
  
  switch (normalizedCode) {
    case 'SA':
      return {
        color: 'purple',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        textColor: 'text-purple-700 dark:text-purple-300',
        icon: '📊',
      };
    case 'TW':
      return {
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-700 dark:text-blue-300',
        icon: '📝',
      };
    case 'BE':
      return {
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-300',
        icon: '⚙️',
      };
    case 'FE':
      return {
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        icon: '🎨',
      };
    case 'QA':
      return {
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-300',
        icon: '✅',
      };
    case 'DM':
      return {
        color: 'indigo',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
        textColor: 'text-indigo-700 dark:text-indigo-300',
        icon: '🗄️',
      };
    default:
      return {
        color: 'gray',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20',
        textColor: 'text-gray-700 dark:text-gray-300',
        icon: '👤',
      };
  }
}

/**
 * Get full role name from code
 */
export function getRoleName(roleCode: string): string {
  const normalizedCode = roleCode.toUpperCase();
  
  switch (normalizedCode) {
    case 'SA':
      return 'System Analyst';
    case 'TW':
      return 'Technical Writer';
    case 'BE':
      return 'Backend Developer';
    case 'FE':
      return 'Frontend Developer';
    case 'QA':
      return 'Quality Assurance';
    case 'DM':
      return 'Data Management';
    default:
      return roleCode;
  }
}
