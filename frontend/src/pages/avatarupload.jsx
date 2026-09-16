import {useState,useRef} from "react";
import axiosClient from "../services/axiosclient.js";
export default function AvatarUpload({currentAvatarUrl,onUploadSuccess}){
    const [preview,setPreview]=useState(currentAvatarUrl||null);
    const [uploading,setUploading]=useState(false);
    const [error,setError]=useState("");
    const fileInputRef=useRef(null);
    const handleFileSelect=(e)=>{
        const fiel=e.target.files[0];
        if(!file){
            return;
        }
        setError("");
        const allowedTypes=["images/jpeg","image/png","image/webp"];
        if(!allowedTypes.includes(file.type)){
            setError("Only JPEG,PNG,or WEBP images are allowed");
            return;
        }
        if(file.size>5*1024*1024){
            setError("File must be under 5MB");
            return;
        }
        setPreview(URL.createObjectURL(file));
        handleUpload(file);
    };
    const handleUpload=async(file)=>{
        setUploading(true);
        setError("");
        const formData=new FormData();
        formData.append("avatar",file);
        try{
            const res=await axiosClient.post("/auth/upload-avatar",formData,{
               headers:{"Content-Type":"multipart/form-Data"}, 
            });
            onUploadSuccess?.(res.data.avatarUrl);
        }catch(err){
            setError(err.response?.data?.error||"Upload failed");
            setPreview(currentAvatarUrl || null);
        }finally{
            setUploading(false);
        }
    };
     return (
    <div className="avatar-upload">
      <div
        className="avatar-preview"
        onClick={() => fileInputRef.current.click()}
      >
        {preview ? (
          <img src={preview.startsWith("blob:") ? preview : preview} alt="Profile" />
        ) : (
          <div className="avatar-placeholder">+</div>
        )}
        {uploading && <div className="avatar-overlay">Uploading…</div>}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading…" : "Change photo"}
      </button>

      {error && <div className="auth-error">{error}</div>}
    </div>
  );

    
}