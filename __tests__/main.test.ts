import {run} from '../src/run'
import {Result} from '../src/type'

test(
  'sh',
  async () => {
    const ret = await run('sh', 'printf test')
    const r = ret as Result
    expect(r.stdout_data).toEqual('test')
  },
  100 * 1000
)

test(
  'bash',
  async () => {
    const ret = await run(
      'bash',
      `cat <<EOF
test

EOF`
    )
    const r = ret as Result
    expect(r.stdout_data.trimEnd()).toEqual('test')
  },
  100 * 1000
)

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
