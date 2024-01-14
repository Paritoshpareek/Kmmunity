import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
const router = express.Router();
import mongoose from 'mongoose';
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import  serviceAccountKey  from './blogging-app-e0e54-firebase-adminsdk-42p4f-1fef5cbd71.json' assert {type:'json'};
import {getAuth} from "firebase-admin/auth";


const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----schema import----
import User from './Schema/User.js';
import Blog from'./Schema/Blog.js';

// Initialize Cloudinary 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const server = express();
let PORT =3000;

//initilizing google auth
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors())

mongoose.connect(process.env.DB_LOCATION,{
    autoIndex:true
})

const verifyJWT=(req,res,next)=>{
  const authHeader = req.headers['authorization'];
  const token= authHeader && authHeader.split(" ")[1];
  if(token==null){
    return res.status(401).json({error:"No Access Token provided"})
  }

  jwt.verify(token,process.env.SECRET_ACCESS_KEY,(err,user)=>{
    if(err){
      return res.status(403).json({error:"Invalid Access Token"
    })

  }
  req.user= user.id
  next()
})

}
const formatDatatoSend=(user)=>{
    const access_token = jwt.sign({id:user._id},process.env.SECRET_ACCESS_KEY) 
    return{
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

//generating unique useraname
const generateUsername= async(email)=>{
    let username = email.split('@')[0];
    let isUsernameNotUnique= await User.exists({"personal_info.username":username}).then((result)=>result)
    isUsernameNotUnique? username+=nanoid().substring(0,5) :"";
    return username

}
// Endpoint to handle image upload for blog banner to Cloudinary
server.post('/uploadBanner',upload.single('file'),  async (req, res) => {

  try {
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
     

    const result = await cloudinary.uploader.upload_stream(
      { folder:'blog_banners' },
      async (error, result) => {
        if (result) {
          res.json({ secure_url: result.secure_url });
        } else {
          console.error('Error uploading image: ', error);
          res.status(500).json({ error: 'Something went wrong' });
        }
      }
    ).end(req.file.buffer);
  
  } catch (error) {
    console.error('Error uploading image: ', error);
    res.status(500).json({ error: 'Something went wrong' });
  }

});


server.post("/signup",(req,res)=>{
   let{fullname,email,password } =req.body;

   //validating the data form forntend 

   if(fullname.length<3){
    return res.status(403).json({"error":"fullname must be at least 3 characters"})
   }
   if(!email.length){
    return res.status(403).json({"error":"email required"})
   }
   if(!emailRegex.test(email)){
    return res.status(403).json({"error":"email is invalid"})
   }
   if(!passwordRegex.test(password)){
    return res.status(403).json({"error":"password should be 6 to 20 characters long with a numeric, lowercase and uppercase letter "})
   }

   //hashing password 
   bcrypt.hash(password,10,async(err,hashed_password)=>{
    let username =await generateUsername(email);
    let user= new User({
        personal_info:{fullname,email,password:hashed_password,username}
    })
    user.save().then((u)=>{
        return res.status(200).json(formatDatatoSend(u));
    })

    .catch(err=>{
        if(err.code ==11000){
            return res.status(500).json({
                "error":"Email already exists"
            })
        }
        return res.status(500).json({"error": err.message});
    })
   })


})

//---------signin ------

server.post("/signin",(req,res)=>{
    let {email,password}= req.body;
    
    User.findOne({"personal_info.email":email })
    .then((user)=>{

        if(!user){
            return res.status(403).json({"error":"Email not found"})
        }
        if( !user.google_auth){
        bcrypt.compare(password,user.personal_info.password ,(err,result)=>{
            if(err){
                return res.status(403).json({"error":"Error occured while logging in please try again"});
            }
            if(!result){
                return res.status(403).json({"error":"Incorrect Password"})
            } else{
                return res.status(200).json(formatDatatoSend(user))
            }
        })
        }
        else{
            return res.status(403).json({"error":"Account was created using google. Try logging in with google"})
        }
    })
    .catch(err=>{
        console.log(err);
        return res.status(500).json({"error":err.message})
    })
})

//google login 
server.post("/google-auth", async (req, res) => {
    let { access_token } = req.body;
    //verifying token 
    getAuth()
      .verifyIdToken(access_token)
      .then(async (decodedUser) => {
        //storing user details in db 
        let { email, name, picture } = decodedUser;
        //upgrading low-quality user profile -> Stack Overflow suggested one
        picture = picture.replace("s96-c", "s384-c"); //384X384 px 
        //creating user in db after checking if already exists or not 
        let user = await User.findOne({ "personal_info.email": email })
          .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.google_auth ").then((u) => {
            return u || null;
          })
          .catch(err => {
            return res.status(500).json({ "error": err.message });
          });
  
        if (user) {
          //logging in after checking if password exists or not if yes then not allowing to enter google auth 
          if (user.google_auth) {
            //cannot enter through google auth as already password exists 
            return res.status(403).json({ "error": "This email was registered without using Google sign-up. Please log in using your password to access your account." });
          }
        } 
        else {
          //sign up 
          let username = await generateUsername(email);
          user = new User({
            personal_info: { fullname: name, email, profile_img: picture, username },
            google_auth: true
          })
          await user.save().then((u) => {
            user = u;
          })
            .catch(err => {
              return res.status(500).json({ "error": err.message });
            });
        }
        return res.status(200).json(formatDatatoSend(user))
      })
      .catch(err => {
        return res.status(500).json({ "error": "Failed to authenticate you with Google. Try with some other Google account" });
      });
  });

