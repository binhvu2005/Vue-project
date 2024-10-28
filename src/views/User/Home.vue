<template>
  <div>
    <Header_Nav />
    <main class="main-container">
      <section class="content-container">
         <div class="content">
            <Story />
            <Post />
         </div>
      </section>
      <Menu/>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header_Nav from "../../components/user/Header_Nav.vue";
import Story from "../../components/user/Story.vue";
import Footer from "../../components/user/Footer.vue";
import Post from "../../components/user/Post.vue";
import Menu from "../../components/user/Menu.vue";
</script>

<style></style>
