import koa from 'koa'
import koastatic from 'koa-static'
import path from 'path'

const app = new koa()
const staticDirPath = path.join(import.meta.dirname, 'public')

app.use(koastatic(staticDirPath))

app.use(async (ctx) => {
  ctx.body = 'Hello'
})

app.listen('3666')
