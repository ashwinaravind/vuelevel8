
import * as firebase from 'firebase'
/* eslint-disable */
export default {
  state: {
    loadedMeetups: []

  },
  mutations: {

  setLoadedMeetups(state,payload) {
          state.loadedMeetups=payload
    },
  createMeetup (state,payload) {
          state.loadedMeetups.push(payload)
    },
  updateMeetup (state, payload) {
      const meetup = state.loadedMeetups.find(meetup => {
        return meetup.id === payload.id
      })
      if (payload.title) {
        meetup.title = payload.title
      }
      if (payload.description) {
        meetup.description = payload.description
      }
      if (payload.date) {
        meetup.date = payload.date
      }
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
            //console.log(meetups)
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
          return firebase.storage().ref('meetups/' + key + '.' + ext).getDownloadURL()
        })
        .then(url => {
            imageUrl=url
            return firebase.database().ref('meetups').child(key).update({imageUrl: url})
          })
        .then(() => {
          commit('createMeetup', {
            ...meetup,
            imageUrl: imageUrl,
            id: key
          })
        })
        .catch((error) => {
          console.log(error)
        })
      // Reach out to firebase and store it
    },
    updateMeetupData ({commit}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      if (payload.title) {
        updateObj.title = payload.title
      }
      if (payload.description) {
        updateObj.description = payload.description
      }
      if (payload.date) {
        updateObj.date = payload.date
      }
      firebase.database().ref('meetups').child(payload.id).update(updateObj)
        .then(() => {
          commit('setLoading', false)
          commit('updateMeetup', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },

  logout({commit}) {
    firebase.auth().signOut()
      commit('setUser',null)
    //  console.log('signout')
  }
    },
  getters: {
  loadedMeetups (state){
    //console.log('loadedMeetups:getter');
      return state.loadedMeetups.sort((meetupA,meetupB) => {
        return meetupA.date > meetupB.date
      })
    },
  loadedMeetup (state){
    //  console.log('loadedMeetup:getter');
      return (meetupId) => {
        return state.loadedMeetups.find((meetup) => {
          return meetup.id===meetupId
        })
      }
    },
  featuredMeetups (state, getters) {
  //  console.log('featuredMeetups:getter');
    return getters.loadedMeetups.slice(0, 5)
  },

}
}
          /* eslint-enable */
