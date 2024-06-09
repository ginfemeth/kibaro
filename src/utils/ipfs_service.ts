
import axios from 'axios'

const IPFS_UPLOAD_URL = 'http://localhost:5001/ipfs/upload';
const IPFS_GET_URL = 'http://localhost:5001/ipfs/fetch'

const uploadToIPFS = async (fileList: any) => {
    try {
        const resp = await axios.post(IPFS_UPLOAD_URL, {
            data: fileList,
        })

        return resp.data.value
    } catch (error) {
        console.log(error)
        throw new Error('Failed to upload to IPFS: ' + error);
    }
};

const getIpfsFile = async (cid: string) => {
    try {
        const resp = await axios.get(IPFS_GET_URL, {
            params: { cid: cid },
        })
        return (resp.data)
    } catch (error) {
        console.log(error)
        throw new Error('Failed to get file from IPFS: ' + error);
    }
};

export { uploadToIPFS, getIpfsFile };