server.post('/latest-blogs',(req,res)=>{

  let{page}=req.body;

  let maxLimit=5;

  Blog.find({draft: false})
  .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id" )
  .sort({"publishedAt":-1})
  .select("blog_id title des content banner activity tags publishedAt -_id")
  .skip( (page-1) * maxLimit )
  .limit(maxLimit)
  .then(blogs=>{
    return res.status(200).json({blogs})
  })
  .catch(err=>{
    return res.status(500).json({ error: err.message });
  })

})  

server.post( "/all-latest-blogs-count",(req,res)=>{
  Blog.countDocuments({draft:false})
  .then(count=>{
    return res.status(200).json({totalDocs:count})
  })
  .catch(err=>{
    console.log(err.message)
    return res.status(500).json({error:err.message})
  })
})

server.get("/trending-blogs", (req, res)=>{

  Blog.find({draft:false})
  .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id" )
  .sort({"activity.total_read": -1 , "activity.total_likes": -1 , "publishedAt": -1})
  .select("blog_id title publishedAt -_id")
  .limit(5)
  .then(blogs=>{
    return res.status(200).json({blogs})
  })
  .catch(err=>{
    return res.status(500).json({error:err.message})
  })
})

server.post("/search-blogs",(req,res)=>{

  let {tag,query,author,page,limit,eliminate_blog} = req.body;
  let findQuery ;

  if(tag){
     findQuery = {tags: tag, draft:false,blog_id:{$ne:eliminate_blog}};
  }
  else if(query){
    findQuery = {title: new RegExp(query,'i'), draft:false};
  }
  else if(author){
    findQuery={author,draft:false}
  }
  let maxLimit= limit?limit:5;
  Blog.find(findQuery) 
  .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id" )
  .sort({ "publishedAt": -1})
  .select("blog_id title des banner activity tags publishedAt-_id")
  .skip((page-1)*maxLimit)
  .limit(maxLimit)
  .then(blogs=>{
    return res.status(200).json({blogs})
  })
  .catch(err=>{
    return res.status(500).json({error:err.message})
  })
})

server.post("/search-blogs-count",(req,res)=>{
  let {tag,author,query}= req.body;

  let findQuery;

  if(tag){
    let findQuery = {tags:tag, draft:false};
  }
  else if(query){
    findQuery = {title: new RegExp(query,'i'), draft:false};
  }
   else if(author){
    findQuery={author,draft:false}
  }

  Blog.countDocuments(findQuery)
  .then(count=>{
    return res.status(200).json({totalDocs:count})
  })
  .catch(err=>{
    console.log(err.message);
    return res.status(500).json({error:err.message});
  })
})

server.post("/search-users",(req, res)=>{
  let {query}= req.body;
  User.find({"personal_info.username":new RegExp(query,'i')})
  .limit(50)
  .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
 
  .then(users=>{
   return res.status(200).json({users})
  })
  .catch(err=>{
   return res.status(500).json({error:err.message});
  })
 })


server.post ("/get-profile",(req,res)=>{
  let{username} = req.body;
  User.findOne({"personal_info.username":username})
  .select("-personal_info.password -google_auth -updatedAt -blogs")
  .then(user=>{
    return res.status(200).json(user)
  })
  .catch(err=>{
    return res.status(500).json({error:err.message});
  })

})
 

// server.post('/create-blog',verifyJWT , (req, res) => {
//   let authorId = req.user;
//   let{title, des,banner,tags,content,draft}=req.body;

//   if(!title.length){
//    return res.status(403).json({ error:"you must provide a title"})
//   }

//   if(!des.length || des.length>200){
//    return res.status(403).json({ error:"Blog description should be under 200 character limit"})
//   }
//   if(!banner.length){
//     return res.status(403).json({ error:"Blog Banner is required in order to publish"})
//   }

