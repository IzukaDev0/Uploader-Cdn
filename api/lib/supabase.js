const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const settings = require("../config/settings")

const supabase = createClient(
  settings.SUPABASE_URL,
  settings.SUPABASE_KEY
)

async function uploadFile(filePath, filename, mime) {
  const buffer = fs.readFileSync(filePath)
  const name = Date.now() + "_" + filename.replace(/\s+/g, "_")

  const { error } = await supabase
    .storage
    .from(settings.SUPABASE_BUCKET)
    .upload(name, buffer, {
      contentType: mime,
      upsert: true
    })

  if (error) throw error

  return `${settings.SUPABASE_URL}/storage/v1/object/public/${settings.SUPABASE_BUCKET}/${name}`
}

module.exports = uploadFile
