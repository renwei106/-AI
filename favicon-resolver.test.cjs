const test = require('node:test')
const assert = require('node:assert/strict')
const { iconFromHTML, privateAddress } = require('./favicon-resolver.cjs')

test('从网页声明中解析 Logo 地址', () => {
  assert.equal(iconFromHTML('<link rel="icon" href="icons/site.svg">', 'https://example.com/path/page'), 'https://example.com/path/icons/site.svg')
  assert.equal(iconFromHTML('<html></html>', 'https://example.com/path/page'), 'https://example.com/favicon.ico')
})

test('拒绝内网地址', () => {
  for (const address of ['127.0.0.1', '10.0.0.8', '172.16.1.2', '192.168.1.2', '::1', 'fc00::1']) assert.equal(privateAddress(address), true)
  assert.equal(privateAddress('8.8.8.8'), false)
})
