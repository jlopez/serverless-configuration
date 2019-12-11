const _ = require('lodash');

class ServerlessConfiguration {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.pluginName = 'serverless-configuration';

    this.offline = serverless.pluginManager.cliCommands[0] === 'offline';

    const { service } = this.serverless;
    const customizer = (obj, src) => (_.isArray(obj) ? obj.concat(src) : undefined);
    /* eslint-disable key-spacing, no-multi-spaces, no-unused-vars */
    this.actions = {
      set:   { verb: 'Setting',  op: (path, data) => _.set(service, path, data) },
      add:   { verb: 'Adding',   op: (path, data) => _.mergeWith(_.get(service, path), data, customizer) },
      merge: { verb: 'Merging',  op: (path, data) => _.merge(_.set(service, path), data) },
      del:   { verb: 'Deleting', op: (path, data) => _.unset(service, path) },
    };
    /* eslint-enable key-spacing, no-multi-spaces, no-unused-vars */

    this.hooks = {
      initialize: this.configure.bind(this),
    };
  }

  debug(msg) {
    if (process.env.SLS_DEBUG) {
      this.serverless.cli.log(msg, this.pluginName);
    }
  }

  configure() {
    const { provider, custom } = this.serverless.service;
    const conf = custom[this.pluginName] || {};
    const qualifiers = [
      this.offline ? 'offline' : 'online',
      this.options.stage || provider.stage,
    ];

    _.forEach(conf, (targetConf, predicate) => {
      if (ServerlessConfiguration.matches(qualifiers, predicate)) {
        this.debug(`Applying configuration ${predicate} env is (${qualifiers.join(', ')})`);
        this.applyConfiguration(targetConf);
      }
    });
  }

  static matches(qualifiers, predicate) {
    const value = _.trimStart(predicate, '-');
    const sense = value === predicate;
    return _.includes(qualifiers, value) === sense;
  }

  applyConfiguration(conf) {
    _.forEach(conf, (details, action) => {
      const actionSpec = this.actions[action];
      if (!actionSpec) {
        this.debug(`Ignoring unknown action ${action}`);
        return;
      }
      const isArray = _.isArray(details);
      _.forEach(details, (v, k) => {
        const [path, data] = isArray ? [v] : [k, v];
        this.debug(`${actionSpec.verb} path ${path}`);
        actionSpec.op(path, data);
      });
    });
  }
}

module.exports = ServerlessConfiguration;
