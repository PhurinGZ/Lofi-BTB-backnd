const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 *
 * /api/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             example: { data: "<JWT_TOKEN>", message: "Signing in please wait..." }
 *       '400':
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             example: { message: "Invalid email or password" }
 */
router.post("/", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).send({ message: "Invalid email or password" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({ message: "Invalid email or password" });

  const token = user.generateAuthToken();
  res.status(200).send({ data: token, message: "Signing in please wait..." });
});


module.exports = router;
