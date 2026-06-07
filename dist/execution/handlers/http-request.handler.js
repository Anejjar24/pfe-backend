"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRequestHandler = void 0;
class HttpRequestHandler {
    async execute(node, input) {
        const method = String(node.data?.method || 'GET').toUpperCase();
        const url = String(node.data?.url || '').trim();
        if (!url) {
            return { error: 'url not configured', ok: false };
        }
        let headers = { 'Content-Type': 'application/json' };
        try {
            const parsed = JSON.parse(String(node.data?.headers || '{}'));
            headers = { ...headers, ...parsed };
        }
        catch {
        }
        let staticBody = {};
        try {
            staticBody = JSON.parse(String(node.data?.body || '{}'));
        }
        catch {
        }
        const body = typeof input === 'object' && input !== null
            ? { ...staticBody, ...input }
            : staticBody;
        const hasBody = !['GET', 'HEAD'].includes(method);
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: hasBody ? JSON.stringify(body) : undefined,
            });
            const text = await response.text();
            let data = text;
            try {
                data = JSON.parse(text);
            }
            catch {
            }
            return {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                data,
                value: data,
                branch: response.ok ? 'response' : 'error',
            };
        }
        catch (err) {
            return {
                ok: false,
                error: err instanceof Error ? err.message : String(err),
                branch: 'error',
            };
        }
    }
}
exports.HttpRequestHandler = HttpRequestHandler;
//# sourceMappingURL=http-request.handler.js.map