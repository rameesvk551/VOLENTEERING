/**
 * JWT Authentication Middleware
 * Validates JWT tokens from Auth Service
 */

import { FastifyRequest, FastifyReply } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Extract and decode JWT token (without verification for demo)
 * In production, verify the token using the JWT_SECRET
 */
export async function authenticateUser(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({
        success: false,
        error: 'Authentication required. No token provided.'
      });
      return;
    }

    const token = authHeader.substring(7);

    // For demo: decode the JWT payload without verification
    // In production: verify using jsonwebtoken library with JWT_SECRET
    const payload = decodeJWT(token);

    if (!payload || !payload.id) {
      reply.code(401).send({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    // Attach user to request
    request.user = {
      id: payload.id,
      email: payload.email || '',
      role: payload.role || 'user'
    };
  } catch (error) {
    reply.code(401).send({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = decodeJWT(token);

      if (payload && payload.id) {
        request.user = {
          id: payload.id,
          email: payload.email || '',
          role: payload.role || 'user'
        };
      }
    }
  } catch (error) {
    // Silent fail for optional auth
    console.log('Optional auth failed, continuing without user context');
  }
}

/**
 * Simple JWT decoder (base64 decode payload)
 * In production, use jsonwebtoken.verify()
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}
