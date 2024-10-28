<template>
    <header class="admin-header">
      <div class="logo">
        <h1><i class="fa fa-tachometer-alt"></i> Admin Dashboard</h1>
      </div>
      <nav>
        <ul class="nav-links">
          <li>
            <router-link to="/admin/dashboard" active-class="active-link">
              <i class="fa fa-home"></i> Dashboard
            </router-link>
          </li>
          <li>
            <router-link to="/admin/users" active-class="active-link">
              <i class="fa fa-users"></i> Manage Users
            </router-link>
          </li>
          <li>
            <router-link to="/admin/posts" active-class="active-link">
              <i class="fa fa-edit"></i> Manage Posts
            </router-link>
          </li>
          <li>
            <router-link to="/admin/settings" active-class="active-link">
              <i class="fa fa-cogs"></i> Settings
            </router-link>
          </li>
          <li>
            <button @click="logout">
              <i class="fa fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  </template>
  
  <script setup>
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import Swal from 'sweetalert2'; // Thêm SweetAlert2
  import { library } from '@fortawesome/fontawesome-svg-core';
  import { faHome, faUsers, faEdit, faCogs, faSignOutAlt, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  
  // Thêm các icon vào thư viện
  library.add(faHome, faUsers, faEdit, faCogs, faSignOutAlt, faTachometerAlt);
  
  const store = useStore();
  const router = useRouter();
  
  // Hàm logout với xác nhận SweetAlert2
  const logout = () => {
    Swal.fire({
      title: 'Are you sure you want to logout?',
      text: 'You will be redirected to the login page.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'No, stay here'
    }).then(result => {
      if (result.isConfirmed) {
        store.dispatch('logout');
        router.push('/admin/login');
        Swal.fire('Logged out!', 'You have been logged out.', 'success');
      }
    });
  };
  </script>
  
  <style scoped>
  .admin-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background-color: #2c3e50;
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .logo h1 {
    font-size: 24px;
    display: flex;
    align-items: center;
  }
  
  .logo h1 i {
    margin-right: 10px;
  }
  
  nav ul {
    list-style: none;
    display: flex;
    gap: 20px;
  }
  
  nav ul li {
    display: inline;
  }
  
  nav ul li a {
    color: white;
    text-decoration: none;
    font-size: 16px;
    display: flex;
    align-items: center;
  }
  
  nav ul li a i {
    margin-right: 8px;
  }
  
  nav ul li a:hover,
  nav ul li a.active-link {
  
    color: #ffeb3b;
  }
  
  button {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
    display: flex;
    align-items: center;
  }
  
  button i {
    margin-right: 8px;
  }
  
  button:hover {
    background-color: #c0392b;
  }
  
  /* Để tránh nội dung bị che mất bởi header cố định, thêm phần padding vào nội dung chính */
  .main-content {
    padding-top: 80px; /* Khoảng cách bằng chiều cao của header */
  }
  </style>
