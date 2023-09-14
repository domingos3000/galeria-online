import fs from 'fs';
import path from 'path';


const deleteFile = async (src: string | null | undefined) => {

    const file = src || '';
    
    const fileURL = path.resolve(__dirname, '..', 'uploads', file);

    await fs.promises.unlink(fileURL).catch(err => {
        
        return null;
    })
}


export default deleteFile;