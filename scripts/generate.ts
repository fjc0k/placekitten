import { join } from 'path'
import { sample, range } from 'vtils'
import * as fs from 'fs-extra'
import * as sharp from 'sharp'

async function main(rootDir: string) {
  const start = 10
  const end = 1000
  const sizes = range(start, end + 1, 10)
  const srcDir = join(rootDir, 'src')
  const imgDir = join(rootDir, 'images')
  const srcImages = await Promise.all(
    (await fs.readdir(srcDir)).map(file => join(srcDir, file)).map(file => fs.readFile(file)),
  )
  await fs.remove(imgDir)
  await fs.ensureDir(imgDir)
  await Promise.all(sizes.map(width => fs.ensureDir(join(imgDir, String(width)))))
  for (const width of sizes) {
    await Promise.all(
      sizes.map(async height => {
        await sharp(sample(srcImages))
          .resize({
            width: width,
            height: height,
            fit: sharp.fit.cover,
            kernel: 'lanczos3',
            position: sharp.strategy.entropy,
          })
          .jpeg({
            quality: 80,
          })
          .toFile(join(imgDir, `${width}/${height}.jpg`))
        // GC
        await true
      }),
    )
    // GC
    await true
  }
}

main(join(__dirname, '..'))
