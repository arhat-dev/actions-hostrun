import * as core from '@actions/core'
import {Result} from './type'
import {exec} from '@actions/exec'
import * as io from '@actions/io'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

export async function run(
  input_shell: string,
  input_run: string,
  input_wd: string
): Promise<Result | undefined> {
  let dir = ''

  try {
    // write input_run to a temporary file
    const sys_tmp_dir = fs.realpathSync(os.tmpdir())
    dir = fs.mkdtempSync(path.join(sys_tmp_dir, 'actions-hostrun'))
    await io.mkdirP(dir)

    const script = path.join(dir, 'script')
    fs.writeFileSync(script, input_run, 'utf8')
    core.debug(`Using script ${script}`)

    // get shell used
    if (input_shell === '') {
      input_shell = 'bash'
    }

    const shell = await io.which(input_shell, true)
    core.debug(`Using shell ${shell}`)

    // get working dir
    let wd: string | undefined = undefined
    if (input_wd === '') {
      wd = undefined
    } else {
      wd = fs.realpathSync(input_wd)
    }
    core.debug(`Using working-directory ${wd}`)

    let stdout_data = ''
    let stderr_data = ''

    core.info(`Executing: ${shell} ${script} ...\n`)
    await exec(shell, [script], {
      cwd: wd,
      listeners: {
        stdout: (data: Buffer) => {
          stdout_data += data.toString()
        },
        stderr: (data: Buffer) => {
          stderr_data += data.toString()
        }
      }
    })

    return {
      stdout_data,
      stderr_data
    }
  } catch (error) {
    core.setFailed(error.message)

    return undefined
  } finally {
    await io.rmRF(dir)
  }
}
