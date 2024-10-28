<template>
  <div class="form-structor">
    <div class="signup" :class="{ 'slide-up': isLoginActive }">
      <h2 class="form-title" id="signup" @click="toggleToLogin">
        <span>or</span> Sign up
      </h2>
      <div class="form-holder">
        <input v-model="name" type="text" class="input" placeholder="Name" />
        <input v-model="email" type="email" class="input" placeholder="Email" />
        <input v-model="password" type="password" class="input" placeholder="Password" />
        <input v-model="confirmPassword" type="password" class="input" placeholder="Re-enter password" />
      </div>
      <button class="submit-btn" @click="signup">Sign up</button>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>

    <div class="login" :class="{ 'slide-up': !isLoginActive }">
      <div class="center">
        <h2 class="form-title" id="login" @click="toggleToSignup">
          <span>or</span> Log in
        </h2>
        <div class="form-holder">
          <input v-model="loginEmail" type="email" class="input" placeholder="Email" />
          <input v-model="loginPassword" type="password" class="input" placeholder="Password" />
        </div>
        <button class="submit-btn" @click="login">Log in</button>
        <div v-if="loginErrorMessage" class="error">{{ loginErrorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import { db } from "@/firebase/config.js";
import { getDocs, collection, query, where, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import "@/style/user/login.css";

const store = useStore();

const isLoginActive = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');

const loginEmail = ref('');
const loginPassword = ref('');
const loginErrorMessage = ref('');

const toggleToLogin = () => {
  isLoginActive.value = false;
};

const toggleToSignup = () => {
  isLoginActive.value = true;
};

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const isPasswordValid = (password) => {
  return password.length >= 6;
};

const isEmailUnique = async (email) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

const showSuccessAlert = () => {
  Swal.fire({
    title: 'Registration Successful!',
    text: 'You have successfully registered. Redirecting to login...',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
  });
};

const signup = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = "All fields are required.";
    return;
  }

  if (!isValidEmail(email.value)) {
    errorMessage.value = "Invalid email format.";
    return;
  }

  if (!isPasswordValid(password.value)) {
    errorMessage.value = "Password must be at least 6 characters.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  const emailUnique = await isEmailUnique(email.value);
  if (!emailUnique) {
    errorMessage.value = "Email is already in use.";
    return;
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password.value, 10);
  const newUser = {
    userName: name.value.toLowerCase().replace(/\s/g, '_'),
    email: email.value,
    name: name.value,
    password: hashedPassword, // Store hashed password
    avatar: "https://maycamtay.net/wp-content/uploads/2023/05/facebook-cap-nhat-avatar-doi-voi-tai-khoan-khong-su-dung-anh-dai-dien-e4abd14d.jpg",
    bio: "New user bio",
    locked: false,
    admin_lock: false,
    status:"open",
    follower: [],
    following: [],
    created_at: new Date().toISOString(),
  };

  try {
    await store.dispatch('addUser', newUser);
    showSuccessAlert();
    setTimeout(() => {
      toggleToLogin();
      // Clear input fields
      resetSignupForm();
    }, 2000);
  } catch (error) {
    errorMessage.value = "Failed to sign up. Please try again.";
    console.error(error);
  }
};

// Reset the signup form fields
const resetSignupForm = () => {
  name.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
};

const login = async () => {
  if (!isValidEmail(loginEmail.value)) {
    loginErrorMessage.value = "Invalid email format.";
    return;
  }

  if (!isPasswordValid(loginPassword.value)) {
    loginErrorMessage.value = "Password must be at least 6 characters.";
    return;
  }

  try {
    const q = query(collection(db, "users"), where("email", "==", loginEmail.value));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      loginErrorMessage.value = "Invalid email or password.";
      return;
    }

    const user = querySnapshot.docs[0].data();
    const isPasswordMatch = await bcrypt.compare(loginPassword.value, user.password);

    if (!isPasswordMatch) {
      loginErrorMessage.value = "Invalid email or password.";
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user.email));

    Swal.fire({
      title: 'Login Successful!',
      text: 'You are being redirected to the home page.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });

    setTimeout(() => {
      window.location.href = "/home";
    }, 2000);
  } catch (error) {
    console.error("Error logging in: ", error);
    loginErrorMessage.value = "Failed to log in. Please try again.";
  }
};

</script>

<style scoped>
.error {
  color: rgb(255, 238, 0);
  margin-top: 10px;
}
</style>
