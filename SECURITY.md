# Security Policy

## Supported version

Security fixes target the latest release of SFWA-WTL-G1. This is a fast-moving
template and may change daily; downstream projects must maintain their own
patching, threat model, Firebase rules, IAM, billing controls, and incident plan.

## Report a vulnerability

Use GitHub's private vulnerability reporting for this repository. Do not open a
public issue containing credentials, exploit details, customer data, or an
unpatched production URL. Wayne Tech Lab LLC will validate the report and
coordinate remediation when applicable, but does not guarantee response times.

Never commit `.env.local`, service-account keys, refresh tokens, Firebase legacy
CI tokens, private keys, or production exports. Developers should authenticate
interactively; CI should use OIDC or Application Default Credentials with least
privilege.
