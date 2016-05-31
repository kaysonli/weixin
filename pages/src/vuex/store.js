import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  logined: false,
  loading: false,
  devices: [],
  gpsInfo: [],
  activeDevice: {},
  gpsReady: false
}

const mutations = {
  ADD_DEVICE(state, device) {
    state.devices.push(device)
    state.activeDevice = device
  },

  LOAD_DEVICES(state, items) {
    state.devices = items;
    state.activeDevice = items[0];
  },

  DELETE_DEVICE(state, device) {
    state.devices.$remove(device)
  },

  SET_ACTIVE_DEVICE(state, device) {
    state.activeDevice = device
  },

  UPDATE_GPS(state, gpsOfDevices) {
    state.gpsInfo = gpsOfDevices;
    var devMap = {};
    if(gpsOfDevices) {
      gpsOfDevices.forEach(function(gps) {
        devMap[gps.devId] = gps;
      });
    }
    state.devices.forEach(function(dev) {
      dev.gps = devMap[dev.id];
    });
    state.gpsReady = true;
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  },

  SET_LOGIN(state, logined) {
    state.logined = logined;
    if(!logined) {
      state.gpsReady = false;
    }
  },

  OUTDATE_GPS(state) {
    state.gpsReady = false;
  }
}

export default new Vuex.Store({
  state,
  mutations
})