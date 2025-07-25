/**
 * Input sanitization utilities for AI prompts and user content
 * Prevents prompt injection and malicious content
 */

// Dangerous patterns that could be used for prompt injection
const DANGEROUS_PATTERNS = [
  // Direct prompt manipulation attempts
  /ignore\s+(previous|all)\s+(instructions|prompts?)/i,
  /forget\s+(everything|all)\s+(above|before)/i,
  /you\s+are\s+now\s+a\s+different/i,
  /pretend\s+to\s+be/i,
  /act\s+as\s+if/i,
  /system\s*:\s*/i,
  /assistant\s*:\s*/i,
  /human\s*:\s*/i,
  
  // Jailbreak attempts
  /jailbreak/i,
  /DAN\s+mode/i,
  /developer\s+mode/i,
  /unrestricted/i,
  /bypass\s+safety/i,
  
  // Injection attempts
  /<\s*script\s*/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /on\w+\s*=/i, // HTML event handlers
  
  // SQL injection patterns (just in case)
  /union\s+select/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /'.*or.*'.*=/i,
];

// Content that should be flagged for review
const SUSPICIOUS_PATTERNS = [
  /generate\s+(password|token|key)/i,
  /create\s+(virus|malware)/i,
  /hack\s+into/i,
  /personal\s+information/i,
  /credit\s+card/i,
  /social\s+security/i,
];

export interface SanitizationResult {
  sanitized: string;
  isClean: boolean;
  warnings: string[];
  blocked: boolean;
}

/**
 * Sanitize user input for AI prompts
 */
export function sanitizeForPrompt(input: string): SanitizationResult {
  if (!input || typeof input !== 'string') {
    return {
      sanitized: '',
      isClean: false,
      warnings: ['Invalid input type'],
      blocked: true
    };
  }

  const warnings: string[] = [];
  let sanitized = input.trim();
  let blocked = false;

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      warnings.push(`Blocked potentially dangerous content: ${pattern.source}`);
      blocked = true;
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      warnings.push(`Flagged suspicious content: ${pattern.source}`);
    }
  }

  // Basic sanitization
  sanitized = sanitized
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove null bytes
    .replace(/\0/g, '')
    // Limit consecutive special characters
    .replace(/[!@#$%^&*()]{4,}/g, (match) => match.slice(0, 3))
    // Remove potential HTML/XML tags
    .replace(/<[^>]*>/g, '')
    // Encode potential script injections
    .replace(/javascript:/gi, 'javascript-blocked:')
    .replace(/data:/gi, 'data-blocked:');

  // Length validation
  if (sanitized.length > 10000) {
    warnings.push('Input truncated: exceeds maximum length');
    sanitized = sanitized.slice(0, 10000);
  }

  return {
    sanitized,
    isClean: warnings.length === 0,
    warnings,
    blocked
  };
}

/**
 * Sanitize company name input
 */
export function sanitizeCompanyName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 100); // Limit length
}

/**
 * Validate and sanitize scenario data
 */
export function sanitizeScenario(scenario: Record<string, unknown>): Record<string, unknown> | null {
  if (!scenario || typeof scenario !== 'object') {
    return null;
  }

  const nameResult = sanitizeForPrompt(String(scenario.name || ''));
  const descResult = sanitizeForPrompt(String(scenario.description || ''));

  if (nameResult.blocked || descResult.blocked) {
    throw new Error('Scenario contains blocked content');
  }

  return {
    id: scenario.id,
    name: nameResult.sanitized,
    description: descResult.sanitized,
    parameters: scenario.parameters // Keep as-is for now, could add more validation
  };
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - record.count, 
    resetTime: record.resetTime 
  };
}

/**
 * Validate that prompts are appropriate for the given role
 */
export function validatePromptsForRole(role: string, prompts: string[]): { valid: boolean; reason?: string } {
  const validRoles = ['CEO', 'CFO', 'CTO', 'HR'];
  
  if (!validRoles.includes(role)) {
    return {
      valid: false,
      reason: 'Invalid role specified'
    };
  }

  // Check for role-specific inappropriate content
  for (const prompt of prompts) {
    if (role === 'CFO' && !prompt.toLowerCase().includes('financial') && 
        !prompt.toLowerCase().includes('budget') && !prompt.toLowerCase().includes('cost')) {
      return {
        valid: false,
        reason: 'CFO prompts should contain financial context'
      };
    }
  }

  return { valid: true };
}
