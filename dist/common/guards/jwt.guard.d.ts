declare const JwtGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtGuard extends JwtGuard_base {
    handleRequest<TUser = any>(err: Error | null, user: TUser, info?: Error): TUser;
}
export {};
