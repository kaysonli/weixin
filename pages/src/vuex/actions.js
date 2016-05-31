export const addDevice = ({
    dispatch
}) => {
    dispatch('ADD_DEVICE')
}

export const loadDevices = ({
    dispatch
}, items) => {
    dispatch('LOAD_DEVICES', items)
}

export const deleteDevice = ({
    dispatch
}, device) => {
    dispatch('DELETE_DEVICE', device)
}

export const updateActiveDevice = ({
    dispatch
}, device) => {
    dispatch('SET_ACTIVE_DEVICE', device)
}

export const updateGPS = ({
    dispatch
}, gpsInfo) => {
    dispatch('UPDATE_GPS', gpsInfo)
}

export const setLoading = ({
    dispatch
}, loading) => {
    dispatch('SET_LOADING', loading)
}

export const setLogined = ({
  dispatch
}, logined) => {
  dispatch('SET_LOGIN', logined)
}

export const outdateGPS = ({
  dispatch
}) => {
  dispatch('OUTDATE_GPS')
}