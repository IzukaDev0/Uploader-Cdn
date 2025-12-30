import axios from "axios"
import {
  GITHUB_TOKEN,
  GITHUB_REPO,
  GITHUB_BRANCH,
  DEFAULT_FOLDER,
  MAX_FILE_AGE_DAYS
} from "./config/settings.js"

const GH_API = "https://api.github.com"
const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "cdn-cleaner"
}

export default async function handler(req, res) {
  try {
    const now = Date.now()
    const limit = MAX_FILE_AGE_DAYS * 24 * 60 * 60 * 1000
    let deleted = []

    // 1️⃣ Ambil list file
    const { data: files } = await axios.get(
      `${GH_API}/repos/${GITHUB_REPO}/contents/${DEFAULT_FOLDER}?ref=${GITHUB_BRANCH}`,
      { headers }
    )

    for (const file of files) {
      if (file.type !== "file") continue

      // 2️⃣ Ambil commit terakhir file
      const { data: commits } = await axios.get(
        `${GH_API}/repos/${GITHUB_REPO}/commits`,
        {
          headers,
          params: {
            path: file.path,
            per_page: 1
          }
        }
      )

      const lastCommitDate = new Date(
        commits[0]?.commit?.committer?.date
      ).getTime()

      if (!lastCommitDate) continue

      // 3️⃣ Cek umur
      if (now - lastCommitDate > limit) {
        // 4️⃣ Delete file
        await axios.delete(
          `${GH_API}/repos/${GITHUB_REPO}/contents/${file.path}`,
          {
            headers,
            data: {
              message: `auto delete old file (${file.name})`,
              sha: file.sha,
              branch: GITHUB_BRANCH
            }
          }
        )

        deleted.push(file.name)
      }
    }

    res.json({
      status: true,
      deleted_count: deleted.length,
      deleted_files: deleted
    })

  } catch (e) {
    res.status(500).json({
      status: false,
      message: e.message
    })
  }
}