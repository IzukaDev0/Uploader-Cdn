import axios from "axios"
import {
  GITHUB_TOKEN,
  GITHUB_REPO,
  GITHUB_BRANCH,
  DEFAULT_FOLDER
} from "./config/settings.js"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: false,
      message: "Method not allowed"
    })
  }

  try {
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      throw new Error("GitHub config belum lengkap")
    }

    let { image } = req.body
    if (!image) {
      return res.status(400).json({
        status: false,
        message: "Image base64 wajib diisi"
      })
    }

    // 🔥 pastikan base64 bersih
    image = image.replace(/^data:image\/\w+;base64,/, "")

    const filename =
      `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

    const path = `${DEFAULT_FOLDER}/${filename}`

    const apiUrl =
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`

    await axios.put(
      apiUrl,
      {
        message: `upload ${filename}`,
        content: image,
        branch: GITHUB_BRANCH
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      }
    )

    const rawUrl =
      `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`

    res.status(200).json({
      status: true,
      url: rawUrl
    })

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message)
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}