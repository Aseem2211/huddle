const {customAlphabet}=require("nanoid");
const nanoid=customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789",10);
function generateRoomId(){
    return nanoid();
}
module.exports=generateRoomId;