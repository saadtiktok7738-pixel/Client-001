import jwt from "jsonwebtoken";

const secret = () => process.env.JWT_SECRET || "changeme-dev-secret";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, secret());
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  });
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    const token = header.slice(7);

    try {
      const decoded = jwt.verify(token, secret());
      req.user = decoded;
    } catch {
      // ignore invalid tokens
    }
  }

  next();
}

export function signToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}