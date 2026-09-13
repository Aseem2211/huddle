export async function getLocalStream(){
    const stream =await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true,
    });

    return stream;
};
