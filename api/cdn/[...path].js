import supabase from '../../lib/supabase.js'

export default async function handler(req, res) {
  try {
    const filePath = req.query.path.join('/')

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .download(filePath)

    if (error || !data) {
      return res.status(404).send('File not found')
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Type', 'application/octet-stream')

    const buffer = Buffer.from(await data.arrayBuffer())
    res.send(buffer)

  } catch (err) {
    res.status(500).send('Server error')
  }
}
