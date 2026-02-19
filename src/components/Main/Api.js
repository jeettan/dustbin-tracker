import axios from "axios";

export const registerPinAPI = async (formData) => {
    return axios.post('http://localhost:3001/registerPin', formData, {
        withCredentials: true,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

export const loginAPI = async ({ username, password }) => {

    return axios.post('http://localhost:3001/login', { username, password }, { withCredentials: true })

}

export const registerAPI = async ({ username, password }) => {
    return axios.post('http://localhost:3001/register-user', { username, password })

}

export const logoutAPI = async () => {

    return axios.get('http://localhost:3001/logout', { withCredentials: true })

}

export const authAPI = async () => {

    return axios.get('http://localhost:3001/auth/profile', { withCredentials: true })
}

export const pinsAPI = async () => {

    return axios.get("http://localhost:3001/pins")
}