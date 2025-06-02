module.exports = function request(app) {
  return {
    get: path => perform('GET', path),
    delete: path => perform('DELETE', path),
    post: path => ({ send: body => perform('POST', path, body) }),
  };

  async function perform(method, path, body) {
    const server = app.listen(0);
    await new Promise(res => server.once('listening', res));
    const port = server.address().port;
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    await new Promise(res => server.close(res));
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }
    return { status: res.status, body: parsed };
  }
};
