const express = require("express");
const urlRoute = require("./routes/url");
const path = require('path');
const staticRoute = require('./routes/staticRoutes');
const userRoute = require('./routes/user')
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;
const URL = require("./models/url")
const { connectToMongoDB } = require("./connect");
const { restrictToLoggedinUserOnly, checkAuth } = require('./middlewares/auth')


connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongo DB connected")
);

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'))
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use('/user', userRoute);
app.use('/',checkAuth, staticRoute);

app.get("/url/:id", async (req, res) => {
    const shortId = req.params.id;

    try {
        const entry = await URL.findOneAndUpdate(
            { shortID: shortId },
            {
                $push: {
                    viewHistory: {
                        timestamp: Date.now(),
                    },
                },
            },
            { new: true } // This option returns the modified document
        );

        if (!entry) {
            return res.status(404).send('URL not found');
        }

        console.log("Entry:", entry); // Log the entire entry object
        console.log("Entry.redirectURL:", entry.redirectURL); // Log the redirectURL

        if (entry.redirectURL) {
            res.redirect(entry.redirectURL);
        } else {
            console.error("Redirect URL is missing");
            res.status(500).send('Redirect URL is missing');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => console.log(`SERVER STARTED AT PORT ${PORT}`));
