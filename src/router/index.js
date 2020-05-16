import Vue from 'vue'
import Router from 'vue-router'
import Test from '@/pages/comet.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      name: 'comet',
      path: '/comet',
      component: Test
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'comet') {
    next()
  } else {
    next({ name: 'comet' })
  }
})

export default router
