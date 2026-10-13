/* Browser origins are a different boundary from the server's internal upstreams. */
(function (root) {
  'use strict';
  const policy = root.ShiyuEnvironmentContract;
  const contract = policy?.environmentContract;
  const parse = value => {
    try {
      const url = new URL(typeof value === 'string' ? value : value?.href);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url : null;
    } catch { return null; }
  };
  function resolve(value = root.location) {
    const current = parse(value);
    if (!current || !contract) return null;
    const profiles = contract.profiles;
    const registered = profile => Object.values(profiles[profile].browserOrigins).some(origins => origins.includes(current.origin));
    const profile = registered('production') ? 'production' : registered('development') ? 'development' : null;
    if (!profile) return null;
    const origins = profiles[profile].browserOrigins;
    const allowed = (role, value) => {
      const url = parse(value);
      return !!url && Array.isArray(origins[role]) && origins[role].includes(url.origin);
    };
    const applicationOrigin = role => {
      const choices = origins[role] || [];
      if (profile === 'development') return choices.find(origin => new URL(origin).hostname === current.hostname) || null;
      return choices[0] || null;
    };
    const toolReturn = value => {
      const url = parse(value);
      return allowed('tool', value) ? url.href : null;
    };
    return Object.freeze({ profile, origin: current.origin, applicationOrigin, allows: allowed, toolReturn });
  }
  root.ShiyuEnvironment = Object.freeze({ resolve, contractSha256: policy?.environmentContractSha256 || '' });
})(typeof window === 'undefined' ? globalThis : window);
