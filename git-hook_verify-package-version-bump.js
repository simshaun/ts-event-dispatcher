const execa = require('execa')
const proc = require('process')

;(async () => {
  const versionBumpError = 'Expected version bump in package.json'

  const { stdout: status } = await execa('git status --porcelain=v1')
  if (status.indexOf('M package.json') === -1) {
    console.error(versionBumpError)
    proc.exit(1)
  }

  const { stdout: diff } = await execa('git diff --unified=0 package.json')
  if (diff.indexOf('-  "version":') === -1 || diff.indexOf('+  "version":') === -1) {
    console.error(versionBumpError)
    proc.exit(1)
  }
})()
