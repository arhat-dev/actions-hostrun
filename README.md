# actions-hostrun

[![CI](https://github.com/arhat-dev/actions-hostrun/workflows/CI/badge.svg)](https://github.com/arhat-dev/actions-hostrun/actions?query=workflow%3ACI)

Run host commands when there is container defined in job

## Usage

Before you start, please make sure you have installed docker-cli package in your container before using this action, this actions relies on the [`nsenter1`](https://github.com/justincormack/nsenter1) image

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    container:
      image: alpine:latest
    steps:
    - name: Show container rootfs release info
      run: cat /etc/os-release

    # docker-cli is required in your container
    - name: Install docker-cli
      run: apk add docker-cli

    - name: Show host rootfs release info
      uses: arhat-dev/actions-hostrun@main
      with:
        # optional shell name, default: bash
        shell: bash
        # required script to run
        run: cat /etc/os-release
        # working-directory used when executing command
        working-directory: /somedir
```

## LICENSE

The scripts and documentation in this project are released under the [MIT License](LICENSE)
