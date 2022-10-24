import { Controller, Get, Post, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FtAuthGuard } from './ft.guard';
import { LoginService } from './login.service';

// 1-1, 1-2, 1-3, 1-4
@Controller('/login')
@ApiTags("로그인 API")
export class LoginController {
	constructor(private readonly loginService: LoginService) {}
	@Get()
	Login() {
		return "auth";
	}

	@Get('42')
	@UseGuards(FtAuthGuard)
	async ftLogin() {
	}

	@Get('42/callback')
	@UseGuards(FtAuthGuard)
	@Redirect('/')
	async ftAuthRedirect(@Req() req) {
		return 'success';
	}
	// 계정 등록
	// req : (body)user id, (body)nickname, (body)avatar
	// res : status code(성공 : 200, 실패 : 400)
	@Post('/newaccount')
	@ApiOperation({
		summary: 'req : user id, nickname\
				  res : status code(성공 : 200, 실패 : 400)'})
	f1(@Query('id') id: string) {
		return Object.assign({
		});
	}

	// 이차 인증 로그인 성공 여부
	// req : (body)user id, (body)certified number
	// res : status code(성공 : 200, 실패 : 400)
	@Post('/certificate')
	@ApiOperation({
		summary: 'req : user id, certificate number\
				  res : status code(성공 : 200, 실패 : 400)'})
	f2(@Query('id') id: string) {
		return Object.assign({
		});
	}
}