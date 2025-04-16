declare type LoginParams = {
  username?: string;
  password?: string;
  code?: string;
  uuid?: string;
}

declare type User = {
  userId?: string;
  userName?: string;
}

declare type CurrentUser = {
  id?: number;
  name?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  token?: string;
}

declare type Result<T = unknown> = {
  code?: number;
  data?: T;
  error?: any;
  message?: string;
  path?: string;
  status?: number;
  timestamp?: string;
  traceId?: string;
}
