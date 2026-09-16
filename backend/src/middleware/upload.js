const multer=require("multer");
const path=require("path");
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../../uploads/avatars"));
    },
    filename:function(req,file,cb){
        const ext=path.extname(file.originalname);
        cb(null,`user+${req.user.id}_${Date.now()}${ext}`);
    },
});
function fileFilter(req,file,cb){
    const allowedTypes=["images/jpeg","image/png","image/webp"];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error("Only JPG,PNG oeWEBP images are allowed"));
    }
}
const upload=multer({
    storage,
    fileFilter,
    limits:{fileSize:5*1024*1024},
});
module.exports=upload;