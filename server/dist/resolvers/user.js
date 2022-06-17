"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
let RequestInput = class RequestInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RequestInput.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RequestInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RequestInput.prototype, "password", void 0);
RequestInput = __decorate([
    (0, type_graphql_1.InputType)()
], RequestInput);
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return "";
    }
    getUsers() {
        return User_1.User.find();
    }
    getUser({ req }) {
        if (!req.session.userId) {
            return null;
        }
        return User_1.User.findOne({ where: { id: req.session.userId } });
    }
    changePassword(token, newPassword, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length <= 4) {
                return { errors: [
                        {
                            field: "newPassword",
                            message: "must be at least 4 characters"
                        },
                    ] };
            }
            ;
            const key = constants_1.FORGET_PASSWORD_PREFIX + token;
            const userId = yield redis.get(key);
            if (!userId) {
                return { errors: [
                        {
                            field: "token",
                            message: "token expired"
                        },
                    ] };
            }
            const user = yield User_1.User.findOne({ where: { id: parseInt(userId) } });
            if (!user) {
                return { errors: [
                        {
                            field: "id",
                            message: "user not exists"
                        }
                    ] };
            }
            yield User_1.User.update({ id: parseInt(userId) }, { password: yield argon2_1.default.hash(newPassword) });
            redis.del(key);
            req.session.userId = user.id;
            return { user };
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            if (!user) {
                return true;
            }
            const token = (0, uuid_1.v4)();
            yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, "EX", 1000 * 60 * 60 * 24 * 3);
            yield (0, sendEmail_1.sendEmail)(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
            return true;
        });
    }
    createUser(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.username.length <= 2) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username must be greater than 2 characters'
                        },
                    ],
                };
            }
            if (!options.email.includes("@")) {
                return {
                    errors: [
                        {
                            field: 'email',
                            message: 'invalid email address, required "@"'
                        },
                    ],
                };
            }
            if (options.username.includes("@")) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'cannot include "@" in username'
                        },
                    ],
                };
            }
            if (options.password.length <= 4) {
                return {
                    errors: [
                        {
                            field: 'password',
                            message: 'password must be greater than 4 characters'
                        },
                    ],
                };
            }
            const hashPassword = yield argon2_1.default.hash(options.password);
            let user;
            try {
                const result = yield User_1.User
                    .createQueryBuilder()
                    .insert()
                    .into(User_1.User)
                    .values([
                    {
                        username: options.username,
                        password: hashPassword,
                        email: options.email,
                    },
                ])
                    .returning("*")
                    .execute();
                user = result.raw[0];
            }
            catch (err) {
                console.log("message: ", err);
                if (err.code === "23505" || err.detail.includes("already exists")) {
                    return {
                        errors: [
                            {
                                field: "usernameOrEmail",
                                message: "username already exists",
                            },
                        ],
                    };
                }
            }
            req.session.userId = user.id;
            return { user };
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let user;
            if (usernameOrEmail.includes("@")) {
                user = yield User_1.User.findOne({ where: { email: usernameOrEmail } });
            }
            else if (!usernameOrEmail.includes("@")) {
                user = yield User_1.User.findOne({ where: { username: usernameOrEmail } });
            }
            if (!user) {
                return {
                    errors: [
                        {
                            field: "usernameOrEmail",
                            message: "that username does not exist"
                        },
                    ],
                };
            }
            const valid = yield argon2_1.default.verify(user.password, password);
            if (!valid) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "incorrect password"
                        },
                    ],
                };
            }
            req.session.userId = user.id;
            return { user };
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy(err => {
            res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                return resolve(false);
            }
            return resolve(true);
        }));
    }
    updateUser(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { id } });
            if (!user) {
                return null;
            }
            if (typeof options.username !== "undefined") {
                user.username = options.username;
                yield User_1.User.update({ id }, { username: options.username });
            }
            if (typeof options.password !== "undefined") {
                user.password = options.password;
                yield User_1.User.update({ id }, { password: options.password });
            }
            return user;
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield User_1.User.delete({ id });
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUsers", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "getUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("token")),
    __param(1, (0, type_graphql_1.Arg)("newPassword")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("usernameOrEmail")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, RequestInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map