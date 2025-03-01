import { PinataSDK } from 'pinata-web3'
import fs from 'fs'
import path from 'path'

const pinata = new PinataSDK({
    pinataJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1YTZiNDM4MC1mNmNkLTQ0YTctYWQ0Zi0yODJiYjUxYTg2NGIiLCJlbWFpbCI6InByYWJodS52QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhZmYyNTQ5MjRjMDhmNWIxY2JhMSIsInNjb3BlZEtleVNlY3JldCI6IjlkMTA1MDNkZmMwN2VjZmRmOTM4ZGI5ZTQ3NGJmZGUzM2VkNmEyZjkzNTdhNmI2MjFmMWNlNDk4MTUwMTNlNmMiLCJleHAiOjE3NzIzNDU4MTF9.lsBjt3tlTL1qdgGC8GhFiFH6eL9zfeMu56D5DePPMT8'
})

export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
    const { IpfsHash } = await pinata.upload.json(jsonMetadata)
    return IpfsHash
}

// could use this to upload music (audio files) to IPFS
export async function uploadFileToIPFS(filePath: string, fileName: string, fileType: string): Promise<string> {
    const fullPath = path.join(process.cwd(), filePath)
    const blob = new Blob([fs.readFileSync(fullPath)])
    const file = new File([blob], fileName, { type: fileType })
    const { IpfsHash } = await pinata.upload.file(file)
    return IpfsHash
}
