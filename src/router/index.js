import ManagePosts from '@/components/admin/ManagePosts.vue'
import ManageUsers from '@/components/admin/ManageUsers.vue'
import Login from '@/views/auth/Login.vue'
import Home from '@/views/User/Home.vue'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/User/Profile.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/user/:id',
      name: 'UserDetail',
      component: () => import('@/views/User/UserDetail.vue')
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/Admin/AdminLogin.vue')
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/Admin/dashboard.vue'),
      meta: {
        requiresAuth: true,
        admin: true
      }
    },
     { path: '/admin/users', component: ManageUsers },
  { path: '/admin/posts', component: ManagePosts },
    
    

   
  ]
})

export default router
