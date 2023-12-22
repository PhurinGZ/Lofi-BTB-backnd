/**
 * @swagger
 * tags:
 *   name: Playlists
 *   description: API operations related to playlists
 *
 * components:
 *   schemas:
 *     PlayList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60ae100c6fda0441b4725673"
 *         name:
 *           type: string
 *           example: "My Playlist"
 *         desc:
 *           type: string
 *           example: "This is a playlist description"
 *         img:
 *           type: string
 *           example: "https://example.com/playlist-image.jpg"
 *         user:
 *           type: string
 *           example: "60ae0fcb6fda0441b4725672"
 *         songs:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60ae0fcb6fda0441b4725672", "60ae0fcb6fda0441b4725673"]
 *
 *     Song:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60ae0fcb6fda0441b4725672"
 *         title:
 *           type: string
 *           example: "My Song"
 *         artist:
 *           type: string
 *           example: "Artist Name"
 *         duration:
 *           type: number
 *           example: 240
 *
 *     PlayListInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the playlist
 *         desc:
 *           type: string
 *           description: Description of the playlist
 *         img:
 *           type: string
 *           description: URL of the playlist image
 *       required:
 *         - name
 *
 *     PlayListResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/PlayList'
 *
 *     PlayListEditInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: New name of the playlist
 *         desc:
 *           type: string
 *           description: New description of the playlist
 *         img:
 *           type: string
 *           description: New URL of the playlist image
 *
 *     AddSongToPlaylistInput:
 *       type: object
 *       properties:
 *         playListId:
 *           type: string
 *           description: ID of the playlist
 *         songId:
 *           type: string
 *           description: ID of the song to be added to the playlist
 *       required:
 *         - playListId
 *         - songId
 *
 *     RemoveSongFromPlaylistInput:
 *       type: object
 *       properties:
 *         playListId:
 *           type: string
 *           description: ID of the playlist
 *         songId:
 *           type: string
 *           description: ID of the song to be removed from the playlist
 *       required:
 *         - playListId
 *         - songId
 *
 *     PlayListDetailsResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/PlayList'
 *         songs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Song'
 */

const router = require("express").Router();
const { PlayList, validate } = require("../models/playList");
const { Song } = require("../models/song");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const validObjectId = require("../middleware/validObjectId");
const joi = require("joi");

/**
 * @swagger
 * /api/playlists:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayListInput'
 *     responses:
 *       '200':
 *         description: Playlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayListResponse'
 *       '400':
 *         description: Bad request. Invalid input data.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */

// creat playlist
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const user = await User.findById(req.user._id);
  const playList = await PlayList({ ...req.body, user: user._id }).save();
  user.playList.push(playList._id);
  await user.save();

  res.status(200).send({ data: playList });
});

/**
 * @swagger
 * /api/playlists/edit/{id}:
 *   put:
 *     summary: Edit playlist by ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Playlist ID
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayListEditInput'
 *     responses:
 *       '200':
 *         description: Playlist updated successfully
 *       '400':
 *         description: Bad request. Invalid input data.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have access to edit this playlist.
 *       '404':
 *         description: Not Found. Playlist with the given ID does not exist.
 */

