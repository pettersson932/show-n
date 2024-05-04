const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader)
    return res
      .status(401)
      .send("Autentiseringsrubrik saknas. Autentisering krävs.");

  const [bearer, token] = authHeader.split(" ");

  if (bearer !== "Bearer" || !token)
    return res.status(401).send("Ogiltigt format på autentiseringrubrik.");

  try {
    const KEY = process.env.JWT_KEY;
    const decoded = jwt.verify(token, KEY);

    req.user = {
      username: decoded.username,
      userId: decoded.userId,
    };
  } catch (err) {
    return res.status(401).send("Ogiltigt token.");
  }
  return next();
};

const validateToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new Error("Token saknas.");
  const [bearer, token] = authHeader.split(" ");

  if (bearer !== "Bearer" || !token) throw new Error("Ogiltigt token.");

  try {
    const KEY = process.env.JWT_KEY;
    const decoded = jwt.verify(token, KEY);

    req.user = {
      username: decoded.username,
      userId: decoded.userId,
    };
    return true;
  } catch (err) {
    throw new Error("Ogiltigt token.");
  }
};

module.exports = { auth, validateToken };
