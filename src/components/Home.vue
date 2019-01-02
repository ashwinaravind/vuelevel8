<template>
  <div>
   <v-container>
     <h4 class="primary--text">Dev Meeetups</h4>
     <v-layout row wrap class="mb-2"  v-if="userIsAuthenticated">
       <v-flex xs12  sm6 class="text-xs-center text-sm-right">
         <v-btn large router to="/meetups" class="info">Explore Meetups</v-btn>
       </v-flex>
       <v-flex xs12 sm6 class="text-xs-center text-sm-left"  >
         <v-btn large router to="/meetup/new" class="info">Organize Meetups</v-btn>
       </v-flex>
     </v-layout>
     <v-layout>

      <v-flex xs12 class="text-xs-center">
        <v-progress-circular
          indeterminate
          class="primary--text"
          :width="7"
          :size="70"
          v-if="loading"></v-progress-circular>
      </v-flex>
    </v-layout>

     <v-layout row wrap class="mt-2" v-if="!loading">
       <v-flex xs12>
         <v-carousel style="cursor: pointer;">
          <v-carousel-item
            v-for="meetup in meetups"
            :src="meetup.imageUrl"
            :key="meetup.id"
            @click="onLoadMeetup(meetup.id)">
              <div class="title">Meetup in {{ meetup.title }}</div>
          </v-carousel-item>
        </v-carousel>
       </v-flex>
     </v-layout>
     <v-layout row wrap class="mt-2">
       <v-flex xs12 class="text-xs-center">
         <p>Join out awesome Meetups</p>
       </v-flex>
     </v-layout>
   </v-container>
  </div>
</template>

<script>
/* eslint-disable */
  export default {
  computed:{
    meetups() {
      return this.$store.getters.featuredMeetups
    },
    loading () {
      return this.$store.getters.loading
    }
    ,
    userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      },
  },
    methods:{
      onLoadMeetup (id) {
      this.$router.push('/meetups/' + id )
      }
    }
  }
  /* eslint-enable */
</script>
<style scoped>
  .title {
    position: absolute;
    bottom: 50px;
    background-color: rgba(0,0,0,0.5);
    color: white;
    font-size: 50em;
    padding: 30px

  }
</style>
