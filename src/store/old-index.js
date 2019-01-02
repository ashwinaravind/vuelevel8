import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'
/* eslint-disable */
Vue.use(Vuex)
export const store = new Vuex.Store({
  state: {
    loadedMeetups: [
      { imageUrl: 'https://www.icegreen.ca/wp-content/uploads/2016/11/2-nyc-empire-nina-papiorek.jpg',
        id:'cvxcvcxvxc',
        title: 'NYC',
        date: new Date(),
        location: 'New York' ,
        description: 'New York'},
      { imageUrl: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
        id:'oooooooooo',
        title: 'Paris',
        date:  new Date(),
        location: 'Paris' ,
        description: 'Paris'},
    ],
    user: null,
    loading: false,
    error: null
  },
  mutations: {
  setLoadedMeetups(state,payload) {
          state.loadedMeetups=payload
    },
  createMeetup (state,payload) {
          state.loadedMeetups.push(payload)
    },
  setUser (state, payload) {
      state.user = payload
    },
  setLoading (state, payload) {
    state.loading =payload
  },
  setError (state, payload) {
    state.error =payload
  },
  clearError (state) {
    state.error =null
  },
    },
  actions: {
      loadedMeetups ({commit}) {
        commit('setLoading',true)
        firebase.database().ref('meetups').once('value') // realtime data reading
        .then((data) => {
          const meetups = []
          const obj = data.val()
          for (let key in obj){
            meetups.push({
              id:key,
              title:obj[key].title,
              description:obj[key].description,
              imageUrl:obj[key].imageUrl,
              location: obj[key].location,
              date:obj[key].date,
              creatorId: obj[key].creatorId
            })
            }
            console.log(meetups)
            commit('setLoadedMeetups', meetups)
            commit('setLoading', false)
          }
        )
        .catch(
          (error) => {
            console.log(error)
            commit('setLoading', false)
          }
        )
      },
    createMeetup ({commit, getters}, payload) {
      const meetup = {
        title: payload.title,
        location: payload.location,
        description: payload.description,
        date: payload.date.toISOString(),
        creatorId: getters.user.id
      }
      let imageUrl
      let key
      let ext
      firebase.database().ref('meetups').push(meetup)
        .then((data) => {
          key = data.key
          return key
        })
        .then(key => {
          const filename = payload.image.name
          ext = filename.slice(filename.lastIndexOf('.'))
          return firebase.storage().ref('meetups/' + key + '.' + ext).put(payload.image)
        })
        .then(fileData => {
          //imageUrl = fileData.metadata.downloadURLs[0]
          imageUrl=firebase.storage().ref('meetups/' + key + '.' + ext).getDownloadURL()
          .then((url) => {
            console.log('url')
            console.log(url)
            const imageUrl=url
            return firebase.database().ref('meetups').child(key).update({imageUrl: imageUrl})
          })
          console.log('imageUrl')
          console.log(imageUrl)
          //return firebase.database().ref('meetups').child(key).update({imageUrl: imageUrl}).


        })
        .then(() => {
          console.log('commit')
          console.log(imageUrl)
          console.log(meetup)

        //  commit('createMeetup', {
        //    ...meetup,
        //    imageUrl: imageUrl,
        //    id: key
        //  })
        })
        .catch((error) => {
          console.log(error)
        })
      // Reach out to firebase and store it
    },
  signUserUp ({commit},payload){
    commit('setLoading',true)
    commit('clearError')
    firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
    .then(
        user => {
          commit('setLoading',false)
          const newUser = {
            id: user.uid,
            registeredMeetups: []
          }
          commit('setUser', newUser)
        }
      )
      .catch(
        error => {
          commit('setLoading',false)
          commit('setError',error)
          console.log(error)
        }
      )
  },
  signUserIn ({commit},payload){
    commit('setLoading',true)
    commit('clearError')
    firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
    .then(
        user => {
            commit('setLoading',false)
          const newUser = {
            id: user.uid,
            registeredMeetups: []
          }
          commit('setUser', newUser)
        }
      )
      .catch(
        error => {
          commit('setLoading',false)
          commit('setError',error)
          console.log(error)
        }
      )
  },
  clearError ({commit}) {
      commit('clearError')
    },
  autoSignIn({commit},payload) {
        commit('setUser',{id: payload.uid, registeredMeetups: []})
      },
  logout({commit}) {
    firebase.auth().signOut()
      commit('setUser',null)
      console.log('signout')
  }
    },
  getters: {
    loadedMeetups (state){
      return state.loadedMeetups.sort((meetupA,meetupB) => {
        return meetupA.date > meetupB.date
      })
    },
  loadedMeetup (state){
      return (meetupId) => {
        return state.loadedMeetups.find((meetup) => {
          return meetup.id===meetupId
        })
      }
    },
  featuredMeetups (state, getters) {
    return getters.loadedMeetups.slice(0, 5)
  },
  user (state){
     return state.user
  },
  error (state) {
    return state.error
  },
  loading (state) {
    return state.loading
  },
}
})
          /* eslint-enable */
