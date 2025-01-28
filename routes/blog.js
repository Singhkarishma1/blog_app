const {Router} = require('express');
const multer = require('multer');
const path = require('path');
const router=Router();
const Blog=require('../models/blog');
const Comment=require('../models/comment');


const storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, path.resolve(`./public/uploads/`))
   },
   filename: function (req, file, cb) {
   const fileName=`${Date.now()}-${file.originalname}`;
       cb(null, fileName);
   },
 })
 
 const upload = multer({ storage: storage })

router.get('/add-new',(req,res) => {
   return res.render('addBlog',{
         user:req.user,
   });
});
router.get("/:id", async (req, res) => {
   const blog = await Blog.findById(req.params.id).populate("createdBy");
   const comments = await Comment.find({ blogId: req.params.id }).populate(
     "createdBy"
   );
   console.log("comments",comments);
 
   return res.render("blog", {
     user: req.user,
     blog,
     comments,
   });
 });
router.get('/:id',async (req,res) => {
   const blog=await Blog.findById(req.params.id).populate('createdBy');
   
   console.log("blog",blog);
   return res.render('blog',{
         blog,
         user:req.user,
   });
  
});

router.post("/comments/:blogId", async (req, res) => {
   try {
     const { content } = req.body;
 
     // Ensure user is logged in
     if (!req.user) {
       return res.status(401).send("Unauthorized");
     }
 
     // Create a new comment
     const comment = await Comment.create({
       content,
       blogId: req.params.blogId,
       createdBy: req.user._id,
     });
 
     // Redirect to the blog page
     return res.redirect(`/blog/${req.params.blogId}`);
   } catch (error) {
     console.error(error);
     return res.status(500).send("Server error");
   }
 });
 

router.post("/",upload.single('coverImageURL'), async (req,res) => {
   const {title ,body} = req.body; 
   const userId=req.user._id;  
   const blog =await Blog.create({
        body,
         title,
         coverImageURL:`uploads/${req.file.filename}`,
         createdBy: req.user._id,
      }); 
      return res.redirect(`/blog/${blog._id}`);
     
   });

   // router.delete('/:id',async (req,res) => {
   //    await Blog.findByIdAndDelete(req.params.id);
   //    return res.redirect('/profile');
   // });
module.exports=router;
