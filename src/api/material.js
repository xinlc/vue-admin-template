import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/v1/material/org/page',
    method: 'get',
    params: query
  })
}

export function fetchCategoryList(query) {
  return request({
    url: '/v1/material/category/list',
    method: 'get',
    params: query
  })
}

export function searchMaterial(query) {
  return request({
    url: '/v1/material/search',
    method: 'get',
    params: {
      name: query
    }
  })
}

export function fetchMaterial(name, categroyId) {
  return request({
    url: '/v1/material/org',
    method: 'get',
    params: { name, categroyId }
  })
}

export function createMaterial(data) {
  return request({
    url: '/v1/material/org/add',
    method: 'post',
    data
  })
}

export function updateMaterial(data) {
  return request({
    url: '/v1/material/org/update',
    method: 'post',
    data
  })
}

export function delMaterial(id) {
  return request({
    url: `/v1/material/org/del/${id}`,
    method: 'post'
  })
}
