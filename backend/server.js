const http=require('http');
const app=require("./src/app.js");
const PORT=3002;
const server=http.createServer(app);
server.listen(PORT,()=>{
    console.log(`server is running on at http://localhost:${PORT}`);
});