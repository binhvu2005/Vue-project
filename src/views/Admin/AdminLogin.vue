<template>
    <div class="login-container">
      <div class="login-admin">
        <h2>Admin Login</h2>
        <form @submit.prevent="login">
          <input v-model="email" type="email" placeholder="Email" required />
          <input v-model="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <p v-if="error">{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const password = ref('');
  const error = ref('');
  const router = useRouter();
  
  const adminAccount = {
    email: 'admin@gmail.com',
    password: 'admin1'
  };
  
  const login = async () => {
    if (!email.value || !password.value) {
      error.value = 'Email và mật khẩu không được để trống.';
      return;
    }
  
    if (email.value === adminAccount.email && password.value === adminAccount.password) {
      error.value = '';
      localStorage.setItem('adminLogin', JSON.stringify(adminAccount));
      router.push('/admin/dashboard');
    } else {
      error.value = 'Sai tài khoản hoặc mật khẩu!';
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    background-color: #f0f2f5; /* Màu nền xám nhẹ khi hình nền không tải được */
    background-image: url('https://t4.ftcdn.net/jpg/02/55/77/03/360_F_255770374_rbmJO9gkkIhMBcyVPc3iW016BCLDvcWc.jpg'); /* Sử dụng hình nền bạn đã tải lên */
    background-size: cover; /* Kéo dài hình nền để phủ toàn màn hình */
    background-position: center; /* Căn giữa hình nền */
    padding: 20px;
  }
  
  .login-admin {
    background-color: rgba(255, 255, 255, 0.9); /* Nền trắng với độ trong suốt nhẹ */
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    text-align: center;
    backdrop-filter: blur(10px); /* Hiệu ứng làm mờ nền */
  }
  
  .login-admin h2 {
    margin-bottom: 20px;
    color: #333;
    font-family: 'Arial', sans-serif;
  }
  
  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  p {
    color: red;
    margin-top: 15px;
    font-size: 14px;
  }
  
  </style>
  