import {startScreenshare,stopScreenShare} from "../webRTC/screenshare.js";
import {MonitorUp,MonitorX} from "lucide-react";
const [sharingScreen,setSharingScreen]=useState(false);
const screenStreamRef=useRef(null);
const toggleScreenShare=async()=>{
    if(!sharingScreen){
        try{
            const {screenStream,screenTrack}=await startScreenShare(peersRef.current);
            screenStreamRef.current=screenStream;
            setSharingScreen(true);
            screenTrack.onended=()=>stopSharing();
            
        }catch(err){
            console.error("Screen share failed",err);

        }
    }
    else{
        stopSharing();
    }
    
    
};
const stopSharing=()=>{
    if(screenStreamRef.current){
        stopScreenShare(peersRef.current,localStreamRef.current);
        screenStreamRef.current.getTracks().forEach((tracks)=>track.stop());
        screenStreamRef.current=null;
    }
    setSharingScreen(false);
};
<button
  onclick={toggleScreenShare}
  className={`p-3 rounded-full transition ${
    sharingScreen ?"bg-red-500 text-white":"bg-gray-700 text-white"

  }`}
  title={sharingScreen ? "Stop sharing":"Share screen"}
  >
    {sharingScreen?<MonitorX size={20}/>:<MonitorUp size={20}/>}

</button>


