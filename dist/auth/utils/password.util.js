"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
let PasswordUtil = class PasswordUtil {
    constructor() {
        this.saltRounds = 10;
    }
    async hashPassword(password) {
        return bcrypt.hash(password, this.saltRounds);
    }
    async comparePasswords(password, hash) {
        return bcrypt.compare(password, hash);
    }
    generateTemporaryPassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
};
exports.PasswordUtil = PasswordUtil;
exports.PasswordUtil = PasswordUtil = __decorate([
    (0, common_1.Injectable)()
], PasswordUtil);
//# sourceMappingURL=password.util.js.map