const fs = require("fs")

module.exports = function cleanup(path) {
  try {
    if (fs.existsSync(path)) fs.unlinkSync(path)
  } catch {}
}
