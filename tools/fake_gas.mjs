// gas/Code.gs 를 그대로 돌려 보는 가짜 구글 환경(시트·잠금·속성·캐시) + HTTP 서버
// node tools/fake_gas.mjs [포트=5199]   ·  GET /__sheet 로 시트 내용 확인
import http from 'node:http'

const PORT = Number(process.argv[2] ?? 5199)

import { makeGas } from './gas_sim.mjs'
const { ctx, sheets } = makeGas()

http
  .createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') {
      // 진짜 Apps Script 는 사전 확인(preflight)을 받지 못함 — 앱이 이걸 부르면 실패해야 맞음
      res.writeHead(405)
      return res.end('preflight not supported')
    }
    if (req.method === 'GET' && req.url.startsWith('/__sheet')) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      return res.end(JSON.stringify(sheets['참가자']?.rows ?? [], null, 1))
    }
    let body = ''
    req.on('data', (d) => (body += d))
    req.on('end', () => {
      const out = req.method === 'POST' ? ctx.doPost({ postData: { contents: body } }) : ctx.doGet()
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(out.s)
    })
  })
  .listen(PORT, () => console.log(`fake GAS http://localhost:${PORT}/`))
