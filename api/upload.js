import formidable from "formidable"
import fs from "fs"
import uploadToCDN from "../lib/cdn"

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" })

  const form = new formidable.IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message })

    const file = files.file
    const buffer = fs.readFileSync(file.filepath)

    const url = await uploadToCDN(
      buffer,
      file.originalFilename,
      file.mimetype
    )

    res.json({
      status: true,
      creator: "Izuka Dev",
      namedev: "XRizal",
      url
    })
  })
}
