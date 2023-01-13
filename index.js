require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URL, {useNewUrlParser: true});

const articleSchema = {
    title: {
        type: String,
        require: true
    },
    content: String
}
const Article = mongoose.model("Article", articleSchema);

app.route("/articles")
    .get((req, res) => {
        Article.find({}, (err, foundItems) => {
            if(!err) {
                res.send(foundItems);
            } else {
                res.send(err);
            }
        })
    })
    .post((req, res) => {
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        newArticle.save((err) => {
            if (!err) {
                res.send("Successfully added a new article.")
            } else {
                res.send(err);
            }
        })
    })
    .delete((req, res) => {
        Article.deleteMany({}, (err) => {
            if (!err) {
                res.send("Successfully deleted all articles.");
            } else {
                res.send(err);
            }
        })
    });

app.route("/articles/:topic")
    .get((req,res) => {
        Article.findOne({title: req.params.topic}, (err, foundItem) => {
            if(!err) {
                if (foundItem) {        
                    res.send(foundItem);
                } else {
                    res.send("No articles matching that title was found.")
                }
            } else {
                res.send(err);
            }
        })
    })
    .put((req,res) => {
        Article.replaceOne(
            {title: req.params.topic},
            {title: req.body.title, content: req.body.content},
            (err) => {
                if (!err) {
                    res.send("Successfully updated the article");
                } else {
                    res.send(err);
                }
            });
    })
    .patch((req, res) => {
        Article.replaceOne(
            {title: req.params.topic},
            {title: req.body.title, content: req.body.content},
            (err, foundItem) => {
                if (!err || foundItem.n > 0) {
                    res.send("Successfully updated the article.");
                } else if (!err) {
                    res.send("Article specified not found.")
                } else {
                    res.send(err);
                }
            });
    })
    .delete((req, res) => {
        Article.deleteOne({title: req.params.topic}, (err, results) => {
            if (err) {
                res.send(err);
            } else {
                if (results.deletedCount > 0) {
                    res.send(`The Article {${req.params.topic}} was successfully deleted!`);
                } else {
                    res.send("The requested article never existed or doesn't now.");
                }
            }
        });
    });
app.listen(3000, () => {
    console.log("Server set up on port 3000.")
});