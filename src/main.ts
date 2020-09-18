import * as core from '@actions/core'
import {run} from './run'
import * as os from 'os'

async function main(): Promise<void> {
  core.info(`Running on ${os.platform()}/${os.arch()} release: ${os.release()}`)
  core.info(`Running as ${process.argv.join(' ')}`)

  const ret = await run(
    core.getInput('shell'),
    core.getInput('run', {required: true})
  )

  if (ret === undefined) {
    return
  }

  core.setOutput('stdout', ret.stdout_data)
  core.setOutput('stderr', ret.stderr_data)
}

main()
