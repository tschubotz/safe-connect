export const blobToImageData = async (blob:string) => {
    // let blobUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
                let img = new Image();
                img.onload = () => resolve(img);
                img.onerror = err => reject(err);
                img.src = blob;
            }).then((img: any) => {

                let canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext("2d");
                
                if (!ctx) throw new Error("Could not generate context from canvas");

                ctx.drawImage(img, 0, 0);
                console.log({img})
                return ctx.getImageData(0, 0, img.width, img.height);    // some browsers synchronously decode image here
            })
}