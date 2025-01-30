const path=require("path");

const express=require("express");
const mongoose=require("mongoose");
const userRoute=require("./routes/user");
const cookieParser=require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const summarizeRoute = require("./routes/summarizeRoute");
require('dotenv').config();

const Blog =require("./models/blog");
const blogRoute=require("./routes/blog");

const app = express();
const PORT=8000;

mongoose.connect("mongodb://localhost:27017/blogify")
.then((e) => console.log("MongoDB connected"))

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get('/',async (req,res) => {
    const allBlogs= await Blog.find({}).sort({createdAt:-1}); 
    res.render("home",{
        user:req.user,
        blogs:allBlogs,
    });
});
app.use('/user',userRoute);
app.use('/blog',blogRoute);
app.use("/api", summarizeRoute); // Add the summarize route under /api


app.listen(PORT,() => console.log(`Server started at PORT:${PORT}`));
