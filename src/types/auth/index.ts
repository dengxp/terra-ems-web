/**
 * 登录参数
 */
export interface LoginParams {
    username: string;
    password: string;
    captcha: string;
    uuid: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
    token: string;
    username: string;
}

/**
 * 当前用户信息 - 前端内部使用
 * 从 UserDTO 转换而来
 */
export interface CurrentUser {
    id?: string;
    name?: string;
    nickname?: string;
    avatar?: string;
    roles?: string[];
    permissions?: string[];
    token?: string;
}

/**
 * 验证码响应
 */
export interface CaptchaResponse {
    uuid: string;
    img: string;
}
