export function sendSuccess(data: unknown, status = 200) {
  return Response.json({ code: 0, success: true, message: 'OK', data }, { status })
}

export function sendError(err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : 'Internal server error'
  return Response.json({ code: 1, success: false, message, data: null }, { status })
}