// edit playlist by id
router.put("/edit/:id", [validObjectId, auth], async (req, res) => {
  const schema = joi.object({
    name: joi.string().required(),
    desc: joi.string().allow(""),
    img: joi.string().allow(""),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const playList = await PlayList.findById(req.params.id);
  if (!playList) return res.status(404).send({ message: "Playlist not found" });

  const user = await User.findById(req.user._id);
  if (!user._id.equals(playList.user))
    return res.status(403).send({ message: "User don't have access to edit " });
  playList.name = req.body.name;
  playList.desc = req.body.desc;
  playList.img = req.body.img;
  await playList.save();

  res.status(200).send({ message: "Update successfully" });
});

/**
 * @swagger
 * /api/playlists/add-song:
 *   put:
 *     summary: Add a song to a playlist
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddSongToPlaylistInput'
 *     responses:
 *       '200':
 *         description: Song added to playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayListResponse'
 *       '400':
 *         description: Bad request. Invalid input data.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have access to edit this playlist.
 *       '404':
 *         description: Not Found. Playlist or song with the given ID does not exist.
 */

// add song to playlist
router.put("/add-song", auth, async (req, res) => {
  const schema = joi.object({
    playListId: joi.string().required(),
    songId: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const user = await User.findById(req.user._id);
  const playList = await PlayList.findById(req.body.playListId);
  if (!user._id.equals(playList.user))
    return res.status(403).send({ message: "User don't have access to add" });

  if (playList.songs.indexOf(req.body.songId) === -1) {
    playList.songs.push(req.body.songId);
  }
  await playList.save();
  res.status(200).send({ data: playList, message: "Added to play list" });
});

/**
 * @swagger
 * /api/playlists/remove-song:
 *   put:
 *     summary: Remove a song from a playlist
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveSongFromPlaylistInput'
 *     responses:
 *       '200':
 *         description: Song removed from playlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayListResponse'
 *       '400':
 *         description: Bad request. Invalid input data.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have access to edit this playlist.
 *       '404':
 *         description: Not Found. Playlist or song with the given ID does not exist.
 */

// remove song from playlist
router.put("/remove-song", auth, async (req, res) => {
  const schema = joi.object({
    playListId: joi.string().required(),
    songId: joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const user = await User.findById(req.user._id);
  const playList = await PlayList.findById(req.body.playListId);
  if (!user._id.equals(playList.user))
    return res
      .status(403)
      .send({ message: "User don't have access to remove" });

  const index = playList.songs.indexOf(req.body.songId);
  playList.songs.splice(index, 1);
  await playList.save();
  res.status(200).send({ data: playList, message: "Remove from playlist" });
});
/**
 * @swagger
 * /api/playlists/favourite:
 *   get:
 *     summary: Get user's favorite playlists
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of favorite playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlayListResponse'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */

// user favourite playlist
router.get("/favourite", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const playlist = await PlayList.find({ _id: user.playList });
  res.status(200).send({ data: playlist });
});

/**
 * @swagger
 * /api/playlists/random:
 *   get:
 *     summary: Get random playlists
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of random playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlayListResponse'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */

// get random playlist
router.get("/random", auth, async (req, res) => {
  const playList = await PlayList.aggregate([{ $sample: { size: 10 } }]);
  res.status(200).send({ data: playList });
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist by ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Playlist ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Playlist details along with associated songs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayListDetailsResponse'
 *       '400':
 *         description: Bad request. Invalid playlist ID.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have access to view this playlist.
 *       '404':
 *         description: Not Found. Playlist with the given ID does not exist.
 */

// get playlist by id
router.get("/:id", [validObjectId, auth], async (req, res) => {
  const playlist = await PlayList.findById(req.params.id);
  if (!playlist) return res.status(400).send({ message: "not found" });

  const songs = await Song.find({ _id: playlist.songs });
  res.status(200).send({ data: { playlist, songs } });
});

/**
 * @swagger
 * /api/playlists:
 *   get:
 *     summary: Get all playlists
 *     tags: [Playlists]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: List of all playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayListResponse'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */

// get all playlist
router.get("/", auth, async (req, res) => {
  const playlists = await PlayList.find();
  res.status(200).send({ data: playlists });
});

/**
 * @swagger
 * /api/playlists/{id}:
 *   delete:
 *     summary: Delete playlist by ID
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Playlist ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Playlist deleted successfully
 *       '400':
 *         description: Bad request. Invalid playlist ID.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '403':
 *         description: Forbidden. User does not have access to delete this playlist.
 *       '404':
 *         description: Not Found. Playlist with the given ID does not exist.
 */

// delete playlist by id
router.delete("/:id", [validObjectId, auth], async (req, res) => {
  const user = await User.findById(req.user._id);
  const playlist = await PlayList.findById(req.params.id);
  if (!user._id.equals(playlist.user))
    return res
      .status(403)
      .send({ message: "User don't have access to delete" });
  const index = user.playList.indexOf(req.params.id);
  user.playList.splice(index, 1);
  await user.save();
  await playlist.deleteOne();
  res.status(200).send({ message: "Remove from libary" });
});

module.exports = router;