//   if(!content.blocks.length){
//     return res.status(403).json({ error:"There must be some contetn to publish"})
//   }
//   if(!tags.length || tags.length>10){
//     return res.status(403).json({ error:"Tags are  required in order to publish , Max limit is 10"})
//   }
//   tags= tags.map(tag=>tag.toLowerCase());

//   //making new blog id from title without special char. and nanoid
//   let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-")+ nanoid();
  
//   let blog= new Blog({
//     title,
//     des,
//     banner,
//     content,
//     tags,
//     author:authorId,
//     blog_id,
//     draft: Boolean(draft)
//   })
//   //saving and updaing total blog count and blog array of user 
//   blog.save().then(blog=>{
//     let incrementBlog= draft ? 0: 1;
//     User.findOneAndUpdate({_id:authorId},{$inc:{"account_info.total_posts":incrementBlog}, $push:{"blogs":blog._id}})
//     .then(user=>{
//       return res.status(200).json({id:blog.blog_id})
//     })
//     .catch(err=>{
//       return res.status(500).json({error:"failed to update total posts number "})
//     })
//   })
//   .catch(err=>{
//     return res.status(500).json({error:err.message})
//   })
 

//   return res.json({status:'done'})

// })
server.post('/create-blog', verifyJWT, (req, res) => {
  let authorId = req.user;
  let { title, des, banner, tags, content, draft, id } = req.body; 
  
  if (!title.length) {
    return res.status(403).json({ error: "you must provide a title" });
  } 

  if(!draft){
     if (!des.length || des.length > 200) {
      return res.status(403).json({ error: "Blog description should be under 200 character limit" });
    // } else if (!banner.length) {
    //   return res.status(403).json({ error: "Blog Banner is required in order to publish" });
    } else if (!content.blocks.length) {
      return res.status(403).json({ error: "There must be some content to publish" });
    } else if (!tags.length || tags.length > 10) {
      return res.status(403).json({ error: "Tags are required in order to publish, Max limit is 10" });
    }
  }


  // Normalize tags to lowercase
  tags = tags.map(tag => tag.toLowerCase());

  // Create a unique blog ID
  let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-") + nanoid();

 // checking if we are submitting a exsisting blog by editing it 

  if(id){
    Blog.findOneAndUpdate({blog_id:id}, {title,des, banner ,content , tags, draft:draft?draft : false})
    .then(()=>{
      return res.status(200).json({id:blog_id});
    })
    .catch(err=>{
      return res.status(500).json({error:err.message})
    })
  }
   else{
  // Create a new blog
   let blog = new Blog({
     title,
     des,
     banner,
     content,
     tags,
     author: authorId,
     blog_id,
     draft: Boolean(draft)
   });

   // Save the blog and update the user's blogs
   blog.save().then(blog => {
     let incrementBlog = draft ? 0 : 1;
     User.findOneAndUpdate({ _id: authorId }, {
       $inc: { "account_info.total_posts": incrementBlog },
       $push: { "blogs": blog._id }
     })
     .then(user => {
       return res.status(200).json({ id: blog.blog_id });
     })
     .catch(err => {
       return res.status(500).json({ error: "Failed to update total posts number" });
     });
   })
   .catch(err => {
     return res.status(500).json({ error: err.message });
   });
  }


});

server.post("/get-blog",(req,res)=>{

  let {blog_id, draft, mode}= req.body;
  
  let incrementVal= mode != "edit" ? 1 : 0 ;

  Blog.findOneAndUpdate({blog_id}, {$inc:{"activity.total_reads":incrementVal}})
  .populate("author","personal_info.fullname personal_info.username personal_info.profile_img")
  .select("title des content banner activity publishedAt blog_id tags ")
  .then(blog=>{

    User.findOneAndUpdate({"personal_info.username":blog.author.personal_info.username},{$inc:{"account_info.total_reads":incrementVal}
  }).catch(err=>{
    return res.status(500).json({error:err.message});
  })
  if(blog.draft && !draft){
    return res.status(500).json({error:"you cannot access draft blog"});
  }
    return res.status(200).json({blog});
  }).catch(err=>{
    return res.status(500).json({error:err.message});
  })
})

server.listen(PORT, ()=>{
    console.log('listening on port :'+PORT);
}) 



// import express from 'express';
// import mongoose from 'mongoose';
// import 'dotenv/config'
// import bcrypt from 'bcrypt'
// import { nanoid } from 'nanoid';
// import jwt from "jsonwebtoken";
// import cors from "cors";
// import admin from "firebase-admin";
// import  serviceAccountKey  from './blogging-app-e0e54-firebase-adminsdk-42p4f-1fef5cbd71.json' assert {type:'json'};
// import {getAuth} from "firebase-admin/auth";



// // ----schema import----
// import User from './Schema/User.js';



