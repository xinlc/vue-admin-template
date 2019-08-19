import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/v1/system/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    baseURL: process.env.VUE_APP_BASE_DEV_API,
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    baseURL: process.env.VUE_APP_BASE_DEV_API,
    url: '/user/logout',
    method: 'post'
  })
}
