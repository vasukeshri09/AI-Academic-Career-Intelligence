
const API_URL = 'http://127.0.0.1:8000'

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export async function apiFetch(
  path,
  {
    token,
    headers = {},
    ...options
  } = {}
) {
  const requestHeaders = new Headers(headers)

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !requestHeaders.has('Content-Type')
  ) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: requestHeaders
    })
  } catch (error) {
    throw new ApiError(
      'Unable to connect to the backend. Check whether FastAPI is running.',
      0,
      error
    )
  }

  const contentType = response.headers.get('content-type') || ''

  let data = null

  if (response.status !== 204) {
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null)
    } else {
      data = await response.text().catch(() => '')
    }
  }

  if (!response.ok) {
    const message =
      typeof data?.detail === 'string'
        ? data.detail
        : response.status === 401
          ? 'Your session has expired. Please log in again.'
          : response.status === 403
            ? 'You are not authorized to perform this action.'
            : `Request failed with status ${response.status}.`

    throw new ApiError(message, response.status, data)
  }

  return data
}

export { API_URL }
