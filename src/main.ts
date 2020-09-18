import * as core from '@actions/core'
import {run} from './run'

async function main(): Promise<void> {
  const ret = await run(
    core.getInput('shell'),
    core.getInput('run', {required: true}),
    core.getInput('working-directory')
  )

  if (ret === undefined) {
    return
  }

  core.setOutput('stdout', ret.stdout_data)
  core.setOutput('stderr', ret.stderr_data)
}

main()
