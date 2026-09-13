"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidation = void 0;
const zod_1 = require("zod");
const updateUserRoleSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(["ADMIN", "TECHNICIAN", "CUSTOMER"]),
    }),
});
exports.AdminValidation = {
    updateUserRoleSchema,
};
