const controllerStatus = document.querySelector('#controller-status')

async function loadHealth() {
  try {
    const response = await fetch('/api/health', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const health = await response.json()
    controllerStatus.textContent = `${health.status} - ${health.mode} - ${health.host}:${health.port}`
  } catch (error) {
    controllerStatus.textContent = `Controller unavailable: ${error.message}`
  }
}

void loadHealth()
