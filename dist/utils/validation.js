"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFields = requireFields;
function requireFields(payload, fields) {
    return fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
}
//# sourceMappingURL=validation.js.map