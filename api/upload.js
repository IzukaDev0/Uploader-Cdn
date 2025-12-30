import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res
        .status(405)
        .json({ status: false, message: 'Method not allowed' })
    }

    const { image } = req.body

    if (!image) {
      return res
        .status(400)
        .json({ status: false, message: 'Image required' })
    }

    // ambil mime + base64
    const matches = image.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      return res
        .status(400)
        .json({ status: false, message: 'Invalid base64' })
    }

    const mime = matches[1]
    const base64 = matches[2]
    const buffer = Buffer.from(base64, 'base64')

    const ext = mime.split('/')[1] || 'bin'
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, buffer, {
        contentType: mime,
        upsert: false
      })

    if (error) throw error

    const { data } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(filename)

    return res.status(200).json({
      status: true,
      url: data.publicUrl
    })

  } catch (err) {
    console.error('UPLOAD ERROR:', err)
    return res.status(500).json({
      status: false,
      message: err.message || 'Server error'
    })
  }
}
