import {run} from '../src/run'
import {Result} from '../src/type'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {assert} from 'console'

test('sh', async () => {
  const ret = await run('sh', 'printf test')
  const r = ret as Result
  expect(r.stdout_data).toEqual('test')
})

test('invalid shell', async () => {
  const ret = await run('foo', 'printf test')
  expect(ret).toEqual(undefined)
})

test('invalid run', async () => {
  const ret = await run('sh', '')
  try {
    expect(ret).toEqual(undefined)
  } catch (error) {
    console.log(error)
  }
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_RUN'] = 'printf test'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  console.log(cp.execSync(`node ${ip}`, options).toString())
})
