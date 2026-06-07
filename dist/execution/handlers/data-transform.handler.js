"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransformHandler = void 0;
class DataTransformHandler {
    execute(node, input) {
        const operation = String(node.data?.operation || 'extract_field');
        const field = String(node.data?.field ?? '');
        const setValue = node.data?.value;
        try {
            const transformed = this.transform(operation, input, field, setValue);
            return { value: transformed, branch: 'out' };
        }
        catch (err) {
            return {
                error: err instanceof Error ? err.message : String(err),
                branch: 'error',
            };
        }
    }
    transform(operation, input, field, setValue) {
        const obj = typeof input === 'object' && input !== null
            ? input
            : {};
        switch (operation) {
            case 'extract_field': {
                if (!field)
                    throw new Error('"field" is required for extract_field');
                return obj[field];
            }
            case 'set_field': {
                if (!field)
                    throw new Error('"field" is required for set_field');
                return { ...obj, [field]: setValue };
            }
            case 'delete_field': {
                if (!field)
                    throw new Error('"field" is required for delete_field');
                const copy = { ...obj };
                delete copy[field];
                return copy;
            }
            case 'to_number':
                return Number(input);
            case 'to_string':
                return String(input);
            case 'parse_json':
                return JSON.parse(String(input));
            case 'stringify_json':
                return JSON.stringify(input);
            default:
                return input;
        }
    }
}
exports.DataTransformHandler = DataTransformHandler;
//# sourceMappingURL=data-transform.handler.js.map