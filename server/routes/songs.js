/**
 * @swagger
 * tags:
 *   name: Songs
 *   description: API operations related to songs
 */

const router = require("express").Router();
const { User } = require("../models/user");
const { Song, validate } = require("../models/song");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/admin");
const validObjectId = require("../middleware/validObjectId");

/**
 * @swagger
 * /api/songs:
 *   post:
 *     summary: Create a new song
 *     tags: [Songs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SongInput'
 *     responses:
 *       '200':
 *         description: Song created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SongResponse'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have admin privileges.
 *       '400':
 *         description: Bad request. Invalid input data.
 */

// create song
router.post("/", authAdmin, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(200).send({ message: error.details[0].message });

  const song = await Song(req.body).save();
  res.status(200).send({ data: song, message: "Song cerated successfully" });
});

/**
 * @swagger
 * /api/songs:
 *   get:
 *     summary: Get all songs
 *     tags: [Songs]
 *     responses:
 *       '200':
 *         description: List of songs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SongsList'
 *     '400':
 *       description: Bad request. Invalid input data.
 */

// get all song
router.get("/", async (req, res) => {
  const songs = await Song.find();
  res.status(200).send({ data: songs });
});

/**
 * @swagger
 * /api/songs/{id}:
 *   put:
 *     summary: Update song by ID
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Song ID
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SongInput'
 *     responses:
 *       '200':
 *         description: Updated song details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SongResponse'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have admin privileges.
 *       '404':
 *         description: Not Found. Song with the given ID does not exist.
 */

// update song
router.put("/:id", [validObjectId, authAdmin], async (req, res) => {
  const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).send({ data: song, message: "Update song successfully" });
});

/**
 * @swagger
 * /api/songs/{id}:
 *   delete:
 *     summary: Delete song by ID
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Song ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Song deleted successfully
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have admin privileges.
 *       '404':
 *         description: Not Found. Song with the given ID does not exist.
 */

// delete song by id
router.delete("/:id", [validObjectId, authAdmin], async (req, res) => {
  await Song.findByIdAndDelete(req.params.id);
  res.status(200).send({ message: "Song deleted successfully" });
});

/**
 * @swagger
 * /api/songs/like/{id}:
 *   put:
 *     summary: Like or unlike a song
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Song ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Operation successful. Song liked or unliked.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '400':
 *         description: Bad request. Song does not exist.
 */

// like song
router.put("/like/:id", [validObjectId, auth], async (req, res) => {
  let resMessage = "Remove from your liked song";
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(400).send({ message: "song dose not exit" });

  const user = await User.findById(req.user._id);
  const index = user.likedSongs.indexOf(song._id);
  if (index === -1) {
    user.likedSongs.push(song._id);
    resMessage = "Added to your liked song";
  } else {
    user.likedSongs.splice(index, 1);
  }
  await user.save();
  res.status(200).send({ message: resMessage });
});

/**
 * @swagger
 * /api/songs/like:
 *   get:
 *     summary: Get all liked songs by the authenticated user
 *     tags: [Songs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of liked songs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SongsList'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */


// get all liked song
router.get("/like", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const songs = await Song.find({ _id: user.likedSongs });
  res.status(200).send({ data: songs });
});

module.exports = router;
