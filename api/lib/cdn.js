const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CDN_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CDN_KEY,
    secretAccessKey: process.env.CDN_SECRET,
  }
})

async function uploadToCDN(buffer, filename, mimetype) {
  const command = new PutObjectCommand({
    Bucket: process.env.CDN_BUCKET,
    Key: `uploads/${filename}`,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read",
  })

  await s3.send(command)

  return `${process.env.CDN_PUBLIC_URL}/uploads/${filename}`
}

module.exports = uploadToCDN
