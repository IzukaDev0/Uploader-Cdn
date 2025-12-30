export default async function handler(req, res) {
  try {
    const path = req.query.path.join('/')

    const supabaseUrl = process.env.SUPABASE_URL
    const bucket = process.env.SUPABASE_BUCKET

    const fileUrl =
      `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`

    const response = await fetch(fileUrl)

    if (!response.ok) {
      return res.status(404).send('File not found')
    }

    // forward content-type
    res.setHeader(
      'Content-Type',
      response.headers.get('content-type') || 'application/octet-stream'
    )

    // cache CDN (1 tahun)
    res.setHeader(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )

    const buffer = Buffer.from(await response.arrayBuffer())
    res.status(200).send(buffer)

  } catch (err) {
    console.error(err)
    res.status(500).send('CDN error')
  }
}
