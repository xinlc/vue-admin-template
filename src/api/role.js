import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    baseURL: process.env.VUE_APP_BASE_DEV_API,
    url: '/roles',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    baseURL: process.env.VUE_APP_BASE_DEV_API,
    url: '/role',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    baseURL: process.env.VUE_APP_BASE_DEV_API,
    url: `/role/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    baseURL: process.env.VUE_APP_BASE_DEV_API,
    url: `/role/${id}`,
    method: 'delete'
  })
}
