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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpVoteResolver = void 0;
const Post_1 = require("../entities/Post");
const UpVote_1 = require("../entities/UpVote");
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
let UpVoteResolver = class UpVoteResolver {
    getUpVote() {
        return UpVote_1.UpVote.find();
    }
    vote(postId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.session.userId;
            const isUpVote = value !== -1;
            const realValue = isUpVote ? 1 : -1;
            const upVote = yield UpVote_1.UpVote.findOne({ where: { postId, userId } });
            if (upVote && upVote.value !== realValue) {
                yield UpVote_1.UpVote.query(`
                    update up_vote
                    set value = ${realValue}
                    where "postId" = ${postId} and "userId" = ${userId};
                    `);
                yield Post_1.Post.query(`
                    update post
                    set points = points + ${realValue}
                    where id = ${postId};
                    `);
            }
            else if (!upVote) {
                yield UpVote_1.UpVote.create({
                    value: realValue,
                    postId: postId,
                    userId: userId
                }).save();
                yield Post_1.Post.query(`
                    START TRANSACTION;
                    update post
                    set points = points + ${realValue}
                    where id = ${postId};
                    COMMIT;
                    `);
            }
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [UpVote_1.UpVote]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UpVoteResolver.prototype, "getUpVote", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], UpVoteResolver.prototype, "vote", null);
UpVoteResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UpVoteResolver);
exports.UpVoteResolver = UpVoteResolver;
//# sourceMappingURL=upVote.js.map