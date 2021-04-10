import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const demoRouter = [
  {
    path: 'viberation',
    name: 'viberation',
    meta: {
      title: '声致振动',
      icon: require('@/assets/icon/line.png')
    },
    component: () => import('@/views/viberation')
  },
]

export const globalRouter = [
  {
    path: '/',
    name: 'line',
    redirect: '/viberation',
    component: () => import('@/views/layout'),
    children: [
      ...demoRouter
    ]
  },
]

export default new Router({
  routes: [...globalRouter]
})
