import type { Express, Request, Response, NextFunction } from "express";

export async function setupAuth(app: Express) {
  // noop for local/dev. Real integration can override.
  return;
}

export function registerAuthRoutes(app: Express) {
  // noop placeholder
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For dev mode, ensure a mock user is present so server code can read req.user.claims.sub
  if (!(req as any).user) {
    (req as any).user = { claims: { sub: "mock-user" } };
  }
  next();
}
