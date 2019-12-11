# Serverless Configuration

This [Serverless](https://github.com/serverless/serverless) plugin allows
modifying the service file according to the stage or whether the system
is running under `serverless offline`. This plugin is similar to
[serverless-plugin-ifelse](https://github.com/anantab/serverless-plugin-ifelse),
but with a simplified configuration method.

# Installation

First, add the plugin to your project:

`npm install --save-dev serverless-configuration`

Then, inside your project's `serverless.yml` file add `serverless-configuration`
to the top-level plugins section.  If there is no plugin section you will need
to add it to the file.

```YAML
plugins:
  - serverless-configuration
```

# Configuration

In the `custom.serverless-configuration` section of your `serverless.yml` file
specify one or more qualifiers. If your current environment matches the qualifier,
the provided configuration changes will be applied to the file.

## Qualifiers

A qualifier may be one of:

* A stage name, e.g. `dev`, `prod`
* `offline` to indicate the system is running in [offline](https://github.com/dherault/serverless-offline) mode.
* `online` to indicate the system is _not_ running in offline mode.

Optionally, the qualifier may be prefixed with a minus sign (`-`) to apply
the changes whenever the qualifier *doesn't* match.

## Changes

Changes can be one of four types (set, add, del and merge). `del` should
provide a list of keypaths to delete from the serverless.yml file. The other
change types should provide an object whose keys denote keypaths and their
values contain the data to set, add or merge at the given keypath.

* set: replace keypath with provided value
* add: update keypath with provided value, merging objects and appending to arrays
* merge: update keypath with provided value, merging objects and replacing arrays
* del: delete keypath

E.g.:

```YAML
custom:
  serverless-configuration:
    -prod:                               # will apply to all stages except prod
      add:
        provider.env:                    # update the environment with these values
          DEBUG: lambda auth
          cacheMaxAge: 15
      del:                               # delete these keys
        - resources.Resources.CDN
        - resources.Resources.DomainName
    offline:                             # apply these changes when running 'sls offline'
      set:
        provider.environment.streamEndpoint: ${self:custom.vars.localKinesisEndpoint}
      del:
        - provider.environment.redisHost
        - provider.environment.redisPort
```

# Troubleshooting

The plugin will log all the applied changes if the environment variable
`SLS_DEBUG` is set. By convention, this variable is set to the value `*`, e.g.:

`SLS_DEBUG=* sls offline`
