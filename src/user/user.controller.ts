import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  async login(@Body('username') username: string) {
    return this.userService.login(username);
  }
}
