import multer from "multer";
import path from 'path';


const pathFolderUpload = path.resolve(__dirname, '..', 'uploads');


const storage = multer.diskStorage({

    destination: pathFolderUpload,
    
    filename: (request, file, callback) => {
        
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const extensionFile = file.originalname.split(".").at(-1);
        const fileNameUpload = `avatar_${uniqueName}.${extensionFile}`;

        callback(null, fileNameUpload);
    }
})


export default multer({storage});

export {
    pathFolderUpload
}