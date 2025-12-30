import supabase from '../lib/supabase.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        status: false,
        message: 'Method not allowed'
      })
    }

    const { image } = req.body
    if (!image) {
      return res.status(400).json({
        status: false,
        message: 'Image required'
      })
    }

    const matches = image.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      return res.status(400).json({
        status: false,
        message: 'Invalid base64'
      })
    }

    const mime = matches[1]
    const base64 = matches[2]
    const buffer = Buffer.from(base64, 'base64')

    const ext = mime.split('/')[1] || 'bin'
    const filename = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, buffer, {
        contentType: mime,
        upsert: false
      })

    if (error) throw error

    // 🔥 RETURN LINK CDN BUKAN SUPABASE
    return res.status(200).json({
      status: true,
      url: `${process.env.CDN_ENDPOINT}/${filename}`
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      status: false,
      message: err.message || 'Server error'
    })
  }
  }
