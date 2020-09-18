import * as core from '@actions/core'
import {Result} from './type'
import {exec} from '@actions/exec'
import * as io from '@actions/io'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

const default_container_tmp_dir = '/__w/_temp'
const default_host_tmp_dir = '/home/runner/work/_temp'
const default_os_tmp_dir = os.tmpdir()

export async function run(
  input_shell: string,
  input_run: string
): Promise<Result | undefined> {
  let dir = ''

  try {
    let actual_tmp_dir = ''
    let actual_host_tmp_dir = default_host_tmp_dir

    if (fs.existsSync(default_container_tmp_dir)) {
      actual_tmp_dir = default_container_tmp_dir
    } else if (fs.existsSync(default_host_tmp_dir)) {
      actual_tmp_dir = default_host_tmp_dir
    } else {
      actual_tmp_dir = default_os_tmp_dir
      actual_host_tmp_dir = default_os_tmp_dir
    }

    dir = fs.mkdtempSync(path.join(actual_tmp_dir, 'actions-hostrun'))
    await io.mkdirP(dir)

    const script_in_container = path.join(dir, 'script')
    fs.writeFileSync(script_in_container, input_run, 'utf8')

    const script_in_host = path.join(
      actual_host_tmp_dir,
      path.basename(dir),
      'script'
    )
    core.debug(`Using script ${script_in_host}`)

    const docker_bin = await io.which('docker')
    let nsenter1_img = core.getInput('nsenter1-image')
    if (nsenter1_img === '') {
      nsenter1_img = 'docker.io/justincormack/nsenter1:latest'
    }

    return await run_in_host(docker_bin, nsenter1_img, input_shell, [
      script_in_host
    ])
  } catch (error) {
    core.setFailed(error.message)
    return undefined
  } finally {
    await io.rmRF(dir)
  }
}

async function run_in_host(
  docker_bin: string,
  image: string,
  bin: string,
  args: string[]
): Promise<Result | undefined> {
  let stdout_data = ''
  let stderr_data = ''

  if (!path.isAbsolute(bin)) {
    bin = await lookup(docker_bin, image, bin)
    bin = bin.trimEnd()
  }

  if (bin === '') {
    throw new Error('Unable to find binary path')
  }

  await exec(
    docker_bin,
    ['run', '-t', '--rm', '--privileged', '--pid=host', image, bin, ...args],
    {
      listeners: {
        stdout: (data: Buffer) => {
          stdout_data += data.toString()
        },
        stderr: (data: Buffer) => {
          stderr_data += data.toString()
        }
      }
    }
  )

  return {
    stdout_data,
    stderr_data
  }
}

// lookup path of bin in host
async function lookup(
  docker_bin: string,
  image: string,
  bin: string
): Promise<string> {
  try {
    const ret = await run_in_host(docker_bin, image, '/usr/bin/env', [
      // bash is available on all platform
      'bash',
      '-c',
      `'command -v ${bin}'`
    ])
    return ret?.stdout_data ? ret.stdout_data : ''
  } catch (err) {
    core.debug(err.message)

    try {
      const ret = await run_in_host(docker_bin, image, '/usr/bin/env', [
        // fallback to sh for docker on macos
        'sh',
        '-c',
        `command -v ${bin}`
      ])
      return ret?.stdout_data ? ret.stdout_data : ''
    } catch (err2) {
      core.debug(err2.message)

      return ''
    }
  }
}
