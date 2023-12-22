/**
 * @swagger
 * tags:
 *   name: Search
 *   description: API operations related to search
 */

const router = require("express").Router();
const { Song } = require("../models/song");
const { PlayList } = require("../models/playList");
const auth = require("../middleware/auth");

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for songs and playlists
 *     tags: [Search]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       '200':
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     songs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SongResponse'
 *                     playlists:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PlayListResponse'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */
router.get("/", auth, async (req, res) => {
  const search = req.query.search;
  if (search !== "") {
    const songs = await Song.find({
      name: { $regex: search, $options: "i" },
    }).limit(10);
    const playlists = await PlayList.find({
      name: { $regex: search, $options: "i" },
    }).limit(10);
    const result = { songs, playlists };
    res.status(200).send({ data: result });
  } else {
    res.status(200).send({});
  }
});

module.exports = router;
