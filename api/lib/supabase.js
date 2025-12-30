const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

async function uploadToSupabase(filePath, originalName, mime) {
  const buffer = fs.readFileSync(filePath)

  const filename = Date.now() + '_' + originalName.replace(/\s+/g, '_')
  const filePathInBucket = `uploads/${filename}`

  const { error } = await supabase
    .storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filePathInBucket, buffer, {
      contentType: mime,
      upsert: true
    })

  if (error) throw error

  const publicUrl =
    `${process.env.SUPABASE_URL}` +
    `/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${filePathInBucket}`

  return publicUrl
}

module.exports = uploadToSupabase
