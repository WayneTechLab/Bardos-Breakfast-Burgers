export function selectDeployTargets(config, target, { functionsPresent = false } = {}) {
  const targets = []
  if (['all', 'app', 'hosting'].includes(target) && config.hosting) targets.push('hosting')
  if (['all', 'rules'].includes(target) && config.firestore?.rules) targets.push('firestore:rules')
  if (['all', 'rules'].includes(target) && config.firestore?.indexes) targets.push('firestore:indexes')
  if (['all', 'rules'].includes(target) && config.storage) targets.push('storage')
  if (['all', 'app', 'functions'].includes(target) && (config.functions || functionsPresent)) targets.push('functions')
  return targets.length ? targets : ['hosting']
}

export function buildDeployArguments(targets, options = {}) {
  const args = ['deploy', '--only', targets.join(',')]
  if (options.project) args.push('--project', options.project)
  if (options.dryRun) args.push('--dry-run')
  return args
}