// const server = express();
// let PORT =3000;

// //initilizing google auth
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccountKey)
// })

// let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
// let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// server.use(express.json());
// server.use(cors())

// mongoose.connect(process.env.DB_LOCATION,{
//     autoIndex:true
// })

// const formatDatatoSend=(user)=>{
//     const access_token = jwt.sign({id:user._id},process.env.SECRET_ACCESS_KEY) 
//     return{
//         access_token,
//         profile_img: user.personal_info.profile_img,
//         username: user.personal_info.username,
//         fullname: user.personal_info.fullname
//     }
// }

// //generating unique useraname
// const generateUsername= async(email)=>{
//     let username = email.split('@')[0];
//     let isUsernameNotUnique= await User.exists({"personal_info.username":username}).then((result)=>result)
//     isUsernameNotUnique? username+=nanoid().substring(0,5) :"";
//     return username

// }

// server.post("/signup",(req,res)=>{
//    let{fullname,email,password } =req.body;

//    //validating the data form forntend 

//    if(fullname.length<3){
//     return res.status(403).json({"error":"fullname must be at least 3 characters"})
//    }
//    if(!email.length){
//     return res.status(403).json({"error":"email required"})
//    }
//    if(!emailRegex.test(email)){
//     return res.status(403).json({"error":"email is invalid"})
//    }
//    if(!passwordRegex.test(password)){
//     return res.status(403).json({"error":"password should be 6 to 20 characters long with a numeric, lowercase and uppercase letter "})
//    }

//    //hashing password 
//    bcrypt.hash(password,10,async(err,hashed_password)=>{
//     let username =await generateUsername(email);
//     let user= new User({
//         personal_info:{fullname,email,password:hashed_password,username}
//     })
//     user.save().then((u)=>{
//         return res.status(200).json(formatDatatoSend(u));
//     })

//     .catch(err=>{
//         if(err.code ==11000){
//             return res.status(500).json({
//                 "error":"Email already exists"
//             })
//         }
//         return res.status(500).json({"error": err.message});
//     })
//    })


// })

// //---------signin ------

// server.post("/signin",(req,res)=>{
//     let {email,password}= req.body;
    
//     User.findOne({"personal_info.email":email })
//     .then((user)=>{

//         if(!user){
//             return res.status(403).json({"error":"Email not found"})
//         }
//         if( !user.google_auth){
//         bcrypt.compare(password,user.personal_info.password ,(err,result)=>{
//             if(err){
//                 return res.status(403).json({"error":"Error occured while logging in please try again"});
//             }
//             if(!result){
//                 return res.status(403).json({"error":"Incorrect Password"})
//             } else{
//                 return res.status(200).json(formatDatatoSend(user))
//             }
//         })
//         }
//         else{
//             return res.status(403).json({"error":"Account was created using google. Try logging in with google"})
//         }
//     })
//     .catch(err=>{
//         console.log(err);
//         return res.status(500).json({"error":err.message})
//     })
// })

// //google login 
// server.post("/google-auth", async (req, res) => {
//     let { access_token } = req.body;
//     //verifying token 
//     getAuth()
//       .verifyIdToken(access_token)
//       .then(async (decodedUser) => {
//         //storing user details in db 
//         let { email, name, picture } = decodedUser;
//         //upgrading low-quality user profile -> Stack Overflow suggested one
//         picture = picture.replace("s96-c", "s384-c"); //384X384 px 
//         //creating user in db after checking if already exists or not 
//         let user = await User.findOne({ "personal_info.email": email })
//           .select("personal_info.fullname personal_info.username personal_info.profile_img personal_info.google_auth ").then((u) => {
//             return u || null;
//           })
//           .catch(err => {
//             return res.status(500).json({ "error": err.message });
//           });
  
//         if (user) {
//           //logging in after checking if password exists or not if yes then not allowing to enter google auth 
//           if (user.google_auth) {
//             //cannot enter through google auth as already password exists 
//             return res.status(403).json({ "error": "This email was registered without using Google sign-up. Please log in using your password to access your account." });
//           }
//         } 
//         else {
//           //sign up 
//           let username = await generateUsername(email);
//           user = new User({
//             personal_info: { fullname: name, email, profile_img: picture, username },
//             google_auth: true
//           })
//           await user.save().then((u) => {
//             user = u;
//           })
//             .catch(err => {
//               return res.status(500).json({ "error": err.message });
//             });
//         }
//         return res.status(200).json(formatDatatoSend(user))
//       })
//       .catch(err => {
//         return res.status(500).json({ "error": "Failed to authenticate you with Google. Try with some other Google account" });
//       });
//   });
  



// server.listen(PORT, ()=>{
//     console.log('listening on port :'+PORT);
// })