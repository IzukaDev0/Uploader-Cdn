export default async function handler(req, res) {
  const { path } = req.query

  const filePath = Array.isArray(path) ? path.join('/') : path

  const supabaseURL = `https://wwmntyofsamxsjkvznau.supabase.co/storage/v1/object/public/uploads/${filePath}`

  const response = await fetch(supabaseURL)

  if (!response.ok) {
    return res.status(404).send('File not found')
  }

  res.setHeader('Content-Type', response.headers.get('content-type'))
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

  response.body.pipe(res)
}
