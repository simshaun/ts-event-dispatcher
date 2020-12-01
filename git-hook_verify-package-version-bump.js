const execa = require('execa')
const proc = require('process')

;(async () => {
  const versionBumpError = 'Expected version bump in package.json.'

  const { stdout: status } = await execa('git diff --staged --name-only')
  if (!/^package\.json$/m.test(status)) {
    console.error(`${versionBumpError} — git does not indicate package.json was modified`)
    proc.exit(1)
  }

  const { stdout: diff } = await execa('git diff --unified=0 package.json')
  // Not a 100% perfect solution due to small risk of false positives. However, it's good enough.
  if (!/"version": "(\d+)\.(\d+)\.(\d+)"/.test(diff)) {
    console.error(`${versionBumpError} — git does not indicate "version" was changed`)
    proc.exit(1)
  }
})()
