require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const connection = require("../db");
const userRoutes = require("../routes/user");
const authRoutes = require("../routes/auth");
const songsRoutes = require("../routes/songs");
const playlistRoutes = require("../routes/playList");
const searchRoutes = require("../routes/search");
const app = express();

connection();
app.use(cors());
app.use(express.json());

app.get('/', (req,res) =>{
    res.send('this Lofi-BTB apis')
})
app.use("/api/users", userRoutes);
app.use("/api/login", authRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/", searchRoutes);

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on pot ${port}...`));
