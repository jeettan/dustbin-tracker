import axios from "axios";

export const registerPinAPI = async (formData) => {
    return axios.post(`${process.env.REACT_APP_API_URL}/api/registerPin`, formData, {
        withCredentials: true,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

export const loginAPI = async ({ username, password }) => {

    return axios.post(`${process.env.REACT_APP_API_URL}/api/login`, { username, password }, { withCredentials: true })

}

export const registerAPI = async ({ username, password }) => {
    return axios.post(`${process.env.REACT_APP_API_URL}/api/register-user`, { username, password })

}

export const logoutAPI = async () => {

    return axios.get(`${process.env.REACT_APP_API_URL}/api/logout`, { withCredentials: true })

}

export const authAPI = async () => {

    return axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, { withCredentials: true })
}

export const pinsAPI = async () => {

    return axios.get(`${process.env.REACT_APP_API_URL}/api/pins`)
}