import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      const message = info?.message || 'Unauthorized';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
